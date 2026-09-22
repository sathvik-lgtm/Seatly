import { useMemo, useState } from 'react'
import { createRandom, hashString } from '../../utils/mockResults'

const ROWS = 30
const LEFT_COLS = ['A', 'B', 'C']
const RIGHT_COLS = ['D', 'E', 'F']
const PREMIUM_ROWS = new Set([1, 12, 13])
const OCCUPANCY_RATE = 0.13

function buildOccupiedSeats(seedKey) {
  const random = createRandom(hashString(seedKey))
  const occupied = new Set()
  for (let row = 1; row <= ROWS; row++) {
    for (const col of [...LEFT_COLS, ...RIGHT_COLS]) {
      if (random() < OCCUPANCY_RATE) occupied.add(`${row}${col}`)
    }
  }
  return occupied
}

// Controlled component: `assignedSeats` is an array the same length as
// `passengers`, holding a seat code or null per passenger. Render this with
// `key={leg}` from the parent when switching between outbound/return legs so
// the "active passenger" selection resets cleanly for the new leg.
export default function SeatMap({ flightId, passengers, assignedSeats, onChange }) {
  const occupied = useMemo(() => buildOccupiedSeats(flightId), [flightId])
  const [activeIndex, setActiveIndex] = useState(() => {
    const firstOpen = assignedSeats.findIndex((seat) => !seat)
    return firstOpen === -1 ? 0 : firstOpen
  })

  const assignedCount = assignedSeats.filter(Boolean).length

  function handleSeatClick(code) {
    if (occupied.has(code)) return

    const ownerIndex = assignedSeats.findIndex((seat) => seat === code)
    if (ownerIndex !== -1) {
      if (ownerIndex === activeIndex) {
        const next = [...assignedSeats]
        next[ownerIndex] = null
        onChange(next)
      }
      // Seat already belongs to another passenger in this booking — ignore.
      return
    }

    const next = [...assignedSeats]
    next[activeIndex] = code
    onChange(next)

    const nextOpen = next.findIndex((seat) => !seat)
    if (nextOpen !== -1) setActiveIndex(nextOpen)
  }

  function renderSeat(row, col) {
    const code = `${row}${col}`
    const isOccupied = occupied.has(code)
    const isPremium = PREMIUM_ROWS.has(row)
    const ownerIndex = assignedSeats.findIndex((seat) => seat === code)
    const isMine = ownerIndex !== -1 && ownerIndex === activeIndex
    const isOthers = ownerIndex !== -1 && !isMine

    const classNames = ['seat']
    if (isOccupied) classNames.push('occupied')
    else if (isMine) classNames.push('selected')
    else if (isOthers) classNames.push('taken')
    else classNames.push('available')
    if (isPremium) classNames.push('premium')

    return (
      <button
        type="button"
        key={code}
        className={classNames.join(' ')}
        disabled={isOccupied || isOthers}
        onClick={() => handleSeatClick(code)}
        title={isPremium ? `${code} · XL legroom` : code}
      >
        {col}
      </button>
    )
  }

  return (
    <div className="seat-map">
      <div className="seat-map-passengers">
        {passengers.map((passenger, index) => (
          <button
            type="button"
            key={index}
            className={`passenger-chip${index === activeIndex ? ' active' : ''}${assignedSeats[index] ? ' seated' : ''}`}
            onClick={() => setActiveIndex(index)}
          >
            <span className="passenger-chip-name">{passenger.name?.trim() || `Passenger ${index + 1}`}</span>
            <span className="passenger-chip-seat">{assignedSeats[index] || 'No seat'}</span>
          </button>
        ))}
      </div>

      <div className="seat-map-summary">
        {assignedCount} of {passengers.length} seats selected
      </div>

      <div className="seat-map-legend">
        <span className="legend-item">
          <span className="seat-swatch available"></span> Available
        </span>
        <span className="legend-item">
          <span className="seat-swatch selected"></span> Your seat
        </span>
        <span className="legend-item">
          <span className="seat-swatch taken"></span> Taken (this booking)
        </span>
        <span className="legend-item">
          <span className="seat-swatch occupied"></span> Occupied
        </span>
        <span className="legend-item">
          <span className="seat-swatch premium"></span> XL Legroom
        </span>
      </div>

      <div className="seat-map-cabin">
        {Array.from({ length: ROWS }).map((_, i) => {
          const row = i + 1
          return (
            <div className="seat-row" key={row}>
              <span className="seat-row-label">{row}</span>
              <div className="seat-row-side">{LEFT_COLS.map((col) => renderSeat(row, col))}</div>
              <div className="seat-row-aisle"></div>
              <div className="seat-row-side">{RIGHT_COLS.map((col) => renderSeat(row, col))}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
