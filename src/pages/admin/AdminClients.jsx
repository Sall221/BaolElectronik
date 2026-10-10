import { useEffect, useMemo, useState } from 'react'
import { Users, ShoppingBag, Phone, MapPin, Mail, Plus, Eye, Pencil, Trash2, Save, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getClients, saveClient, deleteClient, getOrders } from '../../lib/api'
import { formatPrice, formatDate } from '../../lib/constants'
import Pagination from '../../components/Pagination'

const SIZES = [8, 12, 24]

const empty = { name: '', phone: '', email: '', city: '', address: '', note: '' }

function ClientModal({ client, onClose, onSaved }) {
  const [form, setForm] = useState({ ...empty, ...client })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name && !form.phone) return toast.error('Nom ou téléphone requis')
    setSaving(true)
    try {
      await saveClient(form)
      toast.success(client?.id ? 'Client mis à jour' : 'Client ajouté')
      onSaved()
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-nuit/60" onClick={onClose} />
      <form onSubmit={submit} className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-nuit">{client?.id ? 'Modifier le client' : 'Nouveau client'}</h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-nuit/40 hover:bg-cloud hover:text-nuit"><X size={16} /></button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nom complet</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Aminata Diop" />
          </div>
          <div>
            <label className="label">Téléphone</label>
            <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+221 77 000 00 00" />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="client@email.com" />
          </div>
          <div>
            <label className="label">Ville</label>
            <input className="input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Dakar" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Adresse</label>
            <input className="input" value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Quartier, rue, repère..." />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Note</label>
            <textarea className="input min-h-[70px]" value={form.note} onChange={(e) => set('note', e.target.value)} />
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary py-3">
            <Save size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={onClose} className="btn-secondary py-3">Annuler</button>
        </div>
      </form>
    </div>
  )
}

function ClientDetails({ client, stats, onClose, onEdit }) {
  const rows = [
    { icon: Phone, label: 'Téléphone', value: client.phone || '—' },
    { icon: Mail, label: 'Email', value: client.email || '—' },
    { icon: MapPin, label: 'Ville', value: client.city || '—' },
    { icon: MapPin, label: 'Adresse', value: client.address || '—' }
  ]
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-nuit/60" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-nuit">Fiche client</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-nuit/40 hover:bg-cloud hover:text-nuit"><X size={16} /></button>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-xl font-extrabold text-[var(--color-primary)]">
            {(client.name || '?').charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-bold text-nuit">{client.name || 'Sans nom'}</p>
            <p className="text-xs text-nuit/50">Client depuis {formatDate(client.created_at)}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-cloud/70 p-4 text-center">
          <div>
            <p className="flex items-center justify-center gap-1 text-lg font-extrabold text-nuit"><ShoppingBag size={14} /> {stats.orders}</p>
            <p className="text-[11px] text-nuit/50">Commandes</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-[var(--color-primary)]">{formatPrice(stats.spent)}</p>
            <p className="text-[11px] text-nuit/50">Total dépensé</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 text-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cloud text-nuit/50"><Icon size={15} /></span>
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-nuit/40">{label}</p>
                <p className="truncate font-medium text-nuit">{value}</p>
              </div>
            </div>
          ))}
          {client.note && <p className="rounded-2xl bg-amber-50 p-3 text-xs text-amber-800">{client.note}</p>}
        </div>
        <button onClick={onEdit} className="btn-primary mt-6 w-full py-3">
          <Pencil size={15} /> Modifier les informations
        </button>
      </div>
    </div>
  )
}

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [orders, setOrders] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(SIZES[0])
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [details, setDetails] = useState(null)

  const load = () => {
    getClients().then(setClients).catch(() => setClients([]))
    getOrders().then(setOrders).catch(() => setOrders([]))
  }
  useEffect(() => { load() }, [])
  useEffect(() => { setPage(1) }, [q])

  const statsFor = useMemo(() => (client) => {
    const key = client.phone || client.name
    const mine = orders.filter((o) => (o.customer_phone || o.customer_name) === key)
    return {
      orders: mine.length,
      spent: mine.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + (Number(o.total) || 0), 0)
    }
  }, [orders])

  const list = useMemo(() => {
    if (!q) return clients
    const s = q.toLowerCase()
    return clients.filter((c) =>
      [c.name, c.phone, c.email, c.city].some((v) => (v || '').toLowerCase().includes(s))
    )
  }, [clients, q])

  const pageCount = Math.max(1, Math.ceil(list.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const shown = list.slice((safePage - 1) * pageSize, safePage * pageSize)

  const remove = async (client) => {
    if (!window.confirm(`Supprimer le client « ${client.name || client.phone} » ?`)) return
    try {
      await deleteClient(client.id)
      setClients((prev) => prev.filter((c) => c.id !== client.id))
      toast.success('Client supprimé')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-nuit">Clients</h1>
          <p className="mt-1 text-sm text-nuit/50">{clients.length} client(s)</p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary py-3">
          <Plus size={16} /> Ajouter un client
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un client..." className="input bg-white pl-10" />
      </div>

      {list.length === 0 ? (
        <div className="admin-card flex flex-col items-center py-16 text-center">
          <Users size={36} className="text-nuit/15" />
          <p className="mt-4 font-semibold text-nuit/50">Aucun client enregistré pour le moment</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((c) => {
            const stats = statsFor(c)
            return (
              <div key={c.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-gray-100">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 font-extrabold text-[var(--color-primary)]">
                  {(c.name || '?').charAt(0).toUpperCase()}
                </span>
                <div className="min-w-[160px] flex-1">
                  <p className="font-bold text-nuit">{c.name || 'Sans nom'}</p>
                  <p className="flex items-center gap-1 text-xs text-nuit/50"><Phone size={11} /> {c.phone || '—'}</p>
                </div>
                <div className="hidden min-w-[160px] flex-1 md:block">
                  <p className="flex items-center gap-1 text-sm text-nuit/70"><Mail size={12} /> {c.email || '—'}</p>
                  <p className="flex items-center gap-1 text-xs text-nuit/40"><MapPin size={11} /> {c.city || '—'}</p>
                </div>
                <div className="hidden min-w-[130px] text-right sm:block">
                  <p className="text-sm font-bold text-nuit">{stats.orders} commande(s)</p>
                  <p className="text-xs text-[var(--color-primary)]">{formatPrice(stats.spent)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => setDetails(c)} className="rounded-xl p-2 text-nuit/50 transition hover:bg-cloud hover:text-[var(--color-primary)]" title="Voir les détails">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => setEditing(c)} className="rounded-xl p-2 text-nuit/50 transition hover:bg-cloud hover:text-[var(--color-primary)]" title="Modifier">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => remove(c)} className="rounded-xl p-2 text-nuit/50 transition hover:bg-red-50 hover:text-red-500" title="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {list.length > 0 && (
        <Pagination page={safePage} pageSize={pageSize} total={list.length} onChange={setPage} onSizeChange={(s) => { setPageSize(s); setPage(1) }} sizes={SIZES} />
      )}

      {creating && <ClientModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load() }} />}
      {editing && <ClientModal client={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />}
      {details && (
        <ClientDetails
          client={details}
          stats={statsFor(details)}
          onClose={() => setDetails(null)}
          onEdit={() => { setEditing(details); setDetails(null) }}
        />
      )}
    </div>
  )
}
