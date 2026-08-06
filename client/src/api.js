// Thin fetch wrapper around the backend API. Base URL defaults to the Vite
// dev proxy (/api -> http://localhost:4000) so no env config is needed locally.
const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request(path, options) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request to ${path} failed (${res.status})`)
  }
  return res.json()
}

export function getAccount() {
  return request('/account')
}

export function getTrades() {
  return request('/trades')
}

export function addTrade(trade) {
  return request('/trades', { method: 'POST', body: JSON.stringify(trade) })
}
