import { DEFAULT_WHATSAPP, DEFAULT_CATEGORY_TREE } from './constants'

const img = (id) => `https://images.unsplash.com/${id}?w=900&q=80`

export const DEMO_PRODUCTS = [
  {
    id: 'p1', name: 'iPhone 16 Pro Max', slug: 'iphone-16-pro-max',
    description: "L'iPhone 16 Pro Max redéfinit la puissance mobile avec la puce A18 Pro, un écran Super Retina XDR 6,9\" et un appareil photo 48 Mpx révolutionnaire. Titane premium, autonomie exceptionnelle.",
    price: 899000, old_price: 1050000, stock: 25, category: 'Smartphones', brand: 'Apple',
    images: [img('photo-1592750475338-74b7b21085ab'), img('photo-1511707171634-5f897ff02aa9')],
    colors: [{ name: 'Titane Naturel', hex: '#B8AFA3' }, { name: 'Titane Noir', hex: '#2C2C2E' }, { name: 'Titane Blanc', hex: '#E8E6E3' }],
    storage: [{ label: '256 Go', delta: 0 }, { label: '512 Go', delta: 120000 }, { label: '1 To', delta: 250000 }],
    rating: 4.9, reviews_count: 128, featured: true, created_at: new Date(Date.now() - 12 * 864e5).toISOString()
  },
  {
    id: 'p2', name: 'Samsung Galaxy S25 Ultra', slug: 'galaxy-s25-ultra',
    description: 'Galaxy S25 Ultra : Galaxy AI, S Pen intégré, écran AMOLED 6,9" et triple capteur 200 Mpx. Le sommet de la technologie Samsung.',
    price: 749000, old_price: 899000, stock: 30, category: 'Smartphones', brand: 'Samsung',
    images: [img('photo-1610945265064-0e34e5519bbf'), img('photo-1565849904461-04a58ad377e0')],
    colors: [{ name: 'Violet Titanium', hex: '#6B5B8E' }, { name: 'Gris Acier', hex: '#8E8E93' }, { name: 'Noir', hex: '#1C1C1E' }],
    storage: [{ label: '256 Go', delta: 0 }, { label: '512 Go', delta: 100000 }, { label: '1 To', delta: 200000 }],
    rating: 4.8, reviews_count: 94, featured: true, created_at: new Date(Date.now() - 10 * 864e5).toISOString()
  },
  {
    id: 'p3', name: 'Google Pixel 9 Pro', slug: 'pixel-9-pro',
    description: "Pixel 9 Pro : l'IA de Google au service de la photo. Puce Tensor G4, écran Super Actua et 7 ans de mises à jour.",
    price: 549000, old_price: 649000, stock: 18, category: 'Smartphones', brand: 'Google',
    images: [img('photo-1598327105666-5b89351aff97')],
    colors: [{ name: 'Obsidienne', hex: '#1C1C1E' }, { name: 'Porcelaine', hex: '#F0EBE3' }, { name: 'Iris', hex: '#7B6C9E' }],
    storage: [{ label: '128 Go', delta: 0 }, { label: '256 Go', delta: 70000 }],
    rating: 4.7, reviews_count: 61, featured: true, created_at: new Date(Date.now() - 8 * 864e5).toISOString()
  },
  {
    id: 'p4', name: 'Xiaomi 14 Ultra', slug: 'xiaomi-14-ultra',
    description: 'Xiaomi 14 Ultra : optique Leica Summilux, écran AMOLED WQHD+ 120 Hz et charge 90W. Photo de niveau professionnel.',
    price: 629000, old_price: 749000, stock: 12, category: 'Smartphones', brand: 'Xiaomi',
    images: [img('photo-1585060544812-6b45742d762f')],
    colors: [{ name: 'Noir', hex: '#1C1C1E' }, { name: 'Blanc', hex: '#F5F5F7' }],
    storage: [{ label: '256 Go', delta: 0 }, { label: '512 Go', delta: 90000 }],
    rating: 4.6, reviews_count: 47, featured: true, created_at: new Date(Date.now() - 6 * 864e5).toISOString()
  },
  {
    id: 'p5', name: 'iPhone 15', slug: 'iphone-15',
    description: "iPhone 15 : Dynamic Island, capteur 48 Mpx, USB-C et puce A16 Bionic. L'essentiel d'iPhone, en aluminium et verre.",
    price: 499000, old_price: 599000, stock: 40, category: 'Smartphones', brand: 'Apple',
    images: [img('photo-1511707171634-5f897ff02aa9')],
    colors: [{ name: 'Rose', hex: '#F2D4D0' }, { name: 'Bleu', hex: '#A9C4D6' }, { name: 'Noir', hex: '#1C1C1E' }, { name: 'Jaune', hex: '#F5E6A8' }],
    storage: [{ label: '128 Go', delta: 0 }, { label: '256 Go', delta: 80000 }],
    rating: 4.8, reviews_count: 203, featured: false, created_at: new Date(Date.now() - 20 * 864e5).toISOString()
  },
  {
    id: 'p6', name: 'Samsung Galaxy A55', slug: 'galaxy-a55',
    description: 'Galaxy A55 : écran Super AMOLED 120 Hz, caméra 50 Mpx et batterie 5000 mAh. Le meilleur rapport qualité-prix.',
    price: 289000, old_price: 349000, stock: 55, category: 'Smartphones', brand: 'Samsung',
    images: [img('photo-1565849904461-04a58ad377e0')],
    colors: [{ name: 'Iceblue', hex: '#B7CDD9' }, { name: 'Lilac', hex: '#C9B8D6' }, { name: 'Graphite', hex: '#3A3A3C' }],
    storage: [{ label: '128 Go', delta: 0 }, { label: '256 Go', delta: 50000 }],
    rating: 4.5, reviews_count: 88, featured: false, created_at: new Date(Date.now() - 15 * 864e5).toISOString()
  },
  {
    id: 'p7', name: 'AirPods Pro 2 (USB-C)', slug: 'airpods-pro-2',
    description: 'AirPods Pro 2 avec USB-C : réduction de bruit active, audio adaptatif et boîtier MagSafe. Son immersif partout.',
    price: 229000, old_price: 269000, stock: 60, category: 'Audio', brand: 'Apple',
    images: [img('photo-1590658268037-6bf12165a8df'), img('photo-1600294037681-c80b4cb5b434')],
    colors: [{ name: 'Blanc', hex: '#F5F5F7' }],
    storage: [],
    rating: 4.9, reviews_count: 312, featured: true, created_at: new Date(Date.now() - 5 * 864e5).toISOString()
  },
  {
    id: 'p8', name: 'Casque Sony WH-1000XM5', slug: 'sony-wh-1000xm5',
    description: "Casque sans fil ANC leader du marché : 30 heures d'autonomie, audio haute résolution et microphones haute précision.",
    price: 349000, old_price: 399000, stock: 22, category: 'Audio', brand: 'Sony',
    images: [img('photo-1505740420928-5e560c06d30e'), img('photo-1546435770-a3e426bf472b')],
    colors: [{ name: 'Noir', hex: '#1C1C1E' }, { name: 'Bleu', hex: '#2E4A6B' }, { name: 'Argent', hex: '#C0C0C0' }],
    storage: [],
    rating: 4.8, reviews_count: 176, featured: false, created_at: new Date(Date.now() - 18 * 864e5).toISOString()
  },
  {
    id: 'p9', name: 'Apple Watch Series 10', slug: 'apple-watch-s10',
    description: 'Apple Watch Series 10 : écran OLED plus grand, capteurs santé avancés et charge rapide. Votre allié santé au quotidien.',
    price: 399000, old_price: 459000, stock: 28, category: 'Montres', brand: 'Apple',
    images: [img('photo-1523275335684-37898b6baf30'), img('photo-1579586337278-3befd40fd17a')],
    colors: [{ name: 'Acier Noir', hex: '#1C1C1E' }, { name: 'Acier Crème', hex: '#E8DCC8' }],
    storage: [{ label: '42 mm', delta: 0 }, { label: '46 mm', delta: 40000 }],
    rating: 4.7, reviews_count: 95, featured: true, created_at: new Date(Date.now() - 9 * 864e5).toISOString()
  },
  {
    id: 'p10', name: 'Chargeur GaN 100W', slug: 'chargeur-gan-100w',
    description: 'Chargeur rapide GaN 100W avec 3 ports USB-C + USB-A. Chargez laptop, smartphone et écouteurs simultanément.',
    price: 49000, old_price: 69000, stock: 120, category: 'Accessoires', brand: 'Anker',
    images: [img('photo-1609091839311-d5365f9ff1c5')],
    colors: [{ name: 'Blanc', hex: '#F5F5F7' }, { name: 'Noir', hex: '#1C1C1E' }],
    storage: [],
    rating: 4.6, reviews_count: 54, featured: false, created_at: new Date(Date.now() - 25 * 864e5).toISOString()
  },
  {
    id: 'p11', name: 'Powerbank 20 000 mAh', slug: 'powerbank-20000',
    description: 'Batterie externe 20 000 mAh avec charge rapide 65W et affichage LED. Autonomie pour plusieurs jours.',
    price: 39000, old_price: 49000, stock: 85, category: 'Accessoires', brand: 'Anker',
    images: [img('photo-1609592806596-b43bada2f4be')],
    colors: [{ name: 'Noir', hex: '#1C1C1E' }],
    storage: [],
    rating: 4.5, reviews_count: 41, featured: false, created_at: new Date(Date.now() - 30 * 864e5).toISOString()
  },
  {
    id: 'p12', name: 'Enceinte JBL Flip 6', slug: 'jbl-flip-6',
    description: "Enceinte portable JBL Flip 6 : son JBL Original Pro, résistance IP67 et 12 heures d'écoute.",
    price: 129000, old_price: 159000, stock: 40, category: 'Audio', brand: 'JBL',
    images: [img('photo-1608043152269-423dbba4e7e1')],
    colors: [{ name: 'Noir', hex: '#1C1C1E' }, { name: 'Bleu', hex: '#1E40AF' }, { name: 'Rouge', hex: '#B22222' }],
    storage: [],
    rating: 4.7, reviews_count: 133, featured: false, created_at: new Date(Date.now() - 22 * 864e5).toISOString()
  }
]

export const DEMO_SETTINGS = {
  primary: '#1E40AF',
  secondary: '#0A1929',
  whatsapp: DEFAULT_WHATSAPP,
  logo: '',
  favicon: '',
  categories: DEFAULT_CATEGORY_TREE,
  payments: [],
  hero: {
    title: 'Légère. Rapide. Sans limites.',
    subtitle: "Découvrez l'iPhone 16 Pro et toute une gamme de tech premium à prix imbattables.",
    cta: 'Acheter Maintenant',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80'
  },
  promo: {
    title: 'Jusqu\'à 30% de réduction',
    text: "Offres exceptionnelles sur une sélection de smartphones et accessoires. Stock limité !",
    discount: '-30%'
  },
  footer: {
    text: 'Baol Electronik — Votre boutique tech premium de confiance. Smartphones, accessoires et plus encore.'
  },
  address: 'Dakar, Sénégal',
  email: 'contact@baolelectronik.sn'
}

const day = (n) => new Date(Date.now() - n * 864e5).toISOString()

export const DEMO_ORDERS = [
  { id: 'o1', number: 'BE-1001', status: 'delivered', total: 919000, customer_name: 'Aminata Diop', customer_phone: '+221 77 123 45 67', customer_city: 'Dakar', created_at: day(12), items: [{ product_id: 'p1', name: 'iPhone 16 Pro Max', price: 899000, qty: 1, color: 'Titane Noir', storage: '256 Go', image: DEMO_PRODUCTS[0].images[0] }] },
  { id: 'o2', number: 'BE-1002', status: 'delivered', total: 229000, customer_name: 'Moussa Ba', customer_phone: '+221 76 555 44 33', customer_city: 'Thiès', created_at: day(10), items: [{ product_id: 'p7', name: 'AirPods Pro 2 (USB-C)', price: 229000, qty: 1, color: 'Blanc', storage: '', image: DEMO_PRODUCTS[6].images[0] }] },
  { id: 'o3', number: 'BE-1003', status: 'shipped', total: 749000, customer_name: 'Fatou Ndiaye', customer_phone: '+221 78 222 11 00', customer_city: 'Dakar', created_at: day(7), items: [{ product_id: 'p2', name: 'Samsung Galaxy S25 Ultra', price: 749000, qty: 1, color: 'Violet Titanium', storage: '256 Go', image: DEMO_PRODUCTS[1].images[0] }] },
  { id: 'o4', number: 'BE-1004', status: 'shipped', total: 598000, customer_name: 'Ibrahima Sow', customer_phone: '+221 70 999 88 77', customer_city: 'Saint-Louis', created_at: day(5), items: [{ product_id: 'p3', name: 'Google Pixel 9 Pro', price: 549000, qty: 1, color: 'Obsidienne', storage: '128 Go', image: DEMO_PRODUCTS[2].images[0] }, { product_id: 'p10', name: 'Chargeur GaN 100W', price: 49000, qty: 1, color: 'Noir', storage: '', image: DEMO_PRODUCTS[9].images[0] }] },
  { id: 'o5', number: 'BE-1005', status: 'pending', total: 1128000, customer_name: 'Aïssatou Fall', customer_phone: '+221 77 888 77 66', customer_city: 'Ziguinchor', created_at: day(3), items: [{ product_id: 'p1', name: 'iPhone 16 Pro Max', price: 899000, qty: 1, color: 'Titane Naturel', storage: '256 Go', image: DEMO_PRODUCTS[0].images[0] }, { product_id: 'p7', name: 'AirPods Pro 2 (USB-C)', price: 229000, qty: 1, color: 'Blanc', storage: '', image: DEMO_PRODUCTS[6].images[0] }] },
  { id: 'o6', number: 'BE-1006', status: 'pending', total: 349000, customer_name: 'Cheikh Kane', customer_phone: '+221 76 111 22 33', customer_city: 'Dakar', created_at: day(2), items: [{ product_id: 'p8', name: 'Casque Sony WH-1000XM5', price: 349000, qty: 1, color: 'Noir', storage: '', image: DEMO_PRODUCTS[7].images[0] }] },
  { id: 'o7', number: 'BE-1007', status: 'pending', total: 548000, customer_name: 'Mariama Cissé', customer_phone: '+221 77 444 55 66', customer_city: 'Kaolack', created_at: day(1), items: [{ product_id: 'p9', name: 'Apple Watch Series 10', price: 399000, qty: 1, color: 'Acier Noir', storage: '42 mm', image: DEMO_PRODUCTS[8].images[0] }, { product_id: 'p12', name: 'Enceinte JBL Flip 6', price: 129000, qty: 1, color: 'Bleu', storage: '', image: DEMO_PRODUCTS[11].images[0] }] },
  { id: 'o8', number: 'BE-1008', status: 'cancelled', total: 289000, customer_name: 'Ousmane Dieng', customer_phone: '+221 70 333 22 11', customer_city: 'Mbour', created_at: day(6), items: [{ product_id: 'p6', name: 'Samsung Galaxy A55', price: 289000, qty: 1, color: 'Lilac', storage: '128 Go', image: DEMO_PRODUCTS[5].images[0] }] }
]
