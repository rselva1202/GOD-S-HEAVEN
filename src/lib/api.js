/**
 * Centralized API Client for God's Own Country Kitchen
 * Uses VITE_API_URL or defaults to http://localhost:5000/api
 */

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const config = {
    ...options,
    credentials: 'include', // Needed for HTTP-only session cookies
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  }

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }

  let res
  try {
    res = await fetch(url, config)
  } catch (err) {
    throw new Error(`Unable to connect to server at ${API_BASE}. Please ensure the backend is running.`)
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`
    const error = new Error(errorMsg)
    error.status = res.status
    error.data = data
    throw error
  }

  return data
}

// -------------------------------------------------------------
// Public Endpoints
// -------------------------------------------------------------

export async function getTables(date, slot) {
  const params = new URLSearchParams()
  if (date) params.append('date', date)
  if (slot) params.append('slot', slot)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/tables${qs}`)
}

export async function getReservationSlots(date) {
  const qs = date ? `?date=${encodeURIComponent(date)}` : ''
  return request(`/reservations/slots${qs}`)
}

export async function createReservation(reservationData) {
  return request('/reservations', {
    method: 'POST',
    body: reservationData,
  })
}

export async function trackReservation(bookingId, phone = '', date = '') {
  const params = new URLSearchParams()
  if (phone) params.append('phone', phone)
  if (date) params.append('date', date)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/reservations/track/${encodeURIComponent(bookingId)}${qs}`)
}

export async function getLiveMusicLineup() {
  return request('/live-music')
}

export async function getTonightLiveMusic() {
  return request('/live-music/today')
}

export async function getReviews() {
  return request('/reviews')
}

export async function submitReview(reviewData) {
  return request('/reviews', {
    method: 'POST',
    body: reviewData,
  })
}

export async function getCatchOfTheDay() {
  return request('/admin/catch-of-day')
}

// -------------------------------------------------------------
// Admin / Staff Endpoints (Session Cookie Protected)
// -------------------------------------------------------------

export async function adminLogin(email, password) {
  return request('/admin/login', {
    method: 'POST',
    body: { email, password },
  })
}

export async function adminLogout() {
  return request('/admin/logout', {
    method: 'POST',
  })
}

export async function adminGetMe() {
  return request('/admin/me')
}

export async function getAdminStats(date = '') {
  const qs = date ? `?date=${encodeURIComponent(date)}` : ''
  return request(`/admin/stats${qs}`)
}

export async function getAllReservations(filters = {}) {
  const params = new URLSearchParams()
  if (filters.date) params.append('date', filters.date)
  if (filters.status) params.append('status', filters.status)
  if (filters.search) params.append('search', filters.search)
  const qs = params.toString() ? `?${params.toString()}` : ''
  return request(`/reservations${qs}`)
}

export async function updateReservationStatus(id, status) {
  return request(`/reservations/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export async function updateLiveMusicDay(dayIndex, data) {
  return request(`/live-music/${dayIndex}`, {
    method: 'PUT',
    body: data,
  })
}

export async function getAllReviews(status = '') {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  return request(`/reviews/all${qs}`)
}

export async function updateReviewStatus(id, status) {
  return request(`/reviews/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export async function setCatchOfTheDay(data) {
  return request('/admin/catch-of-day', {
    method: 'PUT',
    body: data,
  })
}
