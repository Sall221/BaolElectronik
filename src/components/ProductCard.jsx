import { Link } from 'react-router-dom'
import { ShoppingCart, Heart } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { formatPrice } from '../lib/constants'
import Stars from './Stars'

export default function ProductCard({ product, className = '' }) {
  const { addToCart, favorites, toggleFavorite } = useStore()
  const isFav = favorites.includes(product.id)
  const discount = product.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0

  return (
    <div className={`card group relative overflow-hidden ${className}`}>
      {discount > 0 && (
        <span className="absolute left-4 top-4 z-10 badge bg-[var(--color-primary)] text-white shadow-soft">-{discount}%</span>
      )}
      <button
        onClick={() => toggleFavorite(product.id, product.name)}
        className={`absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-soft transition hover:scale-110 ${isFav ? 'text-red-500' : 'text-gray-400'}`}
        aria-label="Favori"
      >
        <Heart size={16} className={isFav ? 'fill-red-500' : ''} />
      </button>

      <Link to={`/produit/${product.slug}`} className="block overflow-hidden bg-cloud">
        <div className="aspect-square p-6">
          <img
            src={product.images?.[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>
      </Link>

      <div className="space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="badge bg-cloud text-[11px] uppercase tracking-wide text-nuit/50">{product.brand}</span>
          <span className="flex items-center gap-1 text-xs text-nuit/50">
            <Stars rating={product.rating} size={12} />
            ({product.reviews_count || 0})
          </span>
        </div>
        <Link to={`/produit/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-bold text-nuit transition group-hover:text-[var(--color-primary)]">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-extrabold text-nuit">{formatPrice(product.price)}</span>
          {product.old_price > product.price && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.old_price)}</span>
          )}
        </div>
        <button
          onClick={() =>
            addToCart({
              product_id: product.id, name: product.name, price: product.price,
              qty: 1, color: product.colors?.[0]?.name || '', storage: product.storage?.[0]?.label || '',
              image: product.images?.[0], slug: product.slug
            })
          }
          disabled={product.stock <= 0}
          className="btn-primary w-full py-2.5 text-xs"
        >
          <ShoppingCart size={14} />
          {product.stock > 0 ? 'Ajouter au panier' : 'Rupture de stock'}
        </button>
      </div>
    </div>
  )
}
