import { formatClass, formatDate, formatGender, formatSlugAsTitle, formatTime } from '../../utils/format'

function PaymentDetail({ additionalInfo }) {
  const paymentId = additionalInfo?.razorpay_payment_id
  if (!paymentId) return null
  return (
    <div className="booking-detail">
      <span className="booking-detail-label">Payment ID:</span>
      <span className="booking-detail-value">{paymentId}</span>
    </div>
  )
}

function PassengerDetails({ passengers }) {
  if (!passengers || passengers.length === 0) return null
  return (
    <div className="passenger-details-section">
      <div className="booking-detail">
        <span className="booking-detail-label" style={{ fontWeight: 'bold', marginTop: '10px' }}>
          Passengers:
        </span>
      </div>
      {passengers.map((passenger, index) => (
        <div className="passenger-info" key={index}>
          <span className="passenger-label">
            {index + 1}. {passenger.name || 'N/A'}
          </span>
          <span className="passenger-meta">
            Age: {passenger.age || 'N/A'}, {formatGender(passenger.gender || 'N/A')}
          </span>
        </div>
      ))}
    </div>
  )
}

function MovieBookingDetails({ booking }) {
  return (
    <>
      <div className="booking-detail">
        <span className="booking-detail-label">Seats:</span>
        <span className="booking-detail-value">{booking.quantity}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Date:</span>
        <span className="booking-detail-value">{formatDate(booking.date)}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Show Time:</span>
        <span className="booking-detail-value">{formatTime(booking.time)}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Name:</span>
        <span className="booking-detail-value">{booking.name}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Email:</span>
        <span className="booking-detail-value">{booking.email}</span>
      </div>
      <PaymentDetail additionalInfo={booking.additional_info} />
      <PassengerDetails passengers={booking.additional_info?.passengers} />
    </>
  )
}

function TrainBookingDetails({ booking }) {
  const from = booking.additional_info?.from || 'N/A'
  const to = booking.additional_info?.to || 'N/A'
  const operator = booking.additional_info?.operator
  const trainNumber = booking.additional_info?.train_number
  const departureActual = booking.additional_info?.departure_time_actual
  const arrivalActual = booking.additional_info?.arrival_time_actual
  const duration = booking.additional_info?.duration

  return (
    <>
      {operator && (
        <div className="booking-detail">
          <span className="booking-detail-label">Train:</span>
          <span className="booking-detail-value">
            {operator}
            {trainNumber ? ` #${trainNumber}` : ''}
          </span>
        </div>
      )}
      <div className="booking-detail">
        <span className="booking-detail-label">From:</span>
        <span className="booking-detail-value">{from}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">To:</span>
        <span className="booking-detail-value">{to}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Travel Date:</span>
        <span className="booking-detail-value">{formatDate(booking.date)}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Departure Time:</span>
        <span className="booking-detail-value">{formatTime(departureActual || booking.time)}</span>
      </div>
      {arrivalActual && (
        <div className="booking-detail">
          <span className="booking-detail-label">Arrival Time:</span>
          <span className="booking-detail-value">{formatTime(arrivalActual)}</span>
        </div>
      )}
      {duration && (
        <div className="booking-detail">
          <span className="booking-detail-label">Duration:</span>
          <span className="booking-detail-value">{duration}</span>
        </div>
      )}
      <div className="booking-detail">
        <span className="booking-detail-label">Tickets:</span>
        <span className="booking-detail-value">{booking.quantity}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Booked By:</span>
        <span className="booking-detail-value">{booking.name}</span>
      </div>
      <PaymentDetail additionalInfo={booking.additional_info} />
      <PassengerDetails passengers={booking.additional_info?.passengers} />
    </>
  )
}

function FlightBookingDetails({ booking }) {
  const from = booking.additional_info?.from || 'N/A'
  const to = booking.additional_info?.to || 'N/A'
  const flightClass = booking.additional_info?.class || 'N/A'
  const isRoundTrip = booking.additional_info?.trip_type === 'round-trip'
  const returnDate = booking.additional_info?.return_date
  const returnTime = booking.additional_info?.return_time
  const airline = booking.additional_info?.airline
  const flightNumber = booking.additional_info?.flight_number
  const seats = booking.additional_info?.seats
  const returnAirline = booking.additional_info?.return_airline
  const returnFlightNumber = booking.additional_info?.return_flight_number
  const returnSeats = booking.additional_info?.return_seats

  return (
    <>
      <div className="booking-detail">
        <span className="booking-detail-label">Trip Type:</span>
        <span className="booking-detail-value">{isRoundTrip ? '🔄 Round Trip' : '➡️ One Way'}</span>
      </div>
      {airline && (
        <div className="booking-detail">
          <span className="booking-detail-label">Flight:</span>
          <span className="booking-detail-value">
            {airline}
            {flightNumber ? ` ${flightNumber}` : ''}
          </span>
        </div>
      )}
      <div className="booking-detail">
        <span className="booking-detail-label">From Airport:</span>
        <span className="booking-detail-value">{from}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">To Airport:</span>
        <span className="booking-detail-value">{to}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Departure Date:</span>
        <span className="booking-detail-value">{formatDate(booking.date)}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Departure Time:</span>
        <span className="booking-detail-value">{formatTime(booking.time)}</span>
      </div>
      {seats && seats.length > 0 && (
        <div className="booking-detail">
          <span className="booking-detail-label">Seats:</span>
          <span className="booking-detail-value">{seats.join(', ')}</span>
        </div>
      )}
      {isRoundTrip && returnDate && (
        <>
          <div className="booking-detail return-flight-detail">
            <span className="booking-detail-label">🔄 Return Date:</span>
            <span className="booking-detail-value">{formatDate(returnDate)}</span>
          </div>
          <div className="booking-detail return-flight-detail">
            <span className="booking-detail-label">🔄 Return Time:</span>
            <span className="booking-detail-value">{formatTime(returnTime)}</span>
          </div>
          {returnAirline && (
            <div className="booking-detail return-flight-detail">
              <span className="booking-detail-label">🔄 Return Flight:</span>
              <span className="booking-detail-value">
                {returnAirline}
                {returnFlightNumber ? ` ${returnFlightNumber}` : ''}
              </span>
            </div>
          )}
          {returnSeats && returnSeats.length > 0 && (
            <div className="booking-detail return-flight-detail">
              <span className="booking-detail-label">🔄 Return Seats:</span>
              <span className="booking-detail-value">{returnSeats.join(', ')}</span>
            </div>
          )}
        </>
      )}
      <div className="booking-detail">
        <span className="booking-detail-label">Class:</span>
        <span className="booking-detail-value">{formatClass(flightClass)}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Passengers:</span>
        <span className="booking-detail-value">{booking.quantity}</span>
      </div>
      <div className="booking-detail">
        <span className="booking-detail-label">Booked By:</span>
        <span className="booking-detail-value">{booking.name}</span>
      </div>
      <PaymentDetail additionalInfo={booking.additional_info} />
      <PassengerDetails passengers={booking.additional_info?.passengers} />
    </>
  )
}

function getMovieTitle(booking) {
  if (booking.additional_info?.movie_name) return booking.additional_info.movie_name
  if (booking.additional_info?.movie) return formatSlugAsTitle(booking.additional_info.movie)
  return 'Unknown Movie'
}

export default function BookingCard({ type, booking, onCancel }) {
  let title
  let details

  if (type === 'movies') {
    title = getMovieTitle(booking)
    details = <MovieBookingDetails booking={booking} />
  } else if (type === 'trains') {
    const from = booking.additional_info?.from || 'N/A'
    const to = booking.additional_info?.to || 'N/A'
    title = `${from} → ${to}`
    details = <TrainBookingDetails booking={booking} />
  } else {
    const from = booking.additional_info?.from || 'N/A'
    const to = booking.additional_info?.to || 'N/A'
    const isRoundTrip = booking.additional_info?.trip_type === 'round-trip'
    title = (
      <>
        <span className={isRoundTrip ? 'round-trip-badge' : 'one-way-badge'}>
          {isRoundTrip ? '🔄 Round Trip' : '➡️ One Way'}
        </span>{' '}
        {from} → {to}
        {isRoundTrip ? ` → ${from}` : ''}
      </>
    )
    details = <FlightBookingDetails booking={booking} />
  }

  return (
    <div className="booking-card-item">
      <h3>{title}</h3>
      {details}
      <div className="booking-id">Booking ID: {booking.booking_id}</div>
      <div className="booking-actions">
        <button className="cancel-btn" onClick={() => onCancel(booking, type)}>
          🗑️ Cancel Ticket
        </button>
      </div>
    </div>
  )
}
