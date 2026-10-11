const FALLBACK_URL = 'https://nplrhdqyuuqcdhsnpawb.supabase.co'

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
  const { method = 'GET', path = '', reqHeaders = {}, reqBody } = body
  if (!path) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'chemin manquant' }) }
  }
  const base = process.env.VITE_SUPABASE_URL || FALLBACK_URL
  const init = { method, headers: reqHeaders }
  if (reqBody !== null && reqBody !== undefined) {
    init.body = typeof reqBody === 'string' ? reqBody : JSON.stringify(reqBody)
  }
  let status = 0
  let text = ''
  const forwarded = {}
  try {
    const r = await fetch(`${base}${path}`, init)
    status = r.status
    text = await r.text()
    const keep = [
      'content-type',
      'content-range',
      'content-location',
      'cache-control',
      'etag',
      'vary',
      'preference-applied',
    ]
    for (const k of keep) {
      const v = r.headers.get(k)
      if (v) forwarded[k] = v
    }
  } catch (e) {
    text = `network: ${e && e.message ? e.message : 'fetch'}`
  }
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ status, body: text, headers: forwarded }),
  }
}