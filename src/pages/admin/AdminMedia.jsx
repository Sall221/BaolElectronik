import { useEffect, useRef, useState } from 'react'
import { Upload, Trash2, Copy, ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMedia, uploadMedia, deleteMedia } from '../../lib/api'
import Pagination from '../../components/Pagination'

const SIZES = [8, 12, 24, 48]

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

export default function AdminMedia() {
  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(SIZES[0])
  const inputRef = useRef()

  useEffect(() => { getMedia().then(setItems).catch(() => setItems([])) }, [])

  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const shown = items.slice((safePage - 1) * pageSize, safePage * pageSize)

  const onFiles = async (files) => {
    setBusy(true)
    try {
      for (const f of files) {
        if (f.size > 2 * 1024 * 1024) {
          toast.error(`${f.name} : 2 Mo max en mode local (utilisez Supabase Storage pour plus)`)
          continue
        }
        const dataUrl = await fileToDataUrl(f)
        await uploadMedia(f.name, dataUrl)
      }
      await getMedia().then(setItems)
      toast.success('Image(s) importée(s)')
    } catch {
      toast.error('Échec de l\'upload')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Supprimer cette image ?')) return
    await deleteMedia(id)
    setItems((prev) => prev.filter((m) => m.id !== id))
    toast.success('Image supprimée')
  }

  const copy = (url) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copiée')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-nuit">Médiathèque</h1>
          <p className="mt-1 text-sm text-nuit/50">{items.length} image(s)</p>
        </div>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => onFiles([...e.target.files])}
          />
          <button onClick={() => inputRef.current?.click()} disabled={busy} className="btn-primary py-3">
            <Upload size={16} /> {busy ? 'Import...' : 'Uploader des images'}
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-card flex flex-col items-center py-16 text-center">
          <ImageIcon size={36} className="text-nuit/15" />
          <p className="mt-4 font-semibold text-nuit/50">Aucune image dans la médiathèque</p>
          <p className="mt-1 text-xs text-nuit/40">Uploadez des visuels produits, bannières, logo...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((m) => (
            <div key={m.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 ring-1 ring-gray-100">
              <img src={m.url} alt={m.name} className="h-14 w-14 shrink-0 rounded-xl bg-cloud object-cover ring-1 ring-gray-100" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-nuit">{m.name}</p>
                <p className="truncate text-xs text-nuit/40">{m.url}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => copy(m.url)} className="rounded-lg p-2 text-nuit/40 transition hover:bg-cloud hover:text-[var(--color-primary)]" title="Copier l'URL">
                  <Copy size={15} />
                </button>
                <button onClick={() => remove(m.id)} className="rounded-lg p-2 text-nuit/40 transition hover:bg-red-50 hover:text-red-500" title="Supprimer">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <Pagination page={safePage} pageSize={pageSize} total={items.length} onChange={setPage} onSizeChange={(s) => { setPageSize(s); setPage(1) }} sizes={SIZES} />
      )}
    </div>
  )
}
