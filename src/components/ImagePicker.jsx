import { useEffect, useRef, useState } from 'react'
import { Upload, Images, X, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMedia } from '../lib/api'

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export function MediaLibraryModal({ onPick, onClose }) {
  const [items, setItems] = useState([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    getMedia()
      .then((m) => setItems(m))
      .catch(() => setItems([]))
      .finally(() => setReady(true))
  }, [])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-nuit/60" onClick={onClose} />
      <div className="relative max-h-[80vh] w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-sm font-bold text-nuit">Choisir dans la médiathèque</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-nuit/40 hover:bg-cloud hover:text-nuit"><X size={16} /></button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-3">
          {!ready && <p className="px-2 py-6 text-center text-sm text-nuit/40">Chargement...</p>}
          {ready && items.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-nuit/40">Aucune image disponible. Uploadez-en depuis la Médiathèque.</p>
          )}
          <div className="space-y-2">
            {items.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onPick(m.url)}
                className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-cloud"
              >
                <img src={m.url} alt="" className="h-12 w-12 shrink-0 rounded-xl bg-cloud object-cover ring-1 ring-gray-100" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-nuit">{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ImagePicker({ label, value, onChange, hint, preview = 'h-20 w-20' }) {
  const fileRef = useRef()
  const [open, setOpen] = useState(false)

  const pickFile = async (file) => {
    if (!file) return
    if (file.size > 1024 * 1024) return toast.error('Fichier trop volumineux (1 Mo max)')
    try {
      onChange(await fileToDataUrl(file))
      toast.success('Image chargée')
    } catch {
      toast.error('Lecture du fichier impossible')
    }
  }

  return (
    <div>
      {label && <label className="label">{label}</label>}
      <div className="flex items-start gap-3">
        <div className={`${preview} flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-cloud ring-1 ring-gray-100`}>
          {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <ImageIcon size={20} className="text-nuit/25" />}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex gap-2">
            <input
              className="input"
              placeholder="https://... ou coller une URL"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
            />
            {value && (
              <button type="button" onClick={() => onChange('')} className="btn-secondary shrink-0 px-3" title="Retirer">
                <X size={15} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary py-2 text-xs">
              <Upload size={14} /> Fichier
            </button>
            <button type="button" onClick={() => setOpen(true)} className="btn-secondary py-2 text-xs">
              <Images size={14} /> Médiathèque
            </button>
            {value && (
              <button type="button" onClick={() => onChange('')} className="btn-secondary py-2 text-xs">
                Retirer
              </button>
            )}
          </div>
          {hint && <p className="text-[11px] text-nuit/40">{hint}</p>}
        </div>
      </div>
      {open && <MediaLibraryModal onPick={(url) => { onChange(url); setOpen(false) }} onClose={() => setOpen(false)} />}
    </div>
  )
}
