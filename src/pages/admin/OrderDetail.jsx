import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, User, Phone, Package, Mail, Home } from 'lucide-react'
import { getOrder } from '../../lib/api'
import { formatPrice, formatDate, ORDER_STATUS } from '../../lib/constants'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    getOrder(id).then((o) => setOrder(o))
  }, [id])

  if (!order) return <div className="text-nuit/50">Chargement...</div>
  const st = ORDER_STATUS[order.status] || ORDER_STATUS.pending

  return (
    <div className="max-w-3xl space-y-6">
      <Link to="/admin/commandes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-nuit/60 hover:text-nuit">
        <ArrowLeft size={15} /> Retour aux commandes
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-nuit">Commande {order.number}</h1>
          <p className="mt-1 text-sm text-nuit/50">Passée le {formatDate(order.created_at)}</p>
        </div>
        <span className={`badge border-0 ${st.color}`}>{st.label}</span>
      </div>

      <div className="admin-card">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-nuit"><Package size={16} /> Articles</h2>
        <div className="space-y-3">
          {(order.items || []).map((it, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl bg-cloud/60 p-3">
              <img src={it.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-sm font-bold text-nuit">{it.name}</p>
                <p className="text-xs text-nuit/50">{[it.color, it.storage].filter(Boolean).join(' • ')}</p>
              </div>
              <span className="text-sm text-nuit/50">× {it.qty}</span>
              <span className="w-28 text-right text-sm font-bold text-nuit">{formatPrice(it.price * it.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-100 pt-4">
            <span className="font-bold text-nuit">Total</span>
            <span className="text-xl font-extrabold text-[var(--color-primary)]">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <h2 className="mb-4 text-base font-bold text-nuit">Client</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl bg-cloud/60 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-nuit/50"><User size={15} /></span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-nuit/40">Nom</p>
              <p className="truncate font-semibold text-nuit">{order.customer_name || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-cloud/60 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-nuit/50"><Phone size={15} /></span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-nuit/40">Téléphone</p>
              <p className="truncate font-semibold text-nuit">{order.customer_phone || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-cloud/60 p-3 sm:col-span-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-nuit/50"><Mail size={15} /></span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-nuit/40">Email</p>
              <p className="truncate font-semibold text-nuit">{order.customer_email || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-cloud/60 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-nuit/50"><MapPin size={15} /></span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-nuit/40">Ville</p>
              <p className="truncate font-semibold text-nuit">{order.customer_city || '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-cloud/60 p-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-nuit/50"><Home size={15} /></span>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-nuit/40">Adresse de livraison</p>
              <p className="truncate font-semibold text-nuit">{order.customer_address || '—'}</p>
            </div>
          </div>
        </div>
        {order.note && <p className="mt-3 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800">{order.note}</p>}
      </div>
    </div>
  )
}