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

export function sbUrl(u) {
  if (!u || typeof u !== 'string') return u
  const base = import.meta.env.VITE_SUPABASE_URL
  if (!base || !u.startsWith(base)) return u
  return '/supabase' + u.slice(base.length)
}

function mapDeep(v) {
  try {
    return JSON.parse(JSON.stringify(v), (_k, s) => (typeof s === 'string' ? sbUrl(s) : s))
  } catch {
    return v
  }
}

function isMissingTable(error) {
  return Boolean(
    error &&
    (error.code === 'PGRST205' || /Could not find the table/i.test(`${error.message || ''} ${error.details || ''}`))
  )
}

export async function tableExists(name) {
  if (!isSupabaseConfigured) return true
  const { error } = await supabase.from(name).select('id').limit(1)
  if (!error) return true
  return !isMissingTable(error)
}

// ---------- CACHE HORS-LIGNE ----------
// Chaque lecture réussie est stockée localement ; en cas de réseau instable,
// la valeur en cache est renvoyée à la place de lever une erreur.
const CACHE_PREFIX = 'baol_cache_'

function cacheRead(name) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + name)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function cacheWrite(name, value) {
  try {
    localStorage.setItem(CACHE_PREFIX + name, JSON.stringify(value))
  } catch {
    // stockage plein : on ignore, l'app continue en live
  }
}
export function readCache(name) {
  return cacheRead(name)
}

const offlineListeners = new Set()
let offlineNow = false
export function onNetworkChange(cb) {
  offlineListeners.add(cb)
  return () => offlineListeners.delete(cb)
}
function setOffline(v) {
  if (offlineNow === v) return
  offlineNow = v
  for (const cb of offlineListeners) {
    try {
      cb(v)
    } catch {
      // listener défaillant ignoré
    }
  }
}

function isNetworkError(error) {
  const msg = `${error?.message || ''} ${error?.details || ''} ${error?.cause?.message || ''}`
  return /failed to fetch|fetch failed|networkerror|load failed|offline|temporary failure|connection (reset|closed|timed out|refused)|socketerror|internet|network request/i.test(msg)
}

async function withCache(name, fetcher) {
  try {
    const data = await fetcher()
    cacheWrite(name, data)
    setOffline(false)
    return data
  } catch (err) {
    if (isNetworkError(err)) {
      const cached = cacheRead(name)
      if (cached !== null) {
        setOffline(true)
        return cached
      }
    }
    throw err
  }
}

function cacheUpsert(name, item) {
  const list = Array.isArray(cacheRead(name)) ? cacheRead(name) : []
  const idx = list.findIndex((x) => String(x.id) === String(item.id))
  const next = idx >= 0 ? [...list.slice(0, idx), item, ...list.slice(idx + 1)] : [item, ...list]
  cacheWrite(name, next)
}
function cacheRemoveItem(name, id) {
  const list = Array.isArray(cacheRead(name)) ? cacheRead(name) : []
  cacheWrite(name, list.filter((x) => String(x.id) !== String(id)))
}

// ---------- PRODUITS ----------
export async function getProducts() {
  if (isSupabaseConfigured) {
    return withCache('products', async () => {
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (error) {
        if (isMissingTable(error)) return []
        throw error
      }
      return mapDeep(data)
    })
  }
  return mapDeep(readLS(K.products, []))
}

export async function getProductBySlug(slug) {
  if (isSupabaseConfigured) {
    return withCache(`product_${slug}`, async () => {
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single()
      if (error) {
        if (isMissingTable(error) || error.code === 'PGRST116') return null
        throw error
      }
      return mapDeep(data)
    })
  }
  return mapDeep(readLS(K.products, [])).find((p) => p.slug === slug) || null
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
      cacheUpsert('products', data)
      return data
    }
    const { data, error } = await supabase.from('products').insert(payload).select().single()
    if (error) throw error
    cacheUpsert('products', data)
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
    cacheRemoveItem('products', id)
    return
  }
  writeLS(K.products, readLS(K.products, []).filter((p) => p.id !== id))
}

// ---------- COMMANDES ----------
export async function getOrders() {
  if (isSupabaseConfigured) {
    return withCache('orders', async () => {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      if (error) {
        if (isMissingTable(error)) return []
        throw error
      }
      return mapDeep(data)
    })
  }
  return mapDeep(readLS(K.orders, [])).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

export async function getOrder(id) {
  if (isSupabaseConfigured) {
    return withCache(`order_${id}`, async () => {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return mapDeep(data)
    })
  }
  return mapDeep(readLS(K.orders, [])).find((o) => o.id === id) || null
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
    cacheUpsert('orders', data)
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
    cacheUpsert('orders', data)
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
    const cached = Array.isArray(cacheRead('orders')) ? cacheRead('orders') : []
    const i = cached.findIndex((o) => String(o.id) === String(id))
    if (i >= 0) {
      cached[i] = { ...cached[i], ...fields }
      cacheWrite('orders', cached)
    }
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
      cacheUpsert('orders', data)
      return data
    }
    const payload = order.number ? order : { ...order, number: await nextOrderNumber() }
    const { data, error } = await supabase.from('orders').insert(payload).select().single()
    if (error) throw error
    cacheUpsert('orders', data)
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
    cacheRemoveItem('orders', id)
    return
  }
  writeLS(K.orders, readLS(K.orders, []).filter((o) => o.id !== id))
}

// ---------- PARAMÃˆTRES CMS ----------
export async function getSettings() {
  if (isSupabaseConfigured) {
    return withCache('settings', async () => {
      const { data, error } = await supabase.from('settings').select('data').eq('id', 1).single()
      if (error) {
        if (isMissingTable(error) || error.code === 'PGRST116') return { ...DEMO_SETTINGS }
        throw error
      }
      return { ...DEMO_SETTINGS, ...mapDeep(data?.data || {}) }
    })
  }
  return mapDeep(readLS(K.settings, DEMO_SETTINGS))
}

export async function saveSettings(settings) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('settings').update({ data: settings, updated_at: new Date().toISOString() }).eq('id', 1)
    if (error) throw error
    cacheWrite('settings', settings)
    setOffline(false)
    return settings
  }
  writeLS(K.settings, settings)
  return settings
}

// ---------- MÃ‰DIATHÃˆQUE ----------
export async function getMedia() {
  if (isSupabaseConfigured) {
    return withCache('media', async () => {
      const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false })
      if (error) {
        if (isMissingTable(error)) return []
        throw error
      }
      return mapDeep(data)
    })
  }
  return mapDeep(readLS(K.media, []))
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
    cacheUpsert('media', row)
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
    cacheRemoveItem('media', id)
    return
  }
  writeLS(K.media, readLS(K.media, []).filter((m) => m.id !== id))
}

// ---------- CLIENTS ----------
export async function getClients() {
  if (isSupabaseConfigured) {
    return withCache('clients', async () => {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
      if (error) {
        if (isMissingTable(error)) return []
        throw error
      }
      return mapDeep(data)
    })
  }
  return mapDeep(readLS(K.clients, [])).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
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
      cacheUpsert('clients', data)
      return data
    }
    const { data, error } = await supabase.from('clients').insert(payload).select().single()
    if (error) throw error
    cacheUpsert('clients', data)
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
    cacheRemoveItem('clients', id)
    return
  }
  writeLS(K.clients, readLS(K.clients, []).filter((c) => c.id !== id))
}

// ---------- AUTH ----------
async function roleForUser(userId, accessToken, authUser) {
  const meta = authUser?.user_metadata
  if (meta && typeof meta.role === 'string') return { role: meta.role, via: 'metadata' }
  if (userId && accessToken) {
    try {
      const { data } = await supabase.auth.getUser(accessToken)
      const m = data?.user?.user_metadata
      if (m && typeof m.role === 'string') return { role: m.role, via: 'metadata' }
    } catch {
      // on continue vers les autre sources
    }
  }
  let rpcDetail = null
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { data, error } = await supabase.rpc('get_my_role')
      if (!error && typeof data === 'string') return { role: data }
      if (error) {
        rpcDetail = `${error.code || ''} ${error.message || ''}`.trim()
        break
      }
    } catch (e) {
      rpcDetail = e?.message || 'rÃ©seau'
      if (attempt === 0 && userId) continue
    }
  }
  if (!userId) return { role: null, detail: rpcDetail ? `rpc: ${rpcDetail}` : 'rpc: null' }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const { error: profErr, data: profile } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle()
      if (!profErr && profile?.role) return { role: profile.role }
      if (profErr) return { role: null, detail: `profiles: ${profErr.code || ''} ${profErr.message || ''}`.trim() }
      return { role: null, detail: 'profiles: vide (ligne absente ou bloquÃ©e par RLS)' }
    } catch (e) {
      if (attempt === 0) continue
    }
  }
  try {
    const res = await fetch('/.netlify/functions/role-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken || '', user_id: userId }),
    })
    const out = await res.json()
    if (res.ok && typeof out.role === 'string') return { role: out.role, via: 'serveur' }
    return { role: null, detail: `serveur: ${out.error || 'rÃ´le vide'}` }
  } catch (e) {
    return { role: null, detail: `profiles: ${e?.message || 'rÃ©seau'}` }
  }
}

export async function login(email, password) {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('invalid login') || msg.includes('invalid_credentials')) {
        throw new Error('Email ou mot de passe incorrect.')
      }
      if (msg.includes('email not confirmed')) {
        throw new Error("Votre email n'est pas encore confirmÃ©. VÃ©rifiez votre boÃ®te de rÃ©ception.")
      }
      throw error
    }
    const { role, detail } = await roleForUser(data.user.id, data.session.access_token, data.user)
    if (role !== 'admin') {
      await supabase.auth.signOut()
      const erratic = /rÃ©seau|failed to fetch|typeerror/i.test(detail || '')
      if (erratic) {
        const metaOk = !!data.user?.user_metadata?.role
        const sql =
          `update auth.users set raw_user_meta_data = coalesce(raw_user_meta_data,'{}'::jsonb) ` +
          `|| '{"role":"admin"}'::jsonb where id = '1349b9ab-468b-479e-a3aa-3ba23612519e';`
        throw new Error(
          `RÃ´le non vÃ©rifiable : ${detail}. ` +
            (metaOk
              ? 'RÃ©essaye dans un instant.'
              : 'Le rÃ´le admin manque dans les mÃ©tadonnÃ©es du compte. ' +
                "Ouvre le Dashboard Supabase > SQL Editor > New query, colle ceci exactement, puis clique Run (1 ligne) :\n\n" +
                sql +
                '\n\nPuis reconnecte-toi.')
        )
      }
      throw new Error(`AccÃ¨s refusÃ© : compte administrateur requis. (rÃ´le lu : ${String(role)}${detail ? ` â€” dÃ©tail : ${detail}` : ''})`)
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
  throw new Error('Identifiants incorrects. (DÃ©mo : admin@baol.sn / admin123)')
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured) throw new Error('Configurer Supabase pour rÃ©initialiser le mot de passe')
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const { error } = await supabase.auth.resetPasswordForEmail(email, origin ? { redirectTo: `${origin}/admin/reinitialiser` } : undefined)
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
    const { role } = await roleForUser(data.session.user.id, data.session.access_token, data.session.user)
    if (role !== 'admin') return null
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
    const localAvatar = readLS('baol_profile_avatar', '')
    return {
      ...DEFAULT_PROFILE,
      name: meta.name || DEFAULT_PROFILE.name,
      email: user?.email || '',
      phone: meta.phone || '',
      avatar: sbUrl(localAvatar || meta.avatar || '')
    }
  }
  return { ...DEFAULT_PROFILE, ...readLS(K.profile, {}) }
}

export async function saveProfile(profile) {
  if (isSupabaseConfigured) {
    let currentEmail = null
    try {
      const { data } = await supabase.auth.getUser()
      currentEmail = data?.user?.email || null
    } catch {
      // on continue sans comparaison d'email
    }
    const attrs = {}
    if (profile.email && profile.email !== currentEmail) attrs.email = profile.email
    if (profile.password) attrs.password = profile.password
    const isDataUrl = !!profile.avatar && typeof profile.avatar === 'string' && profile.avatar.startsWith('data:')
    if (isDataUrl) writeLS('baol_profile_avatar', profile.avatar)
    attrs.data = { name: profile.name || '', phone: profile.phone || '', avatar: isDataUrl ? '' : profile.avatar || '' }
    const { error } = await supabase.auth.updateUser(attrs)
    if (error) {
      const msg = (error.message || '').toLowerCase()
      if (msg.includes('invalid jwt') || msg.includes('expired')) {
        throw new Error('Session expirÃ©e â€” reconnectez-vous puis rÃ©essayez.')
      }
      if (msg.includes('not allowed') || msg.includes('forbidden')) {
        throw new Error('Supabase a refusÃ© la modification. Reconnectez-vous puis rÃ©essayez.')
      }
      if (msg.includes('already registered') || msg.includes('duplicate')) {
        throw new Error('Cet email est dÃ©jÃ  utilisÃ© par un autre compte.')
      }
      throw error
    }
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
    `ðŸ›ï¸ *NOUVELLE COMMANDE â€” Baol Electronik*`,
    `RÃ©fÃ©rence : *${order.number}*`,
    '',
    'ðŸ“¦ *Articles :*'
  ]
  order.items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name}`)
    if (it.color) lines.push(`   â€¢ Couleur : ${it.color}`)
    if (it.storage) lines.push(`   â€¢ Stockage : ${it.storage}`)
    lines.push(`   â€¢ QuantitÃ© : ${it.qty} â€” ${Number(it.price).toLocaleString('fr-FR')} FCFA`)
  })
  lines.push('')
  lines.push(`ðŸ’° *Total : ${Number(order.total).toLocaleString('fr-FR')} FCFA*`)
  lines.push('')
  lines.push('Bonjour, je souhaite confirmer cette commande. Voici mes informations de livraison :')
  lines.push(`ðŸ“ *Nom :* ${order.customer_name || ''}`)
  lines.push(`ðŸ“ž *TÃ©lÃ©phone :* ${order.customer_phone || ''}`)
  if (order.customer_email) lines.push(`ðŸ“§ *Email :* ${order.customer_email}`)
  if (order.customer_city) lines.push(`ðŸ™ï¸ *Ville :* ${order.customer_city}`)
  if (order.customer_address) lines.push(`ðŸ  *Adresse de livraison :* ${order.customer_address}`)
  const num = String(settings?.whatsapp || DEFAULT_WHATSAPP).replace(/\D/g, '')
  return `https://wa.me/${num}?text=${encodeURIComponent(lines.join('\n'))}`
}

export function buildOrderFollowUpUrl(order, settings) {
  const num = String(settings?.whatsapp || DEFAULT_WHATSAPP).replace(/\D/g, '')
  const msg = `Bonjour, je vous recontacte au sujet de ma commande ${order.number} (Baol Electronik). Merci de me confirmer son statut.`
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`
}
