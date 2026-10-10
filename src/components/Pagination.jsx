import { useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

function range(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1)
  const pages = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(count - 1, current + 1)
  if (start > 2) pages.push('…')
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < count - 1) pages.push('…')
  pages.push(count)
  return pages
}

export default function Pagination({ page, pageSize, total, onChange, onSizeChange, sizes = [8, 12, 24, 48] }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const pages = useMemo(() => range(page, pageCount), [page, pageCount])
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  if (pageCount <= 1) return null

  const goto = (p) => {
    const target = Math.max(1, Math.min(pageCount, p))
    if (target === page) return
    onChange(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const btn = 'flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition'

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
      <p className="text-sm text-nuit/50">
        <span className="font-bold text-nuit">{from}–{to}</span> sur {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button onClick={() => goto(page - 1)} disabled={page === 1} className={`${btn} ${page === 1 ? 'cursor-not-allowed text-nuit/20' : 'text-nuit/60 hover:bg-cloud hover:text-nuit'}`} aria-label="Page précédente">
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`e${i}`} className="px-1 text-sm text-nuit/30">…</span>
          ) : (
            <button
              key={p}
              onClick={() => goto(p)}
              className={`${btn} ${p === page ? 'bg-[var(--color-primary)] text-white shadow-soft' : 'text-nuit/60 hover:bg-cloud hover:text-nuit'}`}
            >
              {p}
            </button>
          )
        )}
        <button onClick={() => goto(page + 1)} disabled={page === pageCount} className={`${btn} ${page === pageCount ? 'cursor-not-allowed text-nuit/20' : 'text-nuit/60 hover:bg-cloud hover:text-nuit'}`} aria-label="Page suivante">
          <ChevronRight size={16} />
        </button>
      </div>
      {onSizeChange && (
        <label className="flex items-center gap-2 text-sm text-nuit/50">
          Par page
          <select value={pageSize} onChange={(e) => onSizeChange(Number(e.target.value))} className="input max-w-[90px] py-2">
            {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      )}
    </div>
  )
}