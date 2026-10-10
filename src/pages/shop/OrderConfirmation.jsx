import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, MessageCircle, Home, Package, MapPin, Mail } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { getOrder, buildWhatsAppMessage, buildOrderFollowUpUrl } from '../../lib/api'
import { formatPrice, ORDER_STATUS } from '../../lib/constants'

export default function OrderConfirmation() {
  const { id } = useParams()
  const { settings } = useStore()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    getOrder(id).then(setOrder).catch(() => setOrder(null))
  }, [id])

  if (!order) {
    return <div className="container-x py-28 text-center font-semibold text-nuit">Chargement de la commande...</div>
  }

  const status = ORDER_STATUS[order.status] || ORDER_STATUS.pending

  return (
    <div className="container-x max-w-2xl py-16">
      <div className="rounded-3xl bg-white p-8 text-center shadow-card ring-1 ring-gray-100">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 size={34} />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-nuit">Commande passée !</h1>
        <p className="mt-2 text-sm leading-relaxed text-nuit/60">
          Merci {order.customer_name} ! Votre commande <span className="font-bold text-nuit">{order.number}</span> a bien été
          enregistrée et validée. Rejoignez-nous sur WhatsApp pour confirmer vos informations de livraison.
        </p>
        <span className={`badge mt-4 ${status.color}`}>{status.label}</span>

        <div className="mt-7 space-y-3 rounded-2xl bg-cloud/70 p-5 text-left">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center gap-3">
              <img src={it.image} alt={it.name} className="h-12 w-12 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-nuit">{it.name}</p>
                <p className="text-xs text-nuit/50">{[it.color, it.storage].filter(Boolean).join(' • ')} — ×{it.qty}</p>
              </div>
              <span className="text-sm font-bold text-nuit">{formatPrice(it.price * it.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-gray-200 pt-3">
            <span className="text-sm font-bold text-nuit">Total</span>
            <span className="text-lg font-extrabold text-[var(--color-primary)]">{formatPrice(order.total)}</span>
          </div>
        </div>

        {(order.customer_email || order.customer_city || order.customer_address) && (
          <div className="mt-4 space-y-2 rounded-2xl bg-white p-5 text-left ring-1 ring-gray-100">
            <p className="text-xs font-bold uppercase tracking-wide text-nuit/40">Livraison</p>
            {order.customer_email && (
              <p className="flex items-center gap-2 text-sm text-nuit/70"><Mail size={14} className="text-nuit/40" /> {order.customer_email}</p>
            )}
            {order.customer_city && (
              <p className="flex items-center gap-2 text-sm text-nuit/70"><MapPin size={14} className="text-nuit/40" /> {order.customer_city}</p>
            )}
            {order.customer_address && (
              <p className="flex items-center gap-2 text-sm text-nuit/70"><Home size={14} className="text-nuit/40" /> {order.customer_address}</p>
            )}
          </div>
        )}

        <a href={buildWhatsAppMessage(order, settings)} target="_blank" rel="noreferrer" className="btn-primary mt-7 w-full bg-emerald-600 py-4 hover:bg-emerald-500">
          <MessageCircle size={18} /> Rejoindre sur WhatsApp pour confirmer
        </a>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link to="/" className="btn-secondary py-3"><Home size={15} /> Accueil</Link>
          <Link to="/boutique" className="btn-secondary py-3"><Package size={15} /> Boutique</Link>
        </div>
        <p className="mt-5 text-xs text-nuit/40">
          Une commande passée est considérée comme validée. Pour toute annulation, contactez-nous directement sur WhatsApp.
        </p>
      </div>
    </div>
  )
}
