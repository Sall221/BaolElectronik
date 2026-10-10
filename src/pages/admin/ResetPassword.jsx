import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!supabase) {
      toast.error('Supabase non configuré')
      navigate('/admin/login', { replace: true })
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        toast.error('Lien invalide ou expiré.')
        navigate('/admin/login', { replace: true })
      } else {
        setReady(true)
      }
    })
  }, [navigate])

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Mot de passe : 6 caractères minimum.')
    if (password !== confirm) return toast.error('Les mots de passe ne correspondent pas.')
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) return toast.error(error.message)
    toast.success('Mot de passe mis à jour. Reconnectez-vous.')
    await supabase.auth.signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-nuit px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <div className="flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-nuit text-white">
            <Smartphone size={26} />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-nuit">Nouveau mot de passe</h1>
          <p className="mt-1 text-sm text-nuit/50">Choisissez un mot de passe pour votre compte admin</p>
        </div>

        {!ready ? (
          <div className="mt-8 text-center text-sm text-nuit/50">Vérification du lien…</div>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label className="label">Nouveau mot de passe</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="input" placeholder="••••••••" autoFocus
              />
            </div>
            <div>
              <label className="label">Confirmer le mot de passe</label>
              <input
                type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="input" placeholder="••••••••"
              />
            </div>
            <button disabled={loading} className="btn-primary w-full py-3.5">
              <KeyRound size={16} /> {loading ? 'Enregistrement…' : 'Réinitialiser'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}