import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Eye, Pencil, Trash2, Plus } from 'lucide-react'
import { getOrders, updateOrderStatus, deleteOrder } from '../../lib/api'
import { formatPrice, formatDate, ORDER_STATUS } from '../../lib/constants'
import toast from 'react-hot-toast'
import { useStore } from '../../context/StoreContext'
import Pagination from '../../components/Pagination'

const SIZES = [8, 12, 24, 48]

const FILTERS = [
  { key: '', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'confirmed', label: 'Validée' },
  { key: 'shipped', label: 'Expédié' },
  { key: 'delivered', label: 'Livré' },
  { key: 'cancelled', label: 'Annulé' }
]

export default function AdminOrders() {
  const { products } = useStore()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(SIZES[0])

  const load = () => getOrders().then(setOrders).catch(() => setOrders([]))
  useEffect(() => { load() }, [products])
  useEffect(() => { setPage(1) }, [filter, q])

  const list = useMemo(() => {
    return orders.filter((o) => {
      if (filter && o.status !== filter) return false
      if (q) {
        const s = q.toLowerCase()
        return (o.number || '').toLowerCase().includes(s) || (o.customer_name || '').toLowerCase().includes(s) || (o.customer_phone || '').toLowerCase().includes(s)
      }
      return true
    })
  }, [orders, filter, q])

  const pageCount = Math.max(1, Math.ceil(list.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const shown = list.slice((safePage - 1) * pageSize, safePage * pageSize)

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
      toast.success('Statut mis à jour')
    } catch {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const remove = async (order) => {
    if (!window.confirm(`Supprimer la commande ${order.number} ?`)) return
    try {
      await deleteOrder(order.id)
      setOrders((prev) => prev.filter((o) => o.id !== order.id))
      toast.success('Commande supprimée')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-nuit">Commandes</h1>
          <p className="mt-1 text-sm text-nuit/50">{orders.length} commande(s) au total</p>
        </div>
        <Link to="/admin/commandes/nouvelle" className="btn-primary py-3">
          <Plus size={16} /> Nouvelle commande
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`badge py-1.5 transition ${filter === f.key ? 'bg-[var(--color-primary)] text-white' : 'bg-white text-nuit/60 ring-1 ring-gray-200 hover:ring-gray-300'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="N°, client, téléphone..." className="input max-w-xs bg-white" />
      </div>

      <div className="admin-card overflow-x-auto p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-nuit/40">
              <th className="p-4">Réf.</th>
              <th className="p-4">Client</th>
              <th className="p-4">Articles</th>
              <th className="p-4">Total</th>
              <th className="p-4">Statut</th>
              <th className="p-4">Date</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {shown.map((o) => {
              const st = ORDER_STATUS[o.status] || ORDER_STATUS.pending
              return (
                <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-cloud/50">
                  <td className="p-4 font-bold text-nuit">{o.number}</td>
                  <td className="p-4">
                    <p className="font-semibold text-nuit">{o.customer_name || '—'}</p>
                    <p className="text-xs text-nuit/40">{o.customer_phone || 'Infos sur WhatsApp'}</p>
                  </td>
                  <td className="p-4 text-nuit/60">{(o.items || []).length} article(s)</td>
                  <td className="p-4 font-bold">{formatPrice(o.total)}</td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => changeStatus(o.id, e.target.value)}
                      className={`badge cursor-pointer border-0 ${st.color}`}
                    >
                      {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                  <td className="p-4 text-nuit/50">{formatDate(o.created_at)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Link to={`/admin/commandes/${o.id}`} className="rounded-xl p-2 text-nuit/50 transition hover:bg-cloud hover:text-[var(--color-primary)]" title="Détails">
                        <Eye size={16} />
                      </Link>
                      <Link to={`/admin/commandes/${o.id}/modifier`} className="rounded-xl p-2 text-nuit/50 transition hover:bg-cloud hover:text-[var(--color-primary)]" title="Modifier">
                        <Pencil size={16} />
                      </Link>
                      <button onClick={() => remove(o)} className="rounded-xl p-2 text-nuit/50 transition hover:bg-red-50 hover:text-red-500" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <ClipboardList size={32} className="mx-auto text-nuit/15" />
                  <p className="mt-3 text-sm font-semibold text-nuit/50">Aucune commande</p>
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
