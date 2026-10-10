import { Link } from 'react-router-dom'
import { ArrowRight, BadgePercent, Crown } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import ProductCard from '../../components/ProductCard'
import TrustBar from '../../components/TrustBar'
import SectionTitle from '../../components/SectionTitle'

export default function Home() {
  const { products, settings, loading, stats } = useStore()
  const hero = settings?.hero || {}
  const promo = settings?.promo || {}
  const byPopularity = [...products].sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0))
  const popular = [
    ...byPopularity.filter((p) => p.category === 'Smartphones'),
    ...byPopularity.filter((p) => p.category !== 'Smartphones')
  ].slice(0, 8)
  const deals = products.filter((p) => p.old_price && p.old_price > p.price).slice(0, 4)

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-nuit">
        <div className="absolute inset-0 opacity-40">
          <img src={hero.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-nuit via-nuit/85 to-nuit/30" />
        </div>
        <div className="container-x relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-28">
          <div className="max-w-xl">
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              {hero.title}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-white/70 sm:text-lg">{hero.subtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/boutique" className="btn-primary px-8 py-4">
                {hero.cta || 'Acheter Maintenant'} <ArrowRight size={16} />
              </Link>
              <Link to="/promos" className="btn-secondary border-white/20 bg-white/10 px-8 py-4 text-white hover:border-white/40 hover:text-white">
                Voir les promos
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 text-sm text-white/60">
              <div><p className="text-2xl font-extrabold text-white">{stats.clients}</p>Clients satisfaits</div>
              <div><p className="text-2xl font-extrabold text-white">{stats.products}</p>Produits</div>
              <div><p className="text-2xl font-extrabold text-white">{stats.rating.toFixed(1)}★</p>Note moyenne</div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <img
              src={hero.image}
              alt="Produit phare"
              className="mx-auto max-h-[460px] w-full object-contain drop-shadow-[0_25px_60px_rgba(30,64,175,0.45)]"
            />
          </div>
        </div>
      </section>

      <TrustBar />

      {/* POPULAIRES */}
      <section className="container-x py-16">
        <SectionTitle
          eyebrow="Nos best-sellers"
          title="Nos produits"
          action={
            <Link to="/boutique" className="btn-secondary py-2.5 text-xs">
              Tout voir <ArrowRight size={14} />
            </Link>
          }
        />
        {loading ? (
          <div className="no-scrollbar -mx-1 flex gap-5 overflow-x-auto px-1 pb-2">
            {[...Array(4)].map((_, i) => <div key={i} className="card h-80 w-[76vw] max-w-[300px] shrink-0 animate-pulse bg-cloud sm:w-[300px]" />)}
          </div>
        ) : (
          <div className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-2">
            {popular.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                className="w-[76vw] max-w-[300px] shrink-0 snap-start sm:w-[300px]"
              />
            ))}
          </div>
        )}
      </section>

      {/* BANNIÈRE PROMO */}
      <section className="container-x pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--color-primary)] to-nuit px-8 py-14 shadow-card sm:px-14">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 right-1/3 h-52 w-52 rounded-full bg-white/5 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div className="max-w-lg">
              <span className="badge bg-white/15 text-white"><BadgePercent size={12} className="mr-1" /> Offre limitée</span>
              <h3 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">{promo.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">{promo.text}</p>
              <Link to="/promos" className="btn-secondary mt-7 border-white/30 bg-white px-8 py-3.5 text-nuit hover:border-white hover:bg-white/90">
                Profiter des offres <ArrowRight size={16} />
              </Link>
            </div>
            <div className="hidden h-40 w-40 items-center justify-center rounded-full bg-white/10 sm:flex">
              <span className="text-5xl font-extrabold text-white">{promo.discount}</span>
            </div>
          </div>
        </div>
      </section>

      {/* MEILLEURES OFFRES */}
      <section className="container-x py-16">
        <SectionTitle
          eyebrow="Ne manquez pas ça"
          title="Meilleures Offres"
          action={
            <Link to="/promos" className="btn-secondary py-2.5 text-xs">
              <Crown size={14} /> Toutes les offres
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {deals.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  )
}
