import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, X, Save, ImagePlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../../context/StoreContext'
import { saveProduct } from '../../lib/api'
import { BRANDS, slugify } from '../../lib/constants'
import { MediaLibraryModal } from '../../components/ImagePicker'

const empty = {
  name: '', slug: '', description: '', price: '', old_price: '', stock: 0,
  category: 'Smartphones', subcategory: '', brand: 'Apple', images: [], colors: [], storage: [],
  rating: 5.0, reviews_count: 0, featured: false
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, refresh, categories } = useStore()
  const [form, setForm] = useState(empty)
  const [newColor, setNewColor] = useState({ name: '', hex: '#1E40AF' })
  const [newStorage, setNewStorage] = useState({ label: '', delta: 0 })
  const [saving, setSaving] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)

  useEffect(() => {
    if (id) {
      const p = products.find((x) => x.id === id)
      if (p) setForm({ ...empty, ...p, price: p.price, old_price: p.old_price || '' })
    } else {
      setForm(empty)
    }
  }, [id, products])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const addImageFromLibrary = (url) => {
    if (url && !form.images.includes(url)) set('images', [...form.images, url])
    setLibraryOpen(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price) return toast.error('Nom et prix sont obligatoires')
    setSaving(true)
    try {
      await saveProduct({
        ...form,
        slug: form.slug || slugify(form.name),
        price: Number(form.price),
        old_price: form.old_price ? Number(form.old_price) : null,
        stock: Number(form.stock) || 0,
        images: form.images.filter(Boolean)
      })
      await refresh()
      toast.success(id ? 'Produit mis à jour' : 'Produit créé')
      navigate('/admin/produits')
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-nuit">{id ? 'Modifier le produit' : 'Nouveau produit'}</h1>
        <p className="mt-1 text-sm text-nuit/50">Renseignez toutes les informations du produit</p>
      </div>

      <div className="admin-card space-y-5">
        <h2 className="text-base font-bold text-nuit">Informations générales</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nom du produit *</label>
            <input className="input" required value={form.name} onChange={(e) => { set('name', e.target.value); if (!id) set('slug', slugify(e.target.value)) }} />
          </div>
          <div>
            <label className="label">Slug (URL)</label>
            <input className="input" value={form.slug} onChange={(e) => set('slug', e.target.value)} placeholder="genere-automatiquement" />
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[110px]" value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Prix (FCFA) *</label>
            <input type="number" min="0" className="input" required value={form.price} onChange={(e) => set('price', e.target.value)} />
          </div>
          <div>
            <label className="label">Prix barré</label>
            <input type="number" min="0" className="input" value={form.old_price} onChange={(e) => set('old_price', e.target.value)} />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" min="0" className="input" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
          </div>
          <div>
            <label className="label">Note (0-5)</label>
            <input type="number" min="0" max="5" step="0.1" className="input" value={form.rating} onChange={(e) => set('rating', Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <select className="input" value={form.category} onChange={(e) => { set('category', e.target.value); set('subcategory', '') }}>
              {categories.map((c) => <option key={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Sous-catégorie</label>
            <select className="input" value={form.subcategory || ''} onChange={(e) => set('subcategory', e.target.value)}>
              <option value="">Aucune</option>
              {(categories.find((c) => c.name === form.category)?.subcategories || []).map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Marque</label>
            <select className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)}>
              {BRANDS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-nuit/70">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
              Produit vedette
            </label>
          </div>
        </div>
      </div>

      <div className="admin-card space-y-5">
        <h2 className="text-base font-bold text-nuit">Images</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {form.images.map((img, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl bg-cloud ring-1 ring-gray-100">
              <img src={img} alt="" className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                className="absolute right-1.5 top-1.5 rounded-full bg-nuit/80 p-1.5 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 text-nuit/40 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <ImagePlus size={22} />
            <span className="text-xs font-semibold">Choisir une image</span>
          </button>
        </div>
        <div className="flex gap-2">
          <input
            id="img-url"
            className="input"
            placeholder="https://... coller une URL d'image puis +"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const v = e.target.value.trim()
                if (v) { set('images', [...form.images, v]); e.target.value = '' }
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('img-url')
              const v = el?.value?.trim()
              if (v) { set('images', [...form.images, v]); el.value = '' }
            }}
            className="btn-secondary shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {libraryOpen && (
        <MediaLibraryModal onPick={addImageFromLibrary} onClose={() => setLibraryOpen(false)} />
      )}


      <div className="admin-card space-y-5">
        <h2 className="text-base font-bold text-nuit">Variantes — Couleurs</h2>
        <div className="flex flex-wrap gap-2">
          {form.colors.map((c, i) => (
            <span key={i} className="badge items-center gap-1.5 bg-cloud py-1.5 pl-1.5 pr-3 text-nuit">
              <span className="h-5 w-5 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} />
              {c.name}
              <button type="button" onClick={() => set('colors', form.colors.filter((_, j) => j !== i))} className="text-nuit/40 hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="label">Nom</label>
            <input className="input" value={newColor.name} onChange={(e) => setNewColor({ ...newColor, name: e.target.value })} placeholder="Ex: Titane Noir" />
          </div>
          <div>
            <label className="label">Couleur</label>
            <input type="color" className="h-10 w-16 cursor-pointer rounded-xl border border-gray-200" value={newColor.hex} onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })} />
          </div>
          <button
            type="button"
            onClick={() => {
              if (!newColor.name) return
              set('colors', [...form.colors, { ...newColor }])
              setNewColor({ name: '', hex: '#1E40AF' })
            }}
            className="btn-secondary py-2.5"
          >
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      <div className="admin-card space-y-5">
        <h2 className="text-base font-bold text-nuit">Variantes — Stockage</h2>
        <div className="flex flex-wrap gap-2">
          {form.storage.map((s, i) => (
            <span key={i} className="badge items-center gap-1.5 bg-cloud py-1.5 pl-3 pr-2 text-nuit">
              {s.label} {s.delta > 0 && `(+${Number(s.delta).toLocaleString('fr-FR')})`}
              <button type="button" onClick={() => set('storage', form.storage.filter((_, j) => j !== i))} className="text-nuit/40 hover:text-red-500"><X size={12} /></button>
            </span>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="label">Capacité</label>
            <input className="input" value={newStorage.label} onChange={(e) => setNewStorage({ ...newStorage, label: e.target.value })} placeholder="Ex: 256 Go" />
          </div>
          <div>
            <label className="label">Supplément prix</label>
            <input type="number" min="0" className="input" value={newStorage.delta} onChange={(e) => setNewStorage({ ...newStorage, delta: Number(e.target.value) })} />
          </div>
          <button
            type="button"
            onClick={() => {
              if (!newStorage.label) return
              set('storage', [...form.storage, { ...newStorage }])
              setNewStorage({ label: '', delta: 0 })
            }}
            className="btn-secondary py-2.5"
          >
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary py-3.5">
          <Save size={16} /> {saving ? 'Enregistrement...' : id ? 'Mettre à jour' : 'Créer le produit'}
        </button>
        <button type="button" onClick={() => navigate('/admin/produits')} className="btn-secondary py-3.5">Annuler</button>
      </div>
    </form>
  )
}
