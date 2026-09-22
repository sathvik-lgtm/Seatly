export function isWithinThreeDays(bookingDate) {
  if (!bookingDate) return false
  const booking = new Date(bookingDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  booking.setHours(0, 0, 0, 0)
  const diffTime = booking - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 3
}

// Substring match in either direction, mirroring the old fuzzy country comparison.
export function countriesMatch(a, b) {
  if (!a || !b) return false
  const left = a.toLowerCase()
  const right = b.toLowerCase()
  return left.includes(right) || right.includes(left)
}

export function collectPassengerDetails(passengers) {
  return passengers.filter((p) => p.name && p.age && p.gender).map((p) => ({
    name: p.name,
    age: parseInt(p.age, 10),
    gender: p.gender,
  }))
}
