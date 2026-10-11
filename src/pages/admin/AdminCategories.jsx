import { useEffect, useState } from 'react'
import { Save, Plus, X, FolderTree } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../../context/StoreContext'

export default function AdminCategories() {
  const { categories, updateSettings, products } = useStore()
  const [form, setForm] = useState(categories)
  const [saving, setSaving] = useState(false)
  const [newCat, setNewCat] = useState('')
  const [drafts, setDrafts] = useState({})

  useEffect(() => { setForm(categories) }, [categories])

  const update = (i, patch) => setForm((f) => f.map((c, j) => (j === i ? { ...c, ...patch } : c)))
  const removeCat = (i) => setForm((f) => f.filter((_, j) => j !== i))

  const addCat = () => {
    const name = newCat.trim()
    if (!name) return
    if (form.some((c) => c.name.toLowerCase() === name.toLowerCase())) return toast.error('Cette catégorie existe déjà')
    setForm((f) => [...f, { name, subcategories: [] }])
    setNewCat('')
  }

  const addSub = (i) => {
    const value = (drafts[i] || '').trim()
    if (!value) return
    if (form[i].subcategories.some((s) => s.toLowerCase() === value.toLowerCase())) return toast.error('Cette sous-catégorie existe déjà')
    update(i, { subcategories: [...form[i].subcategories, value] })
    setDrafts((d) => ({ ...d, [i]: '' }))
  }

  const removeSub = (i, s) => update(i, { subcategories: form[i].subcategories.filter((x) => x !== s) })

  const save = async (e) => {
    e.preventDefault()
    if (form.length === 0) return toast.error('Ajoutez au moins une catégorie')
    setSaving(true)
    try {
      await updateSettings({ categories: form })
      toast.success('Catégories enregistrées')
    } catch (err) {
      toast.error((err && err.message) || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const countOf = (name) => products.filter((p) => p.category === name).length

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-nuit">Catégories & Sous-catégories</h1>
        <p className="mt-1 text-sm text-nuit/50">Organisez le catalogue de la boutique</p>
      </div>

      {form.map((c, i) => (
        <div key={i} className="admin-card space-y-4">
          <div className="flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <label className="label">Nom de la catégorie</label>
              <input className="input" value={c.name} onChange={(e) => update(i, { name: e.target.value })} />
            </div>
            <span className="mb-2.5 shrink-0 text-xs font-semibold text-nuit/40">{countOf(c.name)} produit(s)</span>
            <button
              type="button"
              onClick={() => {
                if (countOf(c.name) > 0 && !window.confirm(`Supprimer « ${c.name} » ? Les produits existants garderont cette catégorie.`)) return
                removeCat(i)
              }}
              className="mb-1 rounded-xl p-2.5 text-nuit/40 transition hover:bg-red-50 hover:text-red-500"
              title="Supprimer la catégorie"
            >
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="label">Sous-catégories</label>
            <div className="flex flex-wrap gap-2">
              {c.subcategories.map((s) => (
                <span key={s} className="badge items-center gap-1.5 bg-cloud py-1.5 pl-3 pr-2 text-nuit">
                  {s}
                  <button type="button" onClick={() => removeSub(i, s)} className="text-nuit/40 hover:text-red-500" title="Retirer">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {c.subcategories.length === 0 && <span className="text-xs text-nuit/40">Aucune sous-catégorie</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="input"
                placeholder="Ex : Coques & Folios"
                value={drafts[i] || ''}
                onChange={(e) => setDrafts((d) => ({ ...d, [i]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSub(i) } }}
              />
              <button type="button" onClick={() => addSub(i)} className="btn-secondary shrink-0">
                <Plus size={15} /> Ajouter
              </button>
            </div>
          </div>
        </div>
      ))}

      <div className="admin-card space-y-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><FolderTree size={17} /> Nouvelle catégorie</h2>
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Nom de la catégorie"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCat() } }}
          />
          <button type="button" onClick={addCat} className="btn-secondary shrink-0">
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary py-3.5">
        <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer les catégories'}
      </button>
    </form>
  )
}
