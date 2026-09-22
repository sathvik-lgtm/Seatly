import { formatTime } from '../../utils/format'

export default function FlightResultCard({ flight, onSelect }) {
  return (
    <div className="result-card">
      <div className="result-card-main">
        <div className="result-card-operator">
          <span className="result-card-operator-name">{flight.airline}</span>
          <span className="result-card-number">{flight.flightNumber}</span>
        </div>
        <div className="result-card-route">
          <span>{flight.from}</span>
          <span className="result-card-route-arrow">→</span>
          <span>{flight.to}</span>
        </div>
      </div>
      <div className="result-card-times">
        <div className="result-card-time-pair">
          <span>{formatTime(flight.departureTime)}</span>
          <span className="result-card-time-arrow">→</span>
          <span>
            {formatTime(flight.arrivalTime)}
            {flight.nextDay && <span className="result-card-nextday">+1</span>}
          </span>
        </div>
        <div className="result-card-duration">{flight.duration} · Non stop</div>
      </div>
      <div className="result-card-action">
        <div className="result-card-price">{flight.priceLabel}</div>
        <button type="button" className="result-select-btn" onClick={() => onSelect(flight)}>
          Select Flight
        </button>
      </div>
    </div>
  )
}
