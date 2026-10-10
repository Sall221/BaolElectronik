import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Search, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../../context/StoreContext'
import { deleteProduct } from '../../lib/api'
import { formatPrice } from '../../lib/constants'
import Pagination from '../../components/Pagination'

const SIZES = [8, 12, 24]

export default function AdminProducts() {
  const { products, refresh } = useStore()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(SIZES[0])
  const [list, setList] = useState(products)

  useEffect(() => {
    const s = q.toLowerCase()
    setList(products.filter((p) => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)))
    setPage(1)
  }, [products, q])

  const pageCount = Math.max(1, Math.ceil(list.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const shown = list.slice((safePage - 1) * pageSize, safePage * pageSize)

  const remove = async (id, name) => {
    if (!window.confirm(`Supprimer « ${name} » ?`)) return
    try {
      await deleteProduct(id)
      await refresh()
      toast.success('Produit supprimé')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-nuit">Produits</h1>
          <p className="mt-1 text-sm text-nuit/50">{products.length} produit(s)</p>
        </div>
        <Link to="/admin/produits/nouveau" className="btn-primary py-3">
          <Plus size={16} /> Nouveau produit
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit..." className="input bg-white pl-10" />
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-nuit/40">
              <th className="p-4">Produit</th>
              <th className="p-4">Catégorie</th>
              <th className="p-4">Prix</th>
              <th className="p-4">Stock</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id} className="border-b border-gray-50 transition last:border-0 hover:bg-cloud/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]} alt="" className="h-12 w-12 rounded-xl bg-cloud object-cover" />
                    <div>
                      <p className="font-bold text-nuit">{p.name}</p>
                      <p className="text-xs text-nuit/40">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-nuit/60">{p.category}</td>
                <td className="p-4">
                  <span className="font-bold text-nuit">{formatPrice(p.price)}</span>
                  {p.old_price > p.price && <span className="ml-1 text-xs text-gray-400 line-through">{formatPrice(p.old_price)}</span>}
                </td>
                <td className="p-4">
                  <span className={`badge ${p.stock > 5 ? 'bg-emerald-50 text-emerald-600' : p.stock > 0 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/produits/${p.id}`} className="rounded-xl p-2 text-nuit/50 transition hover:bg-cloud hover:text-[var(--color-primary)]">
                      <Pencil size={16} />
                    </Link>
                    <button onClick={() => remove(p.id, p.name)} className="rounded-xl p-2 text-nuit/50 transition hover:bg-red-50 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center">
                  <Package size={32} className="mx-auto text-nuit/15" />
                  <p className="mt-3 text-sm font-semibold text-nuit/50">Aucun produit trouvé</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination page={safePage} pageSize={pageSize} total={list.length} onChange={setPage} onSizeChange={(s) => { setPageSize(s); setPage(1) }} sizes={SIZES} />
    </div>
  )
}
