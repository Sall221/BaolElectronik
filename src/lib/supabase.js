import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key && url.startsWith('http') && !url.includes('votre-projet'))

const realFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : fetch

async function supabaseFetch(input, init) {
  const info = typeof input === 'string' ? input : input instanceof URL ? input.href : input && input.url
  const proxyRest =
    import.meta.env.PROD && info && info.startsWith(url) && info.includes('/rest/v1')
  if (proxyRest) {
    const path = info.slice(url.length)
    let reqHeaders = {}
    if (init && init.headers) {
      if (typeof init.headers.forEach === 'function') {
        init.headers.forEach((v, k) => {
          reqHeaders[k] = v
        })
      } else {
        reqHeaders = { ...init.headers }
      }
    }
    const reqBody = init && init.body !== undefined && init.body !== null ? init.body : undefined
    const res = await realFetch('/.netlify/functions/sb', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: (init && init.method) || 'GET', path, reqHeaders, reqBody }),
    })
    const data = await res.json()
    return new Response(data.body, { status: data.status || 500, headers: data.headers || {} })
  }
  return realFetch(input, init)
}

export const supabase = isSupabaseConfigured ? createClient(url, key, { global: { fetch: supabaseFetch } }) : null