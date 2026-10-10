import { Tag } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import ProductCard from '../../components/ProductCard'

export default function Promos() {
  const { products, settings } = useStore()
  const deals = products.filter((p) => p.old_price && p.old_price > p.price)

  return (
    <div>
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-nuit py-14">
        <div className="container-x text-center">
          <span className="badge bg-white/15 text-white"><Tag size={12} className="mr-1" /> Promotions</span>
          <h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{settings?.promo?.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">{settings?.promo?.text}</p>
        </div>
      </div>
      <div className="container-x py-14">
        {deals.length === 0 ? (
          <p className="py-16 text-center text-nuit/50">Aucune promotion pour le moment. Revenez bientôt !</p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
            {deals.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  )
}
