import BookingCard from './BookingCard'

export default function BookingList({ type, bookings, onCancel }) {
  if (bookings.length === 0) {
    return <div className="empty-state futuristic-empty">No {type} bookings yet</div>
  }

  return (
    <>
      {bookings.map((booking) => (
        <BookingCard key={booking.booking_id} type={type} booking={booking} onCancel={onCancel} />
      ))}
    </>
  )
}
