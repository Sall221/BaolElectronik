import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react'

const items = [
  { icon: Truck, title: 'Livraison gratuite', text: 'Sur toutes les commandes' },
  { icon: ShieldCheck, title: 'Paiement sécurisé', text: 'Transactions protégées' },
  { icon: Headphones, title: 'Support 24/7', text: 'À votre écoute' },
  { icon: RotateCcw, title: 'Retours faciles', text: 'Sous 7 jours' }
]

export default function TrustBar() {
  return (
    <section className="border-y border-gray-100 bg-cloud/60">
      <div className="container-x grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[var(--color-primary)] shadow-soft">
              <Icon size={22} />
            </span>
            <div>
              <p className="text-sm font-bold text-nuit">{title}</p>
              <p className="text-xs text-nuit/50">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
