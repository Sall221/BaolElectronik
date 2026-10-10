import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, MessageCircle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../../context/StoreContext'
import { createOrder, buildWhatsAppMessage, saveClient } from '../../lib/api'
import { formatPrice } from '../../lib/constants'

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, cartTotal, clearCart, settings, refresh } = useStore()
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', city: '', address: '' })
  const navigate = useNavigate()

  const checkout = async () => {
    if (cart.length === 0) return
    if (!customer.name.trim()) return toast.error('Indiquez votre nom complet')
    if (!customer.phone.trim() || customer.phone.replace(/\D/g, '').length < 6) return toast.error('Indiquez un numéro de téléphone valide')
    if (!customer.address.trim()) return toast.error('Indiquez votre adresse de livraison')
    if (customer.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) return toast.error('Indiquez un email valide')
    setLoading(true)
    try {
      const order = await createOrder({
        items: cart.map(({ key, ...rest }) => rest),
        total: cartTotal,
        status: 'confirmed',
        customer_name: customer.name.trim(),
        customer_phone: customer.phone.trim(),
        customer_email: customer.email.trim(),
        customer_city: customer.city.trim(),
        customer_address: customer.address.trim(),
        note: 'Commande validée via le site — coordonnées de livraison renseignées par le client'
      })
      try {
        await saveClient({
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim(),
          city: customer.city.trim(),
          address: customer.address.trim()
        })
      } catch {
        /* l'enregistrement du client ne bloque pas la commande */
      }
      const url = buildWhatsAppMessage(order, settings)
      clearCart()
      await refresh()
      toast.success('Commande passée ! Rejoignez-nous sur WhatsApp pour confirmer.')
      window.open(url, '_blank')
      navigate(`/commande/${order.id}`)
    } catch (e) {
      toast.error('Impossible de créer la commande. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container-x flex flex-col items-center justify-center py-28 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-cloud text-nuit/25">
          <ShoppingCart size={34} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-nuit">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-nuit/50">Découvrez nos smartphones et accessoires premium.</p>
        <Link to="/boutique" className="btn-primary mt-7">Explorer la boutique</Link>
      </div>
    )
  }

  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-nuit">Mon Panier</h1>
      <p className="mt-2 text-sm text-nuit/50">{cart.length} article(s)</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cart.map((item) => (
            <div key={item.key} className="flex gap-4 rounded-3xl bg-white p-4 shadow-soft ring-1 ring-gray-100 sm:p-5">
              <Link to={`/produit/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-cloud sm:h-28 sm:w-28">
                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link to={`/produit/${item.slug}`} className="text-sm font-bold text-nuit hover:text-[var(--color-primary)]">{item.name}</Link>
                    <p className="mt-1 text-xs text-nuit/50">
                      {[item.color, item.storage].filter(Boolean).join(' • ')}
                    </p>
                  </div>
                  <button onClick={() => removeFromCart(item.key)} className="rounded-xl p-2 text-nuit/40 transition hover:bg-red-50 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-xl border border-gray-200">
                    <button onClick={() => updateCartQty(item.key, item.qty - 1)} className="p-2 text-nuit/50 hover:text-nuit"><Minus size={14} /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.key, item.qty + 1)} className="p-2 text-nuit/50 hover:text-nuit"><Plus size={14} /></button>
                  </div>
                  <span className="text-base font-extrabold text-nuit">{formatPrice(item.price * item.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-3xl bg-nuit p-6 text-white shadow-card lg:sticky lg:top-28">
          <h2 className="text-lg font-extrabold">Résumé de la commande</h2>
          <div className="mt-5 space-y-3 border-b border-white/10 pb-5 text-sm">
            {cart.map((item) => (
              <div key={item.key} className="flex justify-between text-white/60">
                <span className="line-clamp-2 pr-3">{item.name} × {item.qty}</span>
                <span className="shrink-0 font-semibold text-white">{formatPrice(item.price * item.qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-baseline justify-between">
            <span className="text-sm text-white/60">Sous-total</span>
            <span className="text-sm font-semibold">{formatPrice(cartTotal)}</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm text-white/60">Livraison</span>
            <span className="text-sm font-semibold text-emerald-400">Gratuite</span>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
            <span className="font-bold">Total</span>
            <span className="text-2xl font-extrabold">{formatPrice(cartTotal)}</span>
          </div>

          <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
            <p className="text-sm font-bold text-white">Vos coordonnées</p>
            <input
              value={customer.name}
              onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))}
              placeholder="Nom complet *"
              className="input border-0 bg-white/10 py-3 text-white placeholder:text-white/40"
            />
            <input
              value={customer.phone}
              onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
              placeholder="Numéro de téléphone *"
              type="tel"
              className="input border-0 bg-white/10 py-3 text-white placeholder:text-white/40"
            />
            <input
              value={customer.email}
              onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))}
              placeholder="Email (optionnel)"
              type="email"
              className="input border-0 bg-white/10 py-3 text-white placeholder:text-white/40"
            />
            <input
              value={customer.city}
              onChange={(e) => setCustomer((c) => ({ ...c, city: e.target.value }))}
              placeholder="Ville (optionnel)"
              className="input border-0 bg-white/10 py-3 text-white placeholder:text-white/40"
            />
            <input
              value={customer.address}
              onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
              placeholder="Adresse de livraison *"
              className="input border-0 bg-white/10 py-3 text-white placeholder:text-white/40"
            />
            <p className="text-xs leading-relaxed text-white/50">
              Ces informations accompagnent votre commande et seront envoyées dans la discussion WhatsApp.
            </p>
          </div>

          <button onClick={checkout} disabled={loading} className="btn-primary mt-5 w-full py-4">
            <MessageCircle size={18} /> {loading ? 'Envoi en cours...' : 'Passer la commande'}
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-white/50">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-emerald-400" />
            En confirmant, votre commande est enregistrée comme validée et nous la retrouvons sur WhatsApp pour finaliser.
          </p>
          <Link to="/boutique" className="mt-5 flex items-center justify-center gap-1 text-xs font-semibold text-white/60 transition hover:text-white">
            Continuer mes achats <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
