import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import ProductCard from '../../components/ProductCard'

export default function Favorites() {
  const { products, favorites } = useStore()
  const list = products.filter((p) => favorites.includes(p.id))

  return (
    <div className="container-x py-14">
      <h1 className="text-3xl font-extrabold tracking-tight text-nuit">Mes Favoris</h1>
      <p className="mt-2 text-sm text-nuit/50">{list.length} produit(s) sauvegardé(s)</p>
      {list.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <Heart size={40} className="text-nuit/15" />
          <p className="mt-4 font-semibold text-nuit">Aucun favori pour l'instant</p>
          <Link to="/boutique" className="btn-primary mt-5">Découvrir les produits</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}
