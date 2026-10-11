import { useStore } from '../context/StoreContext'

export default function OfflineBanner() {
  const { online } = useStore()
  if (online) return null
  return (
    <div className="fixed bottom-4 left-1/2 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-card">
      Réseau instable — données en cache, reconnexion...
    </div>
  )
}