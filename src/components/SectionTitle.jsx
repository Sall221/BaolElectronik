export default function SectionTitle({ eyebrow, title, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">{eyebrow}</span>
        )}
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-nuit sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  )
}
