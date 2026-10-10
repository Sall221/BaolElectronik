import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { login, resetPassword } from '../../lib/api'
import { isSupabaseConfigured } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Bienvenue dans l\'administration')
      navigate('/admin')
    } catch (err) {
      toast.error(err.message || 'Échec de la connexion')
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async () => {
    if (!isSupabaseConfigured) return toast.error('Configurer Supabase pour réinitialiser le mot de passe')
    if (!email) return toast.error('Saisissez d\'abord votre email ci-dessus.')
    setSending(true)
    try {
      await resetPassword(email)
      toast.success('Email de réinitialisation envoyé. Le lien vous permet de créer un nouveau mot de passe.')
    } catch (err) {
      toast.error(err.message || 'Envoi impossible')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-nuit px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <div className="flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-nuit text-white">
            <Smartphone size={26} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-nuit">Administration</h1>
          <p className="mt-1 text-sm text-nuit/50">Baol Electronik — Espace sécurisé</p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="admin@baol.sn" />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" />
          </div>
          <button disabled={loading} className="btn-primary w-full py-3.5">
            <Lock size={16} /> {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <button
          type="button"
          onClick={forgotPassword}
          disabled={sending}
          className="mt-4 w-full text-center text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          {sending ? 'Envoi en cours…' : 'Mot de passe oublié ?'}
        </button>

        {!isSupabaseConfigured && (
          <div className="mt-6 rounded-2xl bg-cloud p-4 text-xs text-nuit/60">
            <p className="font-bold text-nuit">Mode démonstration</p>
            <p className="mt-1">Email : <b>admin@baol.sn</b> — Mot de passe : <b>admin123</b></p>
            <p className="mt-1">Configurez Supabase (voir README) pour activer l'authentification réelle.</p>
          </div>
        )}
      </div>
    </div>
  )
}
