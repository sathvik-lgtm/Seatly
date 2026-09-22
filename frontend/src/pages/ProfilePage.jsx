import { useState } from 'react'
import { useBookings } from '../hooks/useBookings'
import PageHeader from '../components/layout/PageHeader'
import BookingList from '../components/profile/BookingList'
import CancelBookingModal from '../components/profile/CancelBookingModal'

const SECTIONS = [
  { type: 'movies', icon: '🎬', title: 'MOVIE BOOKINGS', glow: 'movies-card-glow', header: 'movies-header' },
  { type: 'trains', icon: '🚂', title: 'TRAIN BOOKINGS', glow: 'trains-card-glow', header: 'trains-header' },
  { type: 'flights', icon: '✈️', title: 'FLIGHT BOOKINGS', glow: 'flights-card-glow', header: 'flights-header' },
]

export default function ProfilePage() {
  const { bookings, cancelBooking } = useBookings()
  const [cancelTarget, setCancelTarget] = useState(null)
  const [feeChecked, setFeeChecked] = useState(false)

  function handleCancelRequest(booking, type) {
    setCancelTarget({ booking, type })
    setFeeChecked(false)
  }

  function handleCancelClose() {
    setCancelTarget(null)
    setFeeChecked(false)
  }

  async function handleCancelConfirm() {
    if (!cancelTarget) return
    try {
      await cancelBooking(cancelTarget.type, cancelTarget.booking.booking_id)
      handleCancelClose()
      alert('Booking cancelled successfully!')
    } catch (error) {
      alert(`Error: ${error.message}`)
    }
  }

  return (
    <>
      <PageHeader
        themeClass="profile-header"
        glowClass="profile-glow"
        accentClass="profile-accent"
        titleMain="👤 MY BOOKINGS"
        titleSub="YOUR TRAVEL & ENTERTAINMENT"
      />

      <section className="bookings-container futuristic-bookings">
        {SECTIONS.map((section) => (
          <div className={`bookings-section ${section.type}-bookings futuristic-glass-card`} key={section.type}>
            <div className={`card-glow ${section.glow}`}></div>
            <div className={`bookings-header ${section.header} futuristic-booking-header`}>
              <h2 className="futuristic-section-title">
                {section.icon} {section.title}
              </h2>
              <span className="booking-count futuristic-count">{bookings[section.type].length}</span>
            </div>
            <div className="bookings-list">
              <BookingList type={section.type} bookings={bookings[section.type]} onCancel={handleCancelRequest} />
            </div>
          </div>
        ))}
      </section>

      <CancelBookingModal
        open={Boolean(cancelTarget)}
        booking={cancelTarget?.booking}
        checked={feeChecked}
        onCheckedChange={setFeeChecked}
        onConfirm={handleCancelConfirm}
        onCancel={handleCancelClose}
      />
    </>
  )
}
