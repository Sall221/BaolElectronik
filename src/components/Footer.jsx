import { Link } from 'react-router-dom'
import { Smartphone, ShieldCheck, Headphones, RotateCcw, Instagram, Facebook, Twitter, MapPin, Phone, Mail } from 'lucide-react'
import { useStore } from '../context/StoreContext'
import { DEFAULT_WHATSAPP } from '../lib/constants'

const formatPhone = (v) => {
  const d = String(v || '').replace(/\D/g, '')
  if (!d) return v
  if (d.startsWith('221')) return `+221 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`.trim()
  return `+${d}`
}

export default function Footer() {
  const { settings, categories } = useStore()
  const payments = (settings?.payments || []).filter((p) => p.image || p.name)
  return (
    <footer className="bg-nuit text-white">
      <div className="container-x py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              {settings?.logo ? (
                <img src={settings.logo} alt="Baol Electronik" className="h-14 w-auto max-w-[170px] bg-white p-1.5 object-contain" />
              ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]">
                  <Smartphone size={26} />
                </span>
              )}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {settings?.footer?.text || 'Votre boutique tech premium de confiance.'}
            </p>
            <div className="mt-5 flex gap-3">
              {[Instagram, Facebook, Twitter, Mail].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-[var(--color-primary)] hover:text-white">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/90">Liens rapides</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              {[
                ['Accueil', '/'],
                ['Boutique', '/boutique'],
                ['Promos', '/promos'],
                ['Favoris', '/favoris'],
                ['À propos', '/a-propos']
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="transition hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/90">Catégories</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/60">
              {categories.map((c) => (
                <li key={c.name}>
                  <Link to={`/boutique?cat=${encodeURIComponent(c.name)}`} className="transition hover:text-white">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white/90">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0 text-white/40" />
                <span>{settings?.address || 'Dakar, Sénégal'}</span>
              </li>
              <li>
                <a
                  href={`https://wa.me/${String(settings?.whatsapp || DEFAULT_WHATSAPP).replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-2.5 transition hover:text-white"
                >
                  <Phone size={16} className="mt-0.5 shrink-0 text-white/40" />
                  <span>{formatPhone(settings?.whatsapp || DEFAULT_WHATSAPP)}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${settings?.email || ''}`} className="flex items-start gap-2.5 transition hover:text-white">
                  <Mail size={16} className="mt-0.5 shrink-0 text-white/40" />
                  <span className="break-all">{settings?.email || 'contact@baolelectronik.sn'}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {payments.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-white/10 pt-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/50">Paiements acceptés</span>
            <div className="flex flex-wrap items-center gap-3">
              {payments.map((p, i) => (
                <span key={i} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5">
                  {p.image && <img src={p.image} alt={p.name || 'Paiement'} className="h-5 w-9 object-contain" />}
                  {p.name && <span className="text-xs font-semibold text-white/70">{p.name}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Baol Electronik. Tous droits réservés.</p>
          <div className="flex gap-5">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Paiement sécurisé</span>
            <span className="inline-flex items-center gap-1.5"><Headphones size={13} /> Support 24/7</span>
            <span className="inline-flex items-center gap-1.5"><RotateCcw size={13} /> Retours faciles</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
