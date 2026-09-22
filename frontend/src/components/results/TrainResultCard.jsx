import { formatTime } from '../../utils/format'

export default function TrainResultCard({ train, onSelect }) {
  return (
    <div className="result-card">
      <div className="result-card-main">
        <div className="result-card-operator">
          <span className="result-card-operator-name">{train.operator}</span>
          <span className="result-card-number">#{train.trainNumber}</span>
        </div>
        <div className="result-card-route">
          <span>{train.from}</span>
          <span className="result-card-route-arrow">→</span>
          <span>{train.to}</span>
        </div>
      </div>
      <div className="result-card-times">
        <div className="result-card-time-pair">
          <span>{formatTime(train.departureTime)}</span>
          <span className="result-card-time-arrow">→</span>
          <span>
            {formatTime(train.arrivalTime)}
            {train.nextDay && <span className="result-card-nextday">+1</span>}
          </span>
        </div>
        <div className="result-card-duration">{train.duration}</div>
      </div>
      <div className="result-card-action">
        <div className="result-card-price">{train.priceLabel}</div>
        <button type="button" className="result-select-btn" onClick={() => onSelect(train)}>
          Select Train
        </button>
      </div>
    </div>
  )
}
