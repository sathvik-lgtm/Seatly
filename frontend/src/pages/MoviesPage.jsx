import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MOVIES } from '../data/movies'
import { bookMovie } from '../api/client'
import { formatDate, formatTime } from '../utils/format'
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout'
import PageHeader from '../components/layout/PageHeader'
import MovieGrid from '../components/movies/MovieGrid'
import QuantitySelector from '../components/booking/QuantitySelector'
import BookingConfirmModal from '../components/booking/BookingConfirmModal'

const TIME_SLOTS = [
  { value: '10:00', label: '10:00 AM' },
  { value: '13:30', label: '1:30 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '21:30', label: '9:30 PM' },
]

const MOVIE_TICKET_PRICE = 250

export default function MoviesPage() {
  const navigate = useNavigate()
  const { payWithRazorpay } = useRazorpayCheckout()
  const [selectedSlug, setSelectedSlug] = useState(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [policyChecked, setPolicyChecked] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [modalSummary, setModalSummary] = useState(null)
  const [paying, setPaying] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const amount = MOVIE_TICKET_PRICE * quantity

  function resetForm() {
    setSelectedSlug(null)
    setDate('')
    setTime('')
    setQuantity(1)
    setName('')
    setEmail('')
    setPendingPayload(null)
    setModalSummary(null)
    setPaymentError(null)
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!selectedSlug) {
      alert('Please select a movie first!')
      return
    }
    const movie = MOVIES.find((m) => m.slug === selectedSlug)
    const movieName = movie ? movie.title : selectedSlug

    setPendingPayload({
      name,
      email,
      date,
      time,
      quantity,
      additional_info: {
        movie: selectedSlug,
        movie_name: movieName,
      },
    })

    setModalSummary(
      <div className="booking-summary">
        <h4>🎬 {movieName}</h4>
        <div className="booking-summary-item">
          <strong>Date:</strong> {formatDate(date)}
        </div>
        <div className="booking-summary-item">
          <strong>Show Time:</strong> {formatTime(time)}
        </div>
        <div className="booking-summary-item">
          <strong>Tickets:</strong> {quantity}
        </div>
        <div className="booking-summary-item">
          <strong>Total:</strong> ₹{amount.toLocaleString('en-IN')}
        </div>
      </div>,
    )
    setPaymentError(null)
    setPolicyChecked(false)
    setModalOpen(true)
  }

  async function handleConfirm() {
    if (!policyChecked || !pendingPayload) return
    setPaymentError(null)
    setPaying(true)

    let payment
    try {
      payment = await payWithRazorpay({
        amount,
        name,
        email,
        description: `Movie tickets x${quantity}`,
      })
    } catch (error) {
      setPaymentError(error.message)
      setPaying(false)
      return
    }

    try {
      const payload = {
        ...pendingPayload,
        additional_info: {
          ...pendingPayload.additional_info,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_order_id: payment.razorpay_order_id,
        },
      }
      const res = await bookMovie(payload)
      setModalOpen(false)
      resetForm()
      setResult({ type: 'success', message: res.message })
    } catch (error) {
      // Payment already succeeded here — don't let the user think they need
      // to pay again; surface the payment id so they can reconcile manually.
      setPaymentError(
        `Payment succeeded (ID: ${payment.razorpay_payment_id}) but booking failed: ${error.message}. Please note this payment ID.`,
      )
    } finally {
      setPaying(false)
    }
  }

  function handleModalCancel() {
    if (paying) return
    setModalOpen(false)
    navigate('/')
  }

  const selectedMovie = MOVIES.find((m) => m.slug === selectedSlug)

  return (
    <>
      <PageHeader
        themeClass="movies-header"
        glowClass="movies-glow"
        accentClass="movies-accent"
        titleMain="🎬 MOVIE BOOKING"
        titleSub="PREMIUM CINEMA EXPERIENCE"
      />

      <section className="booking-section futuristic-booking">
        <div className="modern-booking-wrapper">
          <div className="movie-selection-section futuristic-glass-card">
            <div className="card-glow movies-card-glow"></div>
            <h3 className="section-title">🎬 Select Movie</h3>
            <MovieGrid movies={MOVIES} selectedSlug={selectedSlug} onSelect={(movie) => setSelectedSlug(movie.slug)} />
          </div>

          <div className="modern-booking-card movies-theme futuristic-glass-card">
            <div className="card-glow movies-card-glow"></div>
            <div className="booking-header-modern futuristic-form-header">
              <h2 className="futuristic-form-title">🎬 BOOK MOVIE TICKETS</h2>
              <div className="welcome-accent movies-accent"></div>
              <p className="subtitle-modern futuristic-form-subtitle">Experience the magic of cinema</p>
            </div>

            <form className="modern-booking-form" onSubmit={handleSubmit}>
              {selectedMovie && (
                <div className="selected-movie-display" style={{ display: 'flex' }}>
                  <span className="selected-label">Selected:</span>
                  <span>{selectedMovie.title}</span>
                </div>
              )}

              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label htmlFor="date">📅 Show Date</label>
                  <input
                    type="date"
                    id="date"
                    className="modern-input"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                  />
                </div>
                <div className="form-group-modern">
                  <label>🕐 Show Time</label>
                  <div className="time-slots">
                    {TIME_SLOTS.map((slot) => (
                      <label className="time-slot" key={slot.value}>
                        <input
                          type="radio"
                          name="time"
                          value={slot.value}
                          checked={time === slot.value}
                          onChange={(event) => setTime(event.target.value)}
                          required
                        />
                        <span>{slot.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label htmlFor="quantity">🎫 Number of Tickets</label>
                  <QuantitySelector value={quantity} onChange={setQuantity} />
                </div>
              </div>

              <div className="section-divider">
                <span>Contact Details</span>
              </div>

              <div className="form-row-modern">
                <div className="form-group-modern">
                  <label htmlFor="name">👤 Full Name</label>
                  <input
                    type="text"
                    id="name"
                    className="modern-input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="email">📧 Email</label>
                  <input
                    type="email"
                    id="email"
                    className="modern-input"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="modern-submit-btn movies-submit">
                <span>Book Tickets</span>
                <span className="btn-arrow">→</span>
              </button>
            </form>
            <div className={`booking-result${result ? ` ${result.type}` : ''}`}>{result?.message}</div>
          </div>
        </div>
      </section>

      <BookingConfirmModal
        open={modalOpen}
        checked={policyChecked}
        onCheckedChange={setPolicyChecked}
        onConfirm={handleConfirm}
        onCancel={handleModalCancel}
        summary={modalSummary}
        amount={amount}
        paying={paying}
        paymentError={paymentError}
      />
    </>
  )
}
