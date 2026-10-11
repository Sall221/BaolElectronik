const FALLBACK_URL = 'https://nplrhdqyuuqcdhsnpawb.supabase.co'
const FALLBACK_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wbHJoZHF5dXVxY2Roc25wYXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MzU0NjgsImV4cCI6MjEwNzIxMTQ2OH0.oElQ1BdNOxfhXM3NwpRAkqk8G2MDl6Emj379bcdc9yk'

export const handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST requis' }) }
  }
  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'JSON invalide' }) }
  }
  const token = body.access_token
  const userId = body.user_id
  if (!token || !userId) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'token ou user_id manquant' }) }
  }

  const url = process.env.VITE_SUPABASE_URL || FALLBACK_URL
  const apikey = process.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY
  const authHeaders = { apikey, Authorization: `Bearer ${token}`, Accept: 'application/json' }

  let rpcStatus = 0
  try {
    const rpc = await fetch(`${url}/rest/v1/rpc/get_my_role`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: '{}',
    })
    rpcStatus = rpc.status
    if (rpc.ok) {
      const role = await rpc.json()
      if (typeof role === 'string' && role) {
        return { statusCode: 200, headers, body: JSON.stringify({ role, via: 'rpc' }) }
      }
    }
  } catch {
    // on continue vers le plan B
  }

  let profStatus = 0
  try {
    const prof = await fetch(`${url}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(userId)}`, {
      headers: authHeaders,
    })
    profStatus = prof.status
    if (prof.ok) {
      const rows = await prof.json()
      if (Array.isArray(rows) && rows[0]?.role) {
        return { statusCode: 200, headers, body: JSON.stringify({ role: rows[0].role, via: 'profiles' }) }
      }
    }
  } catch {
    // on renvoie l'échec
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ error: `rôle vide (rpc ${rpcStatus || 'réseau'} / profiles ${profStatus || 'réseau'})` }),
  }
}