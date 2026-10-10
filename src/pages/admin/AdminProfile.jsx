import { useEffect, useState } from 'react'
import { Save, UserCog, Phone, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getProfile, saveProfile } from '../../lib/api'
import ImagePicker from '../../components/ImagePicker'

export default function AdminProfile() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', avatar: '', password: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    getProfile().then((p) => setForm((f) => ({ ...f, name: p.name || '', email: p.email || '', phone: p.phone || '', avatar: p.avatar || '' })))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Le nom est requis')
    if (form.password) {
      if (form.password.length < 6) return toast.error('Mot de passe : 6 caractères minimum')
      if (form.password !== form.confirm) return toast.error('Les mots de passe ne correspondent pas')
    }
    setSaving(true)
    try {
      await saveProfile({ name: form.name, email: form.email, phone: form.phone, avatar: form.avatar, password: form.password || undefined })
      toast.success('Profil mis à jour')
      setForm((f) => ({ ...f, password: '', confirm: '' }))
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-nuit">Mon profil</h1>
        <p className="mt-1 text-sm text-nuit/50">Photo, nom, coordonnées et mot de passe de l'administrateur</p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="admin-card space-y-2">
          <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><UserCog size={16} /> Photo de profil</h2>
          <ImagePicker label="Choisissez une photo" value={form.avatar} onChange={(url) => set('avatar', url)} hint="PNG, JPG ou URL (1 Mo max pour un fichier)." />
        </div>

        <div className="admin-card space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><UserCog size={16} /> Informations</h2>
          <div>
            <label className="label">Nom complet</label>
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nom de l'administrateur" />
          </div>
          <div>
            <label className="label"><Mail size={12} className="mr-1 inline" /> Email</label>
            <input type="email" className="input" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="admin@baol.sn" />
          </div>
          <div>
            <label className="label"><Phone size={12} className="mr-1 inline" /> Numéro de téléphone</label>
            <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+221 77 000 00 00" />
          </div>
        </div>

        <div className="admin-card space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-nuit"><Lock size={16} /> Mot de passe</h2>
          <p className="text-xs text-nuit/40">Laissez vide pour conserver le mot de passe actuel.</p>
          <div>
            <label className="label">Nouveau mot de passe</label>
            <input type="password" className="input" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          </div>
          <div>
            <label className="label">Confirmer le mot de passe</label>
            <input type="password" className="input" value={form.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5">
          <Save size={15} /> {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  )
}