// Generates plausible-looking flight/train availability listings for the demo
// booking flow. There is no real schedule/airline data anywhere in this app,
// so results are synthesized client-side, seeded by the search parameters so
// the same search always yields the same list (this also keeps a flight's
// `id` stable, which the seat map uses to seed its occupied-seat layout).

export function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash >>> 0
}

// mulberry32 seeded PRNG — small, fast, good-enough distribution for mock data.
export function createRandom(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(array, random) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function minutesToTime(totalMinutes) {
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440
  const hours = Math.floor(wrapped / 60)
  const minutes = wrapped % 60
  return `${pad2(hours)}:${pad2(minutes)}`
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function formatDuration(durationMinutes) {
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

function formatPrice(amount) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

const DEPARTURE_POOL = [
  '05:45', '06:15', '07:30', '08:30', '09:40', '11:20',
  '12:50', '14:15', '15:30', '16:20', '17:45', '19:05',
  '20:30', '21:45', '23:10',
]

const AIRLINES = [
  { name: 'IndiGo', code: '6E' },
  { name: 'Air India', code: 'AI' },
  { name: 'Vistara', code: 'UK' },
  { name: 'SpiceJet', code: 'SG' },
  { name: 'Akasa Air', code: 'QP' },
]

const CLASS_MULTIPLIER = { economy: 1, business: 2.4, first: 3.8 }

export function generateFlightResults({ from, to, date, flightClass = 'economy' }) {
  const seed = hashString(`flight|${from}|${to}|${date}`)
  const random = createRandom(seed)

  const count = 4 + Math.floor(random() * 3) // 4-6
  const departures = shuffle(DEPARTURE_POOL, random)
    .slice(0, count)
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b))

  const airlineOrder = shuffle(AIRLINES, random)
  const multiplier = CLASS_MULTIPLIER[flightClass] ?? 1

  return departures.map((departureTime, index) => {
    const airline = airlineOrder[index % airlineOrder.length]
    const durationMinutes = 75 + Math.floor(random() * 150) // 1h15m - 3h45m
    const departMinutes = timeToMinutes(departureTime)
    const arrivalMinutes = departMinutes + durationMinutes
    const arrivalTime = minutesToTime(arrivalMinutes)
    const nextDay = arrivalMinutes >= 1440
    const flightNumber = `${airline.code}-${100 + Math.floor(random() * 899)}`
    const basePrice = 2800 + Math.floor(random() * 6500)

    return {
      id: `${flightNumber}-${date || 'flex'}-${departureTime}`,
      airline: airline.name,
      flightNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      nextDay,
      durationMinutes,
      duration: formatDuration(durationMinutes),
      price: Math.round(basePrice * multiplier),
      priceLabel: formatPrice(basePrice * multiplier),
    }
  })
}

const TRAIN_OPERATORS = [
  { name: 'Rajdhani Express' },
  { name: 'Shatabdi Express' },
  { name: 'Duronto Express' },
  { name: 'Garib Rath Express' },
  { name: 'Jan Shatabdi Express' },
]

export function generateTrainResults({ from, to, date }) {
  const seed = hashString(`train|${from}|${to}|${date}`)
  const random = createRandom(seed)

  const count = 4 + Math.floor(random() * 3) // 4-6
  const departures = shuffle(DEPARTURE_POOL, random)
    .slice(0, count)
    .sort((a, b) => timeToMinutes(a) - timeToMinutes(b))

  const operatorOrder = shuffle(TRAIN_OPERATORS, random)

  return departures.map((departureTime, index) => {
    const operator = operatorOrder[index % operatorOrder.length]
    const durationMinutes = 180 + Math.floor(random() * 600) // 3h - 13h
    const departMinutes = timeToMinutes(departureTime)
    const arrivalMinutes = departMinutes + durationMinutes
    const arrivalTime = minutesToTime(arrivalMinutes)
    const nextDay = arrivalMinutes >= 1440
    const trainNumber = String(12000 + Math.floor(random() * 8000))
    const price = 450 + Math.floor(random() * 2600)

    return {
      id: `${trainNumber}-${date || 'flex'}-${departureTime}`,
      operator: operator.name,
      trainNumber,
      from,
      to,
      departureTime,
      arrivalTime,
      nextDay,
      durationMinutes,
      duration: formatDuration(durationMinutes),
      price,
      priceLabel: formatPrice(price),
    }
  })
}
