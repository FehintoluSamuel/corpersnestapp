// All API calls live here. Never call fetch() directly in a component.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1'

function getToken() {
  return localStorage.getItem('corpernest_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    // Token expired or invalid — clear and let the app handle redirect
    localStorage.removeItem('corpernest_token')
    window.dispatchEvent(new Event('auth:expired'))
  }

  if (res.status === 204) return null   // No Content (DELETE success)

  const data = await res.json()

  if (!res.ok) {
    // FastAPI returns { detail: "..." } for errors
    const message = data?.detail || 'Something went wrong'
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return data
}

// ─── Auth ────────────────────────────────────────────────
export const authApi = {
  register: (body) => request('/auth/registration', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
}

// ─── Listings ────────────────────────────────────────────
export const listingsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.lga) params.set('lga', filters.lga)
    if (filters.price_max) params.set('price_max', filters.price_max)
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms)
    const query = params.toString()
    return request(`/listings${query ? '?' + query : ''}`)
  },
  getOne: (id) => request(`/listings/${id}`),
  create: (body) => request('/listings', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
}

// ─── Feed ─────────────────────────────────────────────────
export const feedApi = {
  getAll: () => request('/feed'),
  getOne: (postId) => request(`/feed/${postId}`),
  create: (body) => request('/feed', { method: 'POST', body: JSON.stringify(body) }),
  delete: (postId) => request(`/feed/${postId}`, { method: 'DELETE' }),
  addComment: (postId, body) => request(`/feed/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  toggleLike: (postId) => request(`/feed/${postId}/like`, { method: 'POST' }),
}