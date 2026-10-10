import { Link } from 'react-router-dom'
import { Target, Eye, HeartHandshake, MapPin, Phone, Mail } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { DEFAULT_WHATSAPP } from '../../lib/constants'

const values = [
  { icon: Target, title: 'Notre mission', text: "Rendre la technologie premium accessible à tous, avec des produits authentiques et un service irréprochable." },
  { icon: Eye, title: 'Notre vision', text: "Devenir la référence de la vente de smartphones et d'accessoires tech en Afrique de l'Ouest." },
  { icon: HeartHandshake, title: 'Nos valeurs', text: "Confiance, transparence et excellence. Chaque client est traité comme un partenaire." }
]

const formatPhone = (v) => {
  const d = String(v || '').replace(/\D/g, '')
  if (!d) return v
  if (d.startsWith('221')) return `+221 ${d.slice(3, 5)} ${d.slice(5, 8)} ${d.slice(8, 10)} ${d.slice(10, 12)}`.trim()
  return `+${d}`
}

export default function About() {
  const { settings } = useStore()
  return (
    <div>
      <div className="bg-nuit py-20 text-center">
        <div className="container-x max-w-2xl">
          <span className="badge bg-[var(--color-primary)]/20 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/40">À propos</span>
          <h1 className="mt-4 text-4xl font-extrabold text-white">Baol Electronik</h1>
          <p className="mt-4 text-white/70 leading-relaxed">
            Votre boutique tech premium spécialisée dans les smartphones et accessoires des plus grandes marques — Apple, Samsung, Google, Xiaomi et plus encore.
          </p>
        </div>
      </div>

      <div className="container-x grid gap-6 py-16 md:grid-cols-3">
        {values.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-7">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cloud text-[var(--color-primary)]">
              <Icon size={22} />
            </span>
            <h3 className="mt-4 text-lg font-bold text-nuit">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-nuit/60">{text}</p>
          </div>
        ))}
      </div>

      <div className="container-x pb-16">
        <div className="rounded-3xl bg-cloud/70 p-8 sm:p-12">
          <h2 className="text-2xl font-extrabold text-nuit">Contactez-nous</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: MapPin, label: 'Adresse', value: settings?.address || 'Dakar, Sénégal' },
              { icon: Phone, label: 'Téléphone / WhatsApp', value: formatPhone(settings?.whatsapp || DEFAULT_WHATSAPP) },
              { icon: Mail, label: 'Email', value: settings?.email || 'contact@baolelectronik.sn' }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft">
                <Icon size={20} className="text-[var(--color-primary)]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-nuit/40">{label}</p>
                  <p className="text-sm font-bold text-nuit">{value}</p>
                </div>
              </div>
            ))}
          </div>
          <Link to="/boutique" className="btn-primary mt-8">Découvrir la boutique</Link>
        </div>
      </div>
    </div>
  )
}
