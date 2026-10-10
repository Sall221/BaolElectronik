import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Save, User, Phone, MapPin, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'
import { getOrder, saveOrder, deleteOrder } from '../../lib/api'
import { formatPrice, ORDER_STATUS } from '../../lib/constants'
import { useStore } from '../../context/StoreContext'

export default function AdminOrderForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products } = useStore()

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_city: '',
    note: '',
    status: 'pending',
    items: []
  })
  const [loading, setLoading] = useState(id ? true : false)
  const [saving, setSaving] = useState(false)
  const [pick, setPick] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!id) return
    getOrder(id).then((o) => {
      setLoading(false)
      if (o) setForm({ customer_name: o.customer_name || '', customer_phone: o.customer_phone || '', customer_city: o.customer_city || '', note: o.note || '', status: o.status || 'pending', items: o.items || [] })
    })
  }, [id])

  const total = form.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.qty) || 0), 0)

  const addProduct = () => {
    if (!pick) return
    const p = products.find((x) => x.id === pick)
    if (!p) return
    if (form.items.some((it) => it.name === p.name)) {
      setForm((f) => ({ ...f, items: f.items.map((it) => (it.name === p.name ? { ...it, qty: (Number(it.qty) || 0) + 1 } : it)) }))
    } else {
      setForm((f) => ({
        ...f,
        items: [...f.items, { name: p.name, price: Number(p.price) || 0, qty: 1, image: p.images?.[0] || p.image || '', color: p.colors?.[0] || '', storage: p.storage?.[0] || '' }]
      }))
    }
    setPick('')
  }

  const addManual = () => {
    setForm((f) => ({ ...f, items: [...f.items, { name: '', price: 0, qty: 1, image: '' }] }))
  }

  const patchItem = (i, k, v) => setForm((f) => ({ ...f, items: f.items.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)) }))
  const removeItem = (i) => setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.customer_name && !form.customer_phone) return toast.error('Nom ou téléphone du client requis')
    const items = form.items.filter((it) => it.name && Number(it.qty) > 0)
    if (items.length === 0) return toast.error('Ajoutez au moins un article')
    setSaving(true)
    try {
      await saveOrder({ ...form, items, total })
      toast.success(id ? 'Commande modifiée' : 'Commande créée')
      navigate('/admin/commandes')
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!id) return
    if (!window.confirm('Supprimer cette commande ?')) return
    try {
      await deleteOrder(id)
      toast.success('Commande supprimée')
      navigate('/admin/commandes')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) return <div className="text-nuit/50">Chargement...</div>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/admin/commandes" className="rounded-2xl p-2 text-nuit/50 transition hover:bg-white hover:text-nuit">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-extrabold text-nuit">{id ? 'Modifier la commande' : 'Nouvelle commande'}</h1>
        </div>
        <div className="flex items-center gap-2">
          <select value={form.status} onChange={(e) => set('status', e.target.value)} className={`badge cursor-pointer border-0 py-2 ${(ORDER_STATUS[form.status] || ORDER_STATUS.pending).color}`}>
            {Object.entries(ORDER_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {id && (
            <button onClick={remove} className="rounded-2xl p-2.5 text-nuit/50 transition hover:bg-red-50 hover:text-red-500" title="Supprimer">
              <Trash2 size={17} />
            </button>
          )}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="admin-card space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><ClipboardList size={16} /> Client</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label"><User size={12} className="mr-1 inline" /> Nom</label>
              <input className="input" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} placeholder="Nom du client" />
            </div>
            <div>
              <label className="label"><Phone size={12} className="mr-1 inline" /> Téléphone</label>
              <input className="input" value={form.customer_phone} onChange={(e) => set('customer_phone', e.target.value)} placeholder="+221 77 000 00 00" />
            </div>
            <div className="sm:col-span-2">
              <label className="label"><MapPin size={12} className="mr-1 inline" /> Ville / Adresse</label>
              <input className="input" value={form.customer_city} onChange={(e) => set('customer_city', e.target.value)} placeholder="Dakar" />
            </div>
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><ClipboardList size={16} /> Articles</h2>
          <div className="flex gap-2">
            <select value={pick} onChange={(e) => setPick(e.target.value)} className="input flex-1 bg-white">
              <option value="">Ajouter un produit existant...</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button type="button" onClick={addProduct} className="btn-primary shrink-0 px-4 py-3">
              <Plus size={16} /> Ajouter
            </button>
          </div>

          <div className="space-y-3">
            {form.items.map((it, i) => (
              <div key={i} className="grid gap-3 rounded-2xl bg-cloud/60 p-3 sm:grid-cols-[48px_1fr_90px_70px_90px_36px] sm:items-center">
                {it.image ? (
                  <img src={it.image} alt="" className="hidden h-12 w-12 rounded-xl object-cover sm:block" />
                ) : (
                  <span className="hidden h-12 w-12 items-center justify-center rounded-xl bg-white text-nuit/30 sm:flex"><ClipboardList size={18} /></span>
                )}
                <div className="min-w-0">
                  <input className="input border-0 bg-white py-2" value={it.name} onChange={(e) => patchItem(i, 'name', e.target.value)} placeholder="Libellé de l'article" />
                  <div className="mt-1.5 flex gap-1.5">
                    <input className="input border-0 bg-white py-1.5 text-xs" value={it.color || ''} onChange={(e) => patchItem(i, 'color', e.target.value)} placeholder="Couleur" />
                    <input className="input border-0 bg-white py-1.5 text-xs" value={it.storage || ''} onChange={(e) => patchItem(i, 'storage', e.target.value)} placeholder="Capacité" />
                  </div>
                </div>
                <input type="number" min="0" step="any" className="input py-2" value={it.price} onChange={(e) => patchItem(i, 'price', e.target.value)} />
                <input type="number" min="1" className="input py-2" value={it.qty} onChange={(e) => patchItem(i, 'qty', e.target.value)} />
                <span className="text-sm font-bold text-nuit">{formatPrice((Number(it.price) || 0) * (Number(it.qty) || 0))}</span>
                <button type="button" onClick={() => removeItem(i)} className="rounded-xl p-2 text-nuit/40 transition hover:bg-red-50 hover:text-red-500" title="Retirer">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {form.items.length === 0 && <p className="py-6 text-center text-sm text-nuit/40">Aucun article — ajoutez un produit ou un article manuellement.</p>}
          </div>

          <button type="button" onClick={addManual} className="btn-secondary w-full py-3">
            <Plus size={15} /> Ajouter un article manuellement
          </button>

          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="font-bold text-nuit">Total</span>
            <span className="text-2xl font-extrabold text-[var(--color-primary)]">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="admin-card space-y-4">
          <label className="label">Note</label>
          <textarea className="input min-h-[80px]" value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="Note sur la commande..." />
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn-primary py-3.5">
            <Save size={15} /> {saving ? 'Enregistrement...' : id ? 'Enregistrer les modifications' : 'Créer la commande'}
          </button>
          <button type="button" onClick={() => navigate('/admin/commandes')} className="btn-secondary py-3.5">Annuler</button>
        </div>
      </form>
    </div>
  )
}