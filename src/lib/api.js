import { supabase, isSupabaseConfigured } from './supabase'
import { DEMO_PRODUCTS, DEMO_SETTINGS, DEMO_ORDERS } from './demoData'
import { DEFAULT_WHATSAPP, slugify } from './constants'

const K = {
  products: 'baol_products',
  orders: 'baol_orders',
  settings: 'baol_settings',
  media: 'baol_media',
  clients: 'baol_clients',
  profile: 'baol_profile',
  auth: 'baol_auth'
}

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function ensureDemoSeed() {
  if (!localStorage.getItem(K.products)) writeLS(K.products, DEMO_PRODUCTS)
  if (!localStorage.getItem(K.orders)) writeLS(K.orders, DEMO_ORDERS)
  if (!localStorage.getItem(K.settings)) writeLS(K.settings, DEMO_SETTINGS)
  else {
    const s = JSON.parse(localStorage.getItem(K.settings))
    const next = { ...s }
    if (!next.whatsapp || next.whatsapp === '221770000000') next.whatsapp = DEFAULT_WHATSAPP
    if (next.address == null) next.address = DEMO_SETTINGS.address
    if (next.email == null) next.email = DEMO_SETTINGS.email
    if (JSON.stringify(next) !== JSON.stringify(s)) writeLS(K.settings, next)
  }
  if (!localStorage.getItem(K.media)) {
    writeLS(K.media, DEMO_PRODUCTS.flatMap((p) => p.images).slice(0, 8).map((url, i) => ({ id: `m${i}`, name: `media-${i + 1}.jpg`, url })))
  }
  if (!localStorage.getItem(K.clients)) {
    const map = new Map()
    for (const o of DEMO_ORDERS) {
      const key = o.customer_phone || o.customer_name
      if (!key || map.has(key)) continue
      map.set(key, {
        id: `c${map.size + 1}`,
        name: o.customer_name || '',
        phone: o.customer_phone || '',
        email: '',
        city: o.customer_city || '',
        address: '',
        note: '',
        created_at: o.created_at
      })
    }
    writeLS(K.clients, [...map.values()])
  }
}
if (!isSupabaseConfigured) ensureDemoSeed()

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

// ---------- PRODUITS ----------
export async function getProducts() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  return readLS(K.products, [])
}

export async function getProductBySlug(slug) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single()
    if (error) throw error
    return data
  }
  return readLS(K.products, []).find((p) => p.slug === slug) || null
}

export async function saveProduct(product) {
  const slug = product.slug || slugify(product.name)
  const payload = { ...product, slug }
  delete payload.id
  delete payload.created_at
  if (isSupabaseConfigured) {
    if (product.id) {
      const { data, error } = await supabase.from('products').update(payload).eq('id', product.id).select().single()
      if (error) throw error
      return data
    }
    const { data, error } = await supabase.from('products').insert(payload).select().single()
    if (error) throw error
    return data
  }
  const list = readLS(K.products, [])
  if (product.id) {
    const i = list.findIndex((p) => p.id === product.id)
    list[i] = { ...list[i], ...payload, id: product.id }
  } else {
    list.unshift({ ...payload, id: uid(), created_at: new Date().toISOString() })
  }
  writeLS(K.products, list)
  return payload
}

export async function deleteProduct(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLS(K.products, readLS(K.products, []).filter((p) => p.id !== id))
}

// ---------- COMMANDES ----------
export async function getOrders() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  return readLS(K.orders, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function getOrder(id) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
    if (error) throw error
    return data
  }
  return readLS(K.orders, []).find((o) => o.id === id) || null
}

async function nextOrderNumber() {
  if (isSupabaseConfigured) {
    const { count, error } = await supabase.from('orders').select('*', { count: 'exact', head: true })
    if (error) throw error
    return `BE-${1001 + (count || 0)}`
  }
  return `BE-${1001 + readLS(K.orders, []).length}`
}

export async function createOrder(order) {
  const number = await nextOrderNumber()
  const payload = { ...order, number }
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').insert(payload).select().single()
    if (error) throw error
    return data
  }
  const list = readLS(K.orders, [])
  const full = { ...payload, id: uid(), created_at: new Date().toISOString() }
  list.unshift(full)
  writeLS(K.orders, list)
  return full
}

export async function updateOrderStatus(id, status) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('orders').update({ status }).eq('id', id).select().single()
    if (error) throw error
    return data
  }
  const list = readLS(K.orders, [])
  const i = list.findIndex((o) => o.id === id)
  if (i >= 0) list[i].status = status
  writeLS(K.orders, list)
  return list[i]
}

export async function updateOrderCustomer(id, fields) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('orders').update(fields).eq('id', id)
    if (error) throw error
    return
  }
  const list = readLS(K.orders, [])
  const i = list.findIndex((o) => o.id === id)
  if (i >= 0) list[i] = { ...list[i], ...fields }
  writeLS(K.orders, list)
}

export async function saveOrder(order) {
  if (isSupabaseConfigured) {
    if (order.id) {
      const { id, ...payload } = order
      const { data, error } = await supabase.from('orders').update(payload).eq('id', id).select().single()
      if (error) throw error
      return data
    }
    const payload = order.number ? order : { ...order, number: await nextOrderNumber() }
    const { data, error } = await supabase.from('orders').insert(payload).select().single()
    if (error) throw error
    return data
  }
  const list = readLS(K.orders, [])
  if (order.id) {
    const i = list.findIndex((o) => o.id === order.id)
    if (i < 0) throw new Error('Commande introuvable')
    list[i] = { ...list[i], ...order }
    writeLS(K.orders, list)
    return list[i]
  }
  const full = { ...order, number: order.number || `BE-${1001 + list.length}`, id: uid(), created_at: order.created_at || new Date().toISOString() }
  list.unshift(full)
  writeLS(K.orders, list)
  return full
}

export async function deleteOrder(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('orders').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLS(K.orders, readLS(K.orders, []).filter((o) => o.id !== id))
}

// ---------- PARAMÈTRES CMS ----------
export async function getSettings() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('settings').select('data').eq('id', 1).single()
    if (error) throw error
    return { ...DEMO_SETTINGS, ...(data?.data || {}) }
  }
  return readLS(K.settings, DEMO_SETTINGS)
}

export async function saveSettings(settings) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('settings').update({ data: settings, updated_at: new Date().toISOString() }).eq('id', 1)
    if (error) throw error
    return settings
  }
  writeLS(K.settings, settings)
  return settings
}

// ---------- MÉDIATHÈQUE ----------
export async function getMedia() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  return readLS(K.media, [])
}

export async function uploadMedia(name, dataUrl) {
  if (isSupabaseConfigured) {
    const path = `${Date.now()}-${name}`
    const blob = await (await fetch(dataUrl)).blob()
    const { error: upErr } = await supabase.storage.from('media').upload(path, blob)
    if (upErr) throw upErr
    const { data } = supabase.storage.from('media').getPublicUrl(path)
    const { data: row, error } = await supabase.from('media').insert({ name, url: data.publicUrl }).select().single()
    if (error) throw error
    return row
  }
  const list = readLS(K.media, [])
  const row = { id: uid(), name, url: dataUrl, created_at: new Date().toISOString() }
  list.unshift(row)
  writeLS(K.media, list)
  return row
}

export async function deleteMedia(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('media').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLS(K.media, readLS(K.media, []).filter((m) => m.id !== id))
}

// ---------- CLIENTS ----------
export async function getClients() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
  return readLS(K.clients, []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function saveClient(client) {
  const payload = {
    name: client.name || '',
    phone: client.phone || '',
    email: client.email || '',
    city: client.city || '',
    address: client.address || '',
    note: client.note || ''
  }
  if (isSupabaseConfigured) {
    if (client.id) {
      const { data, error } = await supabase.from('clients').update(payload).eq('id', client.id).select().single()
      if (error) throw error
      return data
    }
    const { data, error } = await supabase.from('clients').insert(payload).select().single()
    if (error) throw error
    return data
  }
  const list = readLS(K.clients, [])
  if (client.id) {
    const i = list.findIndex((c) => c.id === client.id)
    if (i < 0) throw new Error('Client introuvable')
    list[i] = { ...list[i], ...payload }
    writeLS(K.clients, list)
    return list[i]
  }
  const full = { ...payload, id: uid(), created_at: new Date().toISOString() }
  list.unshift(full)
  writeLS(K.clients, list)
  return full
}

export async function deleteClient(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (error) throw error
    return
  }
  writeLS(K.clients, readLS(K.clients, []).filter((c) => c.id !== id))
}

// ---------- AUTH ----------
export async function login(email, password) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('invalid login') || msg.includes('invalid_credentials')) {
        throw new Error('Email ou mot de passe incorrect.')
      }
      if (msg.includes('email not confirmed')) {
        throw new Error("Votre email n'est pas encore confirmé. Vérifiez votre boîte de réception.")
      }
      throw error
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      throw new Error("Accès refusé : compte administrateur requis.")
    }
    return data.user
  }
  const profile = readLS(K.profile, {})
  const expectedEmail = profile.email || 'admin@baol.sn'
  const expectedPassword = profile.password || 'admin123'
  if (email === expectedEmail && password === expectedPassword) {
    const user = { id: 'demo-admin', email }
    writeLS(K.auth, user)
    return user
  }
  throw new Error('Identifiants incorrects. (Démo : admin@baol.sn / admin123)')
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured) throw new Error('Configurer Supabase pour réinitialiser le mot de passe')
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw error
}

export async function logout() {
  if (isSupabaseConfigured) {
    await supabase.auth.signOut()
    return
  }
  localStorage.removeItem(K.auth)
}

export async function getCurrentUser() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return null
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.session.user.id).single()
    if (profile?.role !== 'admin') return null
    return data.session.user
  }
  return readLS(K.auth, null)
}

// ---------- PROFIL ADMIN ----------
const DEFAULT_PROFILE = { name: 'Administrateur', email: 'admin@baol.sn', phone: '', avatar: '' }

export async function getProfile() {
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getUser()
    const user = data?.user
    const meta = user?.user_metadata || {}
    return { ...DEFAULT_PROFILE, name: meta.name || '', email: user?.email || '', phone: meta.phone || '', avatar: meta.avatar || '' }
  }
  return { ...DEFAULT_PROFILE, ...readLS(K.profile, {}) }
}

export async function saveProfile(profile) {
  if (isSupabaseConfigured) {
    const attrs = {}
    if (profile.email) attrs.email = profile.email
    if (profile.password) attrs.password = profile.password
    attrs.data = { name: profile.name || '', phone: profile.phone || '', avatar: profile.avatar || '' }
    const { error } = await supabase.auth.updateUser(attrs)
    if (error) throw error
    return getProfile()
  }
  writeLS(K.profile, {
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    avatar: profile.avatar || '',
    ...(profile.password ? { password: profile.password } : {})
  })
  if (profile.email) writeLS(K.auth, { id: 'demo-admin', email: profile.email })
  return getProfile()
}

// ---------- WHATSAPP ----------
export function buildWhatsAppMessage(order, settings) {
  const lines = [
    `🛍️ *NOUVELLE COMMANDE — Baol Electronik*`,
    `Référence : *${order.number}*`,
    '',
    '📦 *Articles :*'
  ]
  order.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name}`)
    if (it.color) lines.push(`   • Couleur : ${it.color}`)
    if (it.storage) lines.push(`   • Stockage : ${it.storage}`)
    lines.push(`   • Quantité : ${it.qty} — ${Number(it.price).toLocaleString('fr-FR')} FCFA`)
  })
  lines.push('')
  lines.push(`💰 *Total : ${Number(order.total).toLocaleString('fr-FR')} FCFA*`)
  lines.push('')
  lines.push('Bonjour, je souhaite confirmer cette commande. Voici mes informations de livraison :')
  lines.push(`📍 *Nom :* ${order.customer_name || ''}`)
  lines.push(`📞 *Téléphone :* ${order.customer_phone || ''}`)
  if (order.customer_email) lines.push(`📧 *Email :* ${order.customer_email}`)
  if (order.customer_city) lines.push(`🏙️ *Ville :* ${order.customer_city}`)
  if (order.customer_address) lines.push(`🏠 *Adresse de livraison :* ${order.customer_address}`)
  const num = String(settings?.whatsapp || DEFAULT_WHATSAPP).replace(/\D/g, '')
  return `https://wa.me/${num}?text=${encodeURIComponent(lines.join('\n'))}`
}

export function buildOrderFollowUpUrl(order, settings) {
  const num = String(settings?.whatsapp || DEFAULT_WHATSAPP).replace(/\D/g, '')
  const msg = `Bonjour, je vous recontacte au sujet de ma commande ${order.number} (Baol Electronik). Merci de me confirmer son statut.`
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}
