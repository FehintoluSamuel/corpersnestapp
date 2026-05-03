/**
 * lib/api.js
 *
 * All API calls live here. Never call fetch() directly in a component.
 */

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
    localStorage.removeItem('corpernest_token')
    window.dispatchEvent(new Event('auth:expired'))
  }

  if (res.status === 204) return null

  const data = await res.json()

  if (!res.ok) {
    const message = data?.detail || 'Something went wrong'
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }

  return data
}


// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  register:      (body)     => request('/auth/registration', { method: 'POST', body: JSON.stringify(body) }),
  login:         (body)     => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me:            ()         => request('/auth/me'),
  updateProfile: (body)     => request('/auth/me/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  updateAvatar:  (url)      => request('/auth/me/avatar', { method: 'PATCH', body: JSON.stringify({ profile_picture_url: url }) }),
  updateLandlordProfile: (body) => request('/auth/me/landlord-profile', { method: 'PATCH', body: JSON.stringify(body) }),
  getPublicUser: (userId)   => request(`/auth/users/${userId}`),
  
}


// ─── Listings ─────────────────────────────────────────────────────────────────

export const listingsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.lga)       params.set('lga', filters.lga)
    if (filters.price_max) params.set('price_max', filters.price_max)
    if (filters.bedrooms)  params.set('bedrooms', filters.bedrooms)
    const query = params.toString()
    return request(`/listings${query ? '?' + query : ''}`)
  },
  getOne:  (id)       => request(`/listings/${id}`),
  create:  (body)     => request('/listings', { method: 'POST', body: JSON.stringify(body) }),
  update:  (id, body) => request(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete:  (id)       => request(`/listings/${id}`, { method: 'DELETE' }),
}


// ─── Feed ─────────────────────────────────────────────────────────────────────

export const feedApi = {
  getAll:      ()                        => request('/feed'),
  getOne:      (postId)                  => request(`/feed/${postId}`),
  create:      (body)                    => request('/feed', { method: 'POST', body: JSON.stringify(body) }),
  delete:      (postId)                  => request(`/feed/${postId}`, { method: 'DELETE' }),
  addComment:  (postId, body)            => request(`/feed/${postId}/comments`, { method: 'POST', body: JSON.stringify(body) }),
  addReply:    (postId, commentId, body) => request(`/feed/${postId}/comments/${commentId}/replies`, { method: 'POST', body: JSON.stringify(body) }),
  toggleLike:  (postId)                  => request(`/feed/${postId}/like`, { method: 'POST' }),
}


// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsApi = {
  submit:  (body) => request('/reports', { method: 'POST', body: JSON.stringify(body) }),
  getMine: ()     => request('/reports/mine'),
}


// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard:       ()              => request('/admin/dashboard'),
  getPendingLandlords:()              => request('/admin/landlords/pending'),
  verifyLandlord:     (userId, body)  => request(`/admin/landlords/${userId}/verify`, { method: 'POST', body: JSON.stringify(body) }),
  getUsers:           (filters = {}) => {
    const params = new URLSearchParams()
    if (filters.role)   params.set('role', filters.role)
    if (filters.status) params.set('status', filters.status)
    const query = params.toString()
    return request(`/admin/users${query ? '?' + query : ''}`)
  },
  suspendUser:   (userId)        => request(`/admin/users/${userId}/suspend`, { method: 'POST' }),
  reinstateUser: (userId)        => request(`/admin/users/${userId}/reinstate`, { method: 'POST' }),
  makeAdmin:     (userId)        => request(`/admin/users/${userId}/make-admin`, { method: 'POST' }),
  getReports:    (status = '')   => request(`/admin/reports${status ? '?status=' + status : ''}`),
  resolveReport: (reportId, body) => request(`/admin/reports/${reportId}/resolve`, { method: 'POST', body: JSON.stringify(body) }),
}



// ─── Connections and Messages ────────────────────────────────────────────────────────────────────



export const connectionsApi = {
  sendRequest:   (userId)       => request(`/connections/request/${userId}`, { method: 'POST' }),
  accept:        (connId)       => request(`/connections/${connId}/accept`,  { method: 'POST' }),
  reject:        (connId)       => request(`/connections/${connId}/reject`,  { method: 'POST' }),
  remove:        (connId)       => request(`/connections/${connId}`,         { method: 'DELETE' }),
  getPending:    ()             => request('/connections/pending'),
  getAll:        ()             => request('/connections'),
  getStatus:     (userId)       => request(`/connections/status/${userId}`),
  getCount:      (userId)      => request(`/connections/count/${userId}`),
  getSent:       ()             => request('/connections/sent'),
}

export const messagesApi = {
  getInbox:      ()             => request('/messages'),
  getMessages:   (userId)       => request(`/messages/${userId}`),
  send:          (userId, body) => request(`/messages/${userId}`, { method: 'POST', body: JSON.stringify(body) }),
  getUnreadCount: ()            => request('/messages/unread-count'),
}


// ─── Notifications and Bookmarks ────────────────────────────────────────────────────────────────────


export const notificationsApi = {
  getAll:        ()               => request('/notifications'),
  getUnreadCount:()               => request('/notifications/unread-count'),
  markAllRead:   ()               => request('/notifications/read-all', { method: 'POST' }),
  markRead:      (id)             => request(`/notifications/${id}/read`, { method: 'POST' }),
}

export const bookmarksApi = {
  getAll:   ()                          => request('/bookmarks'),
  toggle:   (body)                      => request('/bookmarks/toggle', { method: 'POST', body: JSON.stringify(body) }),
  getStatus:(postId, listingId) => {
    const p = new URLSearchParams()
    if (postId)    p.set('post_id',    postId)
    if (listingId) p.set('listing_id', listingId)
    return request(`/bookmarks/status?${p}`)
  },
}