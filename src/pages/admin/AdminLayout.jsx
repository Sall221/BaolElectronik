import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ClipboardList, Image, Settings, Users, FolderTree,
  LogOut, ExternalLink, Smartphone, Menu, X, UserCog, ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { getCurrentUser, getProfile, logout } from '../../lib/api'
import { useStore } from '../../context/StoreContext'
import OfflineBanner from '../../components/OfflineBanner'

const nav = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/admin/produits', icon: Package, label: 'Produits' },
  { to: '/admin/commandes', icon: ClipboardList, label: 'Commandes' },
  { to: '/admin/clients', icon: Users, label: 'Clients' },
  { to: '/admin/categories', icon: FolderTree, label: 'Catégories' },
  { to: '/admin/medias', icon: Image, label: 'Médiathèque' },
  { to: '/admin/configuration', icon: Settings, label: 'Configuration' },
  { to: '/admin/profil', icon: UserCog, label: 'Profil' }
]

export default function AdminLayout() {
  const [user, setUser] = useState(undefined)
  const [profile, setProfile] = useState({ name: '', avatar: '' })
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { settings } = useStore()

  useEffect(() => {
    getCurrentUser().then(setUser)
    getProfile().then(setProfile).catch(() => {})
  }, [])

  const signOut = async () => {
    await logout()
    toast.success('Déconnecté')
    navigate('/admin/login')
  }

  if (user === undefined) {
    return <div className="flex min-h-screen items-center justify-center bg-cloud text-nuit/50">Vérification de l'accès...</div>
  }

  if (user === null) {
    navigate('/admin/login', { replace: true })
    return null
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2.5 px-6 py-6" aria-label="Baol Admin">
        {settings.logo ? (
          <img src={settings.logo} alt="Logo" className="h-14 w-auto max-w-[190px] bg-white p-1.5 object-contain ring-1 ring-white/10" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-white">
            <Smartphone size={24} />
          </span>
        )}
      </Link>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, end, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition ${
                isActive ? 'bg-[var(--color-primary)] text-white shadow-soft' : 'text-white/55 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={17} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-white/55 transition hover:bg-white/5 hover:text-white">
          <ExternalLink size={17} /> Voir la boutique
        </Link>
        <button onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium text-white/55 transition hover:bg-red-500/10 hover:text-red-400">
          <LogOut size={17} /> Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cloud">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-nuit lg:block">{Sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-nuit/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-nuit">{Sidebar}</aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur-xl sm:px-8">
          <button onClick={() => setOpen(true)} className="rounded-xl p-2 text-nuit lg:hidden">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="text-sm font-semibold text-nuit/60">Espace administrateur</p>
          <div className="relative flex items-center gap-3">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 rounded-2xl p-1.5 transition hover:bg-cloud"
              title="Menu profil"
              aria-expanded={menuOpen}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-[var(--color-primary)]/20" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                  {String(profile.name || user.email || 'A').charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden max-w-[150px] truncate text-sm font-semibold text-nuit sm:block">{profile.name || user.email}</span>
              <ChevronDown size={15} className={`hidden text-nuit/40 transition-transform sm:block ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] z-40 w-60 overflow-hidden rounded-3xl bg-white p-2 shadow-card ring-1 ring-gray-100">
                  <div className="border-b border-gray-100 px-3 py-2.5">
                    <p className="truncate text-sm font-extrabold text-nuit">{profile.name || 'Administrateur'}</p>
                    <p className="truncate text-xs text-nuit/40">{user.email}</p>
                  </div>
                  <Link
                    to="/admin/profil"
                    onClick={() => setMenuOpen(false)}
                    className="mt-1 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-nuit/70 transition hover:bg-cloud hover:text-nuit"
                  >
                    <UserCog size={16} /> Mon profil
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut() }}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50"
                  >
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </header>
        <main className="p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
      <OfflineBanner />
    </div>
  )
}
