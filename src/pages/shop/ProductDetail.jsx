import { useEffect, useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw, ChevronLeft } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { getProductBySlug } from '../../lib/api'
import { formatPrice } from '../../lib/constants'
import Stars from '../../components/Stars'
import ProductCard from '../../components/ProductCard'

export default function ProductDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { products, addToCart, favorites, toggleFavorite } = useStore()
  const [product, setProduct] = useState(null)
  const [activeImg, setActiveImg] = useState(0)
  const [color, setColor] = useState('')
  const [storage, setStorage] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    let alive = true
    getProductBySlug(slug).then((p) => {
      if (!alive) return
      setProduct(p)
      setActiveImg(0)
      setColor(p?.colors?.[0]?.name || '')
      setStorage(p?.storage?.[0]?.label || '')
      setQty(1)
    }).catch(() => setProduct(null))
    return () => { alive = false }
  }, [slug])

  const priceDelta = useMemo(() => {
    const s = product?.storage?.find((x) => x.label === storage)
    return s?.delta || 0
  }, [product, storage])

  const finalPrice = product ? product.price + priceDelta : 0
  const related = useMemo(
    () => products.filter((p) => p.id !== product?.id && p.category === product?.category).slice(0, 4),
    [products, product]
  )

  if (!product) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-semibold text-nuit">Chargement du produit...</p>
        <Link to="/boutique" className="mt-4 inline-flex text-sm font-semibold text-[var(--color-primary)]">
          <ChevronLeft size={16} className="mr-1" /> Retour à la boutique
        </Link>
      </div>
    )
  }

  const isFav = favorites.includes(product.id)

  return (
    <div className="container-x py-10 lg:py-14">
      <nav className="mb-8 flex items-center gap-2 text-sm text-nuit/50">
        <Link to="/" className="hover:text-nuit">Accueil</Link> /
        <Link to="/boutique" className="hover:text-nuit">Boutique</Link> /
        <Link to={`/boutique?cat=${product.category}`} className="hover:text-nuit">{product.category}</Link> /
        <span className="text-nuit">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex gap-4">
          <div className="flex shrink-0 flex-col gap-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`h-20 w-20 overflow-hidden rounded-2xl bg-cloud ring-2 transition ${activeImg === i ? 'ring-[var(--color-primary)]' : 'ring-transparent hover:ring-gray-200'}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden rounded-3xl bg-cloud ring-1 ring-gray-100">
            <img src={product.images[activeImg]} alt={product.name} className="aspect-square w-full object-contain p-8" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="badge bg-cloud text-[11px] uppercase tracking-wide text-nuit/50">{product.brand}</span>
            {product.old_price > product.price && (
              <span className="badge bg-[var(--color-primary)] text-white">
                -{Math.round((1 - product.price / product.old_price) * 100)}%
              </span>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-nuit sm:text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars rating={product.rating} size={16} />
            <span className="text-sm text-nuit/50">{product.rating} • {product.reviews_count} avis</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-nuit">{formatPrice(finalPrice)}</span>
            {product.old_price > product.price && (
              <span className="text-lg text-gray-400 line-through">{formatPrice(product.old_price + priceDelta)}</span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-nuit/60">{product.description}</p>

          {product.colors?.length > 0 && (
            <div className="mt-7">
              <p className="mb-3 text-sm font-bold text-nuit">Couleur : <span className="font-medium text-nuit/60">{color}</span></p>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    title={c.name}
                    className={`h-10 w-10 rounded-full ring-2 transition ${color === c.name ? 'ring-[var(--color-primary)] ring-offset-2' : 'ring-gray-200 hover:ring-gray-300'}`}
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.storage?.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-sm font-bold text-nuit">Stockage</p>
              <div className="flex flex-wrap gap-2.5">
                {product.storage.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setStorage(s.label)}
                    className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition ${storage === s.label ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-gray-200 text-nuit/60 hover:border-gray-300'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-2xl border border-gray-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 text-nuit/60 hover:text-nuit"><Minus size={16} /></button>
              <span className="w-10 text-center text-sm font-bold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} className="p-3 text-nuit/60 hover:text-nuit"><Plus size={16} /></button>
            </div>
            <button
              onClick={() =>
                addToCart({ product_id: product.id, name: product.name, price: finalPrice, qty, color, storage, image: product.images[0], slug: product.slug })
              }
              disabled={product.stock <= 0}
              className="btn-primary flex-1 py-4 sm:flex-none sm:px-10"
            >
              <ShoppingCart size={18} /> Ajouter au panier
            </button>
            <button
              onClick={() => toggleFavorite(product.id, product.name)}
              className={`flex h-14 w-14 items-center justify-center rounded-2xl border transition ${isFav ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-nuit/50 hover:border-gray-300'}`}
            >
              <Heart size={20} className={isFav ? 'fill-red-500' : ''} />
            </button>
          </div>

          <div className={`mt-4 text-sm font-semibold ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {product.stock > 0 ? `● En stock (${product.stock} disponibles)` : '● Rupture de stock'}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 rounded-3xl bg-cloud/70 p-5 text-center text-xs font-semibold text-nuit/60">
            <div className="flex flex-col items-center gap-1.5"><Truck size={18} className="text-[var(--color-primary)]" />Livraison rapide</div>
            <div className="flex flex-col items-center gap-1.5"><ShieldCheck size={18} className="text-[var(--color-primary)]" />100% authentique</div>
            <div className="flex flex-col items-center gap-1.5"><RotateCcw size={18} className="text-[var(--color-primary)]" />Retour 7 jours</div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-2xl font-extrabold text-nuit">Vous aimerez aussi</h2>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
