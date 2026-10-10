export const DEFAULT_WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || '221771242657'

export const CATEGORIES = ['Smartphones', 'Audio', 'Montres', 'Accessoires']

export const DEFAULT_CATEGORY_TREE = [
  { name: 'Smartphones', subcategories: ['Apple', 'Samsung', 'Google', 'Xiaomi'] },
  { name: 'Audio', subcategories: ['Écouteurs', 'Casques', 'Enceintes'] },
  { name: 'Montres', subcategories: ['Connectées', 'Sport'] },
  { name: 'Accessoires', subcategories: ['Chargeurs', 'Batteries', 'Coques'] }
]

export function normalizeCategories(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_CATEGORY_TREE
  return raw
    .map((c) => (typeof c === 'string' ? { name: c, subcategories: [] } : { name: c?.name || '', subcategories: Array.isArray(c?.subcategories) ? c.subcategories : [] }))
    .filter((c) => c.name)
}


export const BRANDS = ['Apple', 'Samsung', 'Google', 'Xiaomi', 'Sony', 'Anker', 'JBL']

export const ORDER_STATUS = {
  pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Validée', color: 'bg-green-100 text-green-700' },
  shipped: { label: 'Expédié', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Livré', color: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: 'Annulé', color: 'bg-red-100 text-red-700' }
}

export const formatPrice = (n) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(Number(n) || 0)

export const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
