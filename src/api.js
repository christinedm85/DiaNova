const BASE = '/api'

export async function getOpportunities(niche) {
  return request(`/opportunities?niche=${encodeURIComponent(niche || 'content creation')}`)
}

function getToken() {
  return localStorage.getItem('token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token')
      window.location.reload()
    }
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || res.statusText)
  }
  return res.json()
}

export const api = {
  dashboard: () => request('/dashboard'),
  trend: () => request('/dashboard/trend'),
  insights: () => request('/insights'),

  sponsorships: {
    list: () => request('/sponsorships'),
    pipeline: () => request('/sponsorships/pipeline'),
    create: (data) => request('/sponsorships', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/sponsorships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/sponsorships/${id}`, { method: 'DELETE' }),
  },

  affiliates: {
    list: () => request('/affiliates'),
    create: (data) => request('/affiliates', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/affiliates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/affiliates/${id}`, { method: 'DELETE' }),
  },

  leads: {
    list: (q) => request(`/leads${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    stats: () => request('/leads/stats'),
    create: (data) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
  },

  pricing: {
    history: () => request('/pricing/history'),
    calculate: (data) => request('/pricing/calculate', { method: 'POST', body: JSON.stringify(data) }),
  },

  products: {
    list: () => request('/products'),
    create: (data) => request('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  auth: {
    updateProfile: (data) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    completeOnboarding: () => request('/auth/onboarding-complete', { method: 'POST' }),
    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyResetToken: (token) => request(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`),
    resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  },

  exportCSV(type) {
    const token = getToken()
    return fetch(`${BASE}/export/${type}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
  },

  trackPageview(path, referrer) {
    const token = getToken()
    fetch(`${BASE}/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ path, referrer: referrer || document.referrer }),
    }).catch(() => {})
  },

  trackConversion(type, metadata) {
    const token = getToken()
    if (!token) return
    fetch(`${BASE}/analytics/conversion`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type, metadata }),
    }).catch(() => {})
  },

  brand: {
    get: () => request('/brand'),
    update: (data) => request('/brand', { method: 'PUT', body: JSON.stringify(data) }),
    ideas: () => request('/brand/ideas'),
    addIdea: (data) => request('/brand/ideas', { method: 'POST', body: JSON.stringify(data) }),
    removeIdea: (id) => request(`/brand/ideas/${id}`, { method: 'DELETE' }),
  },

  ai: {
    pricingSuggestion: (data) => request('/ai/pricing-suggestion', { method: 'POST', body: JSON.stringify(data) }),
    brandMatch: (data) => request('/ai/brand-match', { method: 'POST', body: JSON.stringify(data) }),
    smartFollowup: (data) => request('/ai/smart-followup', { method: 'POST', body: JSON.stringify(data) }),
    contentIdeas: (data) => request('/ai/content-ideas', { method: 'POST', body: JSON.stringify(data) }),
    brandDiscovery: (data) => request('/ai/brand-discovery', { method: 'POST', body: JSON.stringify(data) }),
  },
}
