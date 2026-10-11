import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import toast from 'react-hot-toast'
import { getProducts, getSettings, getOrders, saveSettings as apiSaveSettings } from '../lib/api'
import { DEMO_SETTINGS } from '../lib/demoData'
import { normalizeCategories } from '../lib/constants'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [settings, setSettings] = useState(DEMO_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('baol_cart')) || [] } catch { return [] }
  })
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('baol_favorites')) || [] } catch { return [] }
  })

const retry = async (fn, attempts = 3, baseDelay = 1000) => {
  let lastErr
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (i < attempts - 1) await new Promise((r) => setTimeout(r, baseDelay * (i + 1)))
    }
  }
  throw lastErr
}

const refresh = useCallback(async () => {
  const [p, s, o] = await Promise.allSettled([
    retry(() => getProducts()),
    retry(() => getSettings()),
    retry(() => getOrders()),
  ])
  if (p.status === 'fulfilled') setProducts(Array.isArray(p.value) ? p.value : [])
  if (o.status === 'fulfilled') setOrders(Array.isArray(o.value) ? o.value : [])
  if (s.status === 'fulfilled') setSettings({ ...DEMO_SETTINGS, ...(s.value || {}) })
  if (p.status === 'rejected' && o.status === 'rejected' && s.status === 'rejected') {
    toast(
      (t) => (
        <div className="flex items-center gap-3">
          <span>Erreur de chargement des données</span>
          <button
            className="rounded-lg bg-nuit px-3 py-1.5 text-xs font-bold text-white"
            onClick={() => { toast.dismiss(t.id); refresh() }}
          >
            Réessayer
          </button>
        </div>
      ),
      { duration: 12000 },
    )
  }
  setLoading(false)
}, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    localStorage.setItem('baol_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('baol_favorites', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    if (settings?.primary) {
      document.documentElement.style.setProperty('--color-primary', settings.primary)
      document.documentElement.style.setProperty('--color-secondary', settings.secondary || '#0A1929')
    }
  }, [settings.primary, settings.secondary])

  useEffect(() => {
    if (!settings?.favicon) return
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = settings.favicon
  }, [settings.favicon])

  const categories = useMemo(() => normalizeCategories(settings?.categories), [settings.categories])

  const stats = useMemo(() => {
    const clients = new Set(orders.map((o) => o.customer_phone || o.customer_name).filter(Boolean)).size
    const rated = products.filter((p) => Number(p.rating) > 0)
    const rating = rated.length ? rated.reduce((s, p) => s + Number(p.rating), 0) / rated.length : 0
    return { clients, products: products.length, rating }
  }, [orders, products])

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const key = `${item.product_id}-${item.color || ''}-${item.storage || ''}`
      const found = prev.find((c) => c.key === key)
      if (found) {
        return prev.map((c) => (c.key === key ? { ...c, qty: c.qty + item.qty } : c))
      }
      return [...prev, { ...item, key }]
    })
    toast.success(`${item.name} ajouté au panier`)
  }, [])

  const updateCartQty = useCallback((key, qty) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((c) => c.key !== key) : prev.map((c) => (c.key === key ? { ...c, qty } : c))
    )
  }, [])

  const removeFromCart = useCallback((key) => {
    setCart((prev) => prev.filter((c) => c.key !== key))
    toast.success('Article retiré du panier')
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const toggleFavorite = useCallback((productId, name) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        toast.success('Retiré des favoris')
        return prev.filter((id) => id !== productId)
      }
      toast.success('Ajouté aux favoris')
      return [...prev, productId]
    })
  }, [])

  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((s, c) => s + c.price * c.qty, 0), [cart])

  const updateSettings = useCallback(async (next) => {
    const merged = { ...settings, ...next }
    setSettings(merged)
    await apiSaveSettings(merged)
    return merged
  }, [settings])

  const value = {
    products, setProducts, orders, loading, refresh,
    settings, updateSettings, categories, stats,
    cart, addToCart, updateCartQty, removeFromCart, clearCart, cartCount, cartTotal,
    favorites, toggleFavorite
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
