import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Search } from 'lucide-react'
import { useStore } from '../../context/StoreContext'
import { BRANDS } from '../../lib/constants'
import ProductCard from '../../components/ProductCard'
import Pagination from '../../components/Pagination'

const PAGE_SIZE = 12

export default function Shop() {
  const { products, categories } = useStore()
  const [params, setParams] = useSearchParams()
  const [sort, setSort] = useState('recent')
  const [maxPrice, setMaxPrice] = useState(1200000)
  const [page, setPage] = useState(1)
  const q = params.get('q') || ''
  const cat = params.get('cat') || ''
  const sub = params.get('sub') || ''
  const brand = params.get('brand') || ''
  const [mobileFilters, setMobileFilters] = useState(false)

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key === 'cat') next.delete('sub')
    setParams(next)
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice)
    if (q) {
      const s = q.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s))
    }
    if (cat) list = list.filter((p) => p.category === cat)
    if (sub) list = list.filter((p) => p.subcategory === sub)
    if (brand) list = list.filter((p) => p.brand === brand)
    if (sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
    return list
  }, [products, q, cat, sub, brand, sort, maxPrice])

  const activeSubs = categories.find((c) => c.name === cat)?.subcategories || []

  useEffect(() => { setPage(1) }, [q, cat, sub, brand, sort, maxPrice])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const shown = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const Filters = () => (
    <div className="space-y-7">
      <div>
        <h4 className="mb-3 text-sm font-bold text-nuit">Catégories</h4>
        <div className="space-y-1.5">
          {['', ...categories.map((c) => c.name)].map((c) => (
            <button
              key={c || 'all'}
              onClick={() => setParam('cat', c)}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm transition ${cat === c ? 'bg-[var(--color-primary)] text-white' : 'text-nuit/70 hover:bg-cloud'}`}
            >
              {c || 'Toutes'}
            </button>
          ))}
        </div>
      </div>
      {activeSubs.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-bold text-nuit">Sous-catégories</h4>
          <div className="flex flex-wrap gap-2">
            {['', ...activeSubs].map((s) => (
              <button
                key={s || 'all'}
                onClick={() => setParam('sub', s)}
                className={`badge transition ${sub === s ? 'bg-[var(--color-primary)] text-white' : 'bg-cloud text-nuit/60 hover:text-nuit'}`}
              >
                {s || 'Toutes'}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <h4 className="mb-3 text-sm font-bold text-nuit">Marques</h4>
        <div className="flex flex-wrap gap-2">
          {['', ...BRANDS].map((b) => (
            <button
              key={b || 'all'}
              onClick={() => setParam('brand', b)}
              className={`badge transition ${brand === b ? 'bg-[var(--color-primary)] text-white' : 'bg-cloud text-nuit/60 hover:text-nuit'}`}
            >
              {b || 'Toutes'}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-bold text-nuit">Prix max : {maxPrice.toLocaleString('fr-FR')} F</h4>
        <input
          type="range" min="30000" max="1200000" step="10000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[var(--color-primary)]"
        />
      </div>
    </div>
  )

  return (
    <div className="container-x py-10 lg:py-14">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-nuit">
          {sub || cat || brand || (q ? `Résultats pour « ${q} »` : 'Toute la Boutique')}
        </h1>
        <p className="mt-2 text-sm text-nuit/50">{filtered.length} produit(s) trouvé(s)</p>
      </div>

      <div className="flex gap-10">
        <aside className="hidden w-64 shrink-0 lg:block">
          <Filters />
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex items-center justify-between gap-3">
            <button onClick={() => setMobileFilters(true)} className="btn-secondary py-2.5 text-xs lg:hidden">
              <SlidersHorizontal size={14} /> Filtres
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input max-w-[220px] py-2.5">
              <option value="recent">Plus récents</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="rating">Mieux notés</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-cloud/60 py-24 text-center">
              <Search size={36} className="text-nuit/20" />
              <p className="mt-4 font-semibold text-nuit">Aucun produit trouvé</p>
              <p className="text-sm text-nuit/50">Essayez d'autres filtres ou recherchez autre chose.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
                {shown.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={safePage} pageSize={PAGE_SIZE} total={filtered.length} onChange={setPage} />
            </>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-nuit/50" onClick={() => setMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-nuit">Filtres</h3>
              <button onClick={() => setMobileFilters(false)} className="text-sm font-semibold text-[var(--color-primary)]">Fermer</button>
            </div>
            <Filters />
          </div>
        </div>
      )}
    </div>
  )
}
