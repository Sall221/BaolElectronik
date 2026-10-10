import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingCart, Heart, Menu, X, Smartphone } from 'lucide-react'
import { useStore } from '../context/StoreContext'

export default function Header() {
  const { cartCount, favorites, settings, categories } = useStore()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  const submitSearch = (e) => {
    e.preventDefault()
    navigate(`/boutique?q=${encodeURIComponent(q)}`)
    setOpen(false)
  }

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/boutique', label: 'Boutique' },
    { to: '/boutique?cat=Smartphones', label: 'Catégories' },
    { to: '/promos', label: 'Promos' },
    { to: '/a-propos', label: 'À propos' }
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-xl">
      <div className="container-x flex h-16 items-center justify-between gap-4 lg:h-20">
        <Link to="/" className="flex items-center" aria-label="Baol Electronik">
          {settings?.logo ? (
            <img src={settings.logo} alt="Baol Electronik" className="h-14 w-auto max-w-[170px] rounded-2xl object-contain" />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-nuit text-white">
              <Smartphone size={26} />
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => `nav-link ${isActive && l.to === '/' ? 'text-nuit' : ''}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="relative hidden flex-1 max-w-xs xl:block">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un produit..."
            className="input rounded-full bg-cloud pl-10 pr-4 py-2.5"
          />
        </form>

        <div className="flex items-center gap-1">
          <Link to="/favoris" className="relative rounded-2xl p-2.5 text-nuit/70 transition hover:bg-cloud hover:text-nuit">
            <Heart size={20} />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link to="/panier" className="relative rounded-2xl p-2.5 text-nuit/70 transition hover:bg-cloud hover:text-nuit">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setOpen(!open)} className="rounded-2xl p-2.5 text-nuit lg:hidden" aria-label="Menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 bg-white lg:hidden">
          <div className="container-x space-y-4 py-5">
            <form onSubmit={submitSearch} className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher..."
                className="input rounded-full bg-cloud pl-10"
              />
            </form>
            <nav className="grid gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-2xl px-3 py-2.5 text-sm font-medium text-nuit/80 hover:bg-cloud">
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link key={c.name} to={`/boutique?cat=${encodeURIComponent(c.name)}`} onClick={() => setOpen(false)} className="badge bg-cloud text-nuit/70">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
