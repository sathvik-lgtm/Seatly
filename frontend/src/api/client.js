const BASE = '/api'

async function request(path, options) {
  const response = await fetch(`${BASE}${path}`, options)
  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }
  if (!response.ok) {
    const message = (data && data.detail) || 'Request failed'
    throw new Error(message)
  }
  return data
}

function postJson(path, payload) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function bookMovie(payload) {
  return postJson('/book/movie', payload)
}

export function bookTrain(payload) {
  return postJson('/book/train', payload)
}

export function bookFlight(payload) {
  return postJson('/book/flight', payload)
}

export function getAllBookings() {
  return request('/bookings')
}

export function getBookingsByType(type) {
  return request(`/bookings/${type}`)
}

export function cancelBooking(type, bookingId) {
  return request(`/cancel/${type}/${bookingId}`, { method: 'DELETE' })
}

export function autocompleteAirports(query, country) {
  const params = new URLSearchParams({ query })
  if (country) params.set('country', country)
  return request(`/autocomplete/airports?${params.toString()}`)
}

export function autocompleteTrainStations(query, country) {
  const params = new URLSearchParams({ query })
  if (country) params.set('country', country)
  return request(`/autocomplete/train-stations?${params.toString()}`)
}

export function getCountries() {
  return request('/countries')
}

export function createPaymentOrder(amount, receipt) {
  return postJson('/payment/create-order', { amount, receipt })
}

export function verifyPayment(payload) {
  return postJson('/payment/verify', payload)
}
