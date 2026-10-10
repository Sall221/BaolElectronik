import { useEffect, useState } from 'react'
import { Save, Palette, Type, MapPin, Phone, Mail, Image as ImageIcon, CreditCard, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '../../context/StoreContext'
import ImagePicker from '../../components/ImagePicker'

export default function AdminConfiguration() {
  const { settings, updateSettings } = useStore()
  const [form, setForm] = useState(settings)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setForm(settings) }, [settings])

  const set = (path, value) => {
    setForm((f) => {
      if (path.includes('.')) {
        const [a, b] = path.split('.')
        return { ...f, [a]: { ...f[a], [b]: value } }
      }
      return { ...f, [path]: value }
    })
  }

  const payments = form.payments || []

  const setPayment = (i, patch) => set('payments', payments.map((p, j) => (j === i ? { ...p, ...patch } : p)))
  const removePayment = (i) => set('payments', payments.filter((_, j) => j !== i))
  const addPayment = () => set('payments', [...payments, { name: '', image: '' }])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSettings(form)
      toast.success('Configuration enregistrée')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-nuit">Configuration</h1>
        <p className="mt-1 text-sm text-nuit/50">Identité visuelle, couleurs et contenus de la boutique</p>
      </div>

      <div className="admin-card space-y-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><ImageIcon size={17} /> Identité visuelle</h2>
        <ImagePicker
          label="Logo du site"
          value={form.logo || ''}
          onChange={(v) => set('logo', v)}
          hint="Affiché dans l'en-tête et le footer. PNG/SVG transparent conseillé."
          preview="h-16 w-16"
        />
        <ImagePicker
          label="Favicon"
          value={form.favicon || ''}
          onChange={(v) => set('favicon', v)}
          hint="Petite icône de l'onglet du navigateur (32×32 ou 64×64)."
          preview="h-10 w-10"
        />
      </div>

      <div className="admin-card space-y-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><Palette size={17} /> Couleurs du site</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Couleur principale</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primary} onChange={(e) => set('primary', e.target.value)} className="h-11 w-16 cursor-pointer rounded-xl border border-gray-200" />
              <input className="input" value={form.primary} onChange={(e) => set('primary', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Couleur secondaire</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.secondary} onChange={(e) => set('secondary', e.target.value)} className="h-11 w-16 cursor-pointer rounded-xl border border-gray-200" />
              <input className="input" value={form.secondary} onChange={(e) => set('secondary', e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-cloud p-4">
          <span className="btn-primary pointer-events-none py-2.5">Aperçu bouton</span>
          <span className="h-9 w-9 rounded-2xl" style={{ background: form.primary }} />
          <span className="h-9 w-9 rounded-2xl" style={{ background: form.secondary }} />
        </div>
      </div>

      <div className="admin-card space-y-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><MapPin size={17} /> Coordonnées de contact</h2>
        <div>
          <label className="label">Adresse</label>
          <input className="input" value={form.address || ''} onChange={(e) => set('address', e.target.value)} placeholder="Dakar, Sénégal" />
        </div>
        <div>
          <label className="label"><Phone size={12} className="mr-1 inline" /> Téléphone / WhatsApp</label>
          <input className="input" value={form.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} placeholder="221771242657" />
          <p className="mt-1 text-[11px] text-nuit/40">Format international sans + ni espaces</p>
        </div>
        <div>
          <label className="label"><Mail size={12} className="mr-1 inline" /> Email</label>
          <input type="email" className="input" value={form.email || ''} onChange={(e) => set('email', e.target.value)} placeholder="contact@baolelectronik.sn" />
        </div>
      </div>

      <div className="admin-card space-y-5">
        <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><Type size={17} /> Hero (bannière principale)</h2>
        <div>
          <label className="label">Titre</label>
          <input className="input" value={form.hero?.title || ''} onChange={(e) => set('hero.title', e.target.value)} />
        </div>
        <div>
          <label className="label">Sous-titre</label>
          <textarea className="input min-h-[80px]" value={form.hero?.subtitle || ''} onChange={(e) => set('hero.subtitle', e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Texte du bouton</label>
            <input className="input" value={form.hero?.cta || ''} onChange={(e) => set('hero.cta', e.target.value)} />
          </div>
          <div className="flex items-end pb-1 text-[11px] text-nuit/40">
            L'image est utilisée en arrière-plan et à droite de la bannière.
          </div>
        </div>
        <ImagePicker
          label="Image de la section Hero"
          value={form.hero?.image || ''}
          onChange={(v) => set('hero.image', v)}
          preview="h-24 w-32"
        />
      </div>

      <div className="admin-card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><CreditCard size={17} /> Images des paiements</h2>
          <button type="button" onClick={addPayment} className="btn-secondary py-2 text-xs">
            <Plus size={14} /> Ajouter
          </button>
        </div>
        <p className="text-xs text-nuit/40">Logo Wave, Orange Money, Visa... affichés dans le footer de la boutique.</p>
        {payments.length === 0 && (
          <p className="rounded-2xl bg-cloud p-4 text-xs text-nuit/50">Aucun moyen de paiement configuré pour le moment.</p>
        )}
        <div className="space-y-3">
          {payments.map((p, i) => (
            <div key={i} className="rounded-2xl bg-cloud p-4">
              <div className="flex items-end gap-3">
                <div className="min-w-0 flex-1">
                  <label className="label">Nom</label>
                  <input className="input" value={p.name || ''} onChange={(e) => setPayment(i, { name: e.target.value })} placeholder="Wave" />
                </div>
                <button type="button" onClick={() => removePayment(i)} className="mb-1 rounded-xl p-2.5 text-nuit/40 transition hover:bg-red-50 hover:text-red-500" title="Supprimer">
                  <X size={16} />
                </button>
              </div>
              <div className="mt-3">
                <ImagePicker
                  label="Image du moyen de paiement"
                  value={p.image || ''}
                  onChange={(v) => setPayment(i, { image: v })}
                  preview="h-10 w-16"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card space-y-5">
        <h2 className="text-base font-bold text-nuit">Bannière promotionnelle</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Titre</label>
            <input className="input" value={form.promo?.title || ''} onChange={(e) => set('promo.title', e.target.value)} />
          </div>
          <div>
            <label className="label">Badge (ex : -30%)</label>
            <input className="input" value={form.promo?.discount || ''} onChange={(e) => set('promo.discount', e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Texte</label>
          <textarea className="input min-h-[70px]" value={form.promo?.text || ''} onChange={(e) => set('promo.text', e.target.value)} />
        </div>
      </div>

      <div className="admin-card space-y-4">
        <h2 className="text-base font-bold text-nuit">Footer</h2>
        <div>
          <label className="label">Texte de présentation</label>
          <textarea className="input min-h-[70px]" value={form.footer?.text || ''} onChange={(e) => set('footer.text', e.target.value)} />
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary py-3.5">
        <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer la configuration'}
      </button>
    </form>
  )
}
