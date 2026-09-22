import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookTrain, autocompleteTrainStations } from '../api/client'
import { collectPassengerDetails } from '../utils/booking'
import { formatDate, formatTime } from '../utils/format'
import { generateTrainResults } from '../utils/mockResults'
import { TRAIN_ROUTES } from '../data/popularRoutes'
import { useCountries } from '../hooks/useCountries'
import { useRazorpayCheckout } from '../hooks/useRazorpayCheckout'
import PageHeader from '../components/layout/PageHeader'
import AutocompleteInput from '../components/booking/AutocompleteInput'
import SwapRouteButton from '../components/booking/SwapRouteButton'
import CountrySelect from '../components/booking/CountrySelect'
import QuantitySelector from '../components/booking/QuantitySelector'
import PassengerFields from '../components/booking/PassengerFields'
import BookingConfirmModal from '../components/booking/BookingConfirmModal'
import PopularRoutes from '../components/routes/PopularRoutes'
import TrainResultCard from '../components/results/TrainResultCard'

const EMPTY_PASSENGER = { name: '', age: '', gender: '' }

export default function TrainsPage() {
  const navigate = useNavigate()
  const countries = useCountries()
  const { payWithRazorpay } = useRazorpayCheckout()

  const [step, setStep] = useState('search') // 'search' | 'results' | 'details'

  const [from, setFrom] = useState('')
  const [fromItem, setFromItem] = useState(null)
  const [to, setTo] = useState('')
  const [toItem, setToItem] = useState(null)
  const [country, setCountry] = useState('')
  const [date, setDate] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [passengers, setPassengers] = useState([{ ...EMPTY_PASSENGER }])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [trainResults, setTrainResults] = useState([])
  const [selectedTrain, setSelectedTrain] = useState(null)

  const [result, setResult] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [policyChecked, setPolicyChecked] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [modalSummary, setModalSummary] = useState(null)
  const [paying, setPaying] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  function handleQuantityChange(next) {
    setQuantity(next)
    setPassengers((prev) => {
      const copy = prev.slice(0, next)
      while (copy.length < next) copy.push({ ...EMPTY_PASSENGER })
      return copy
    })
  }

  function handlePassengerChange(index, field, value) {
    setPassengers((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  function handleSwap() {
    setFrom(to)
    setTo(from)
    setFromItem(toItem)
    setToItem(fromItem)
  }

  async function handleSelectRoute(fromCode, toCode) {
    try {
      const [fromData, toData] = await Promise.all([
        autocompleteTrainStations(fromCode),
        autocompleteTrainStations(toCode),
      ])
      const fromResult = fromData.results?.[0]
      const toResult = toData.results?.[0]
      if (fromResult) {
        setFrom(fromResult.display || fromResult.name)
        setFromItem(fromResult)
      }
      if (toResult) {
        setTo(toResult.display || toResult.name)
        setToItem(toResult)
      }
    } catch (error) {
      console.error('Error resolving popular route:', error)
    }
  }

  function resetForm() {
    setStep('search')
    setFrom('')
    setFromItem(null)
    setTo('')
    setToItem(null)
    setDate('')
    setQuantity(1)
    setPassengers([{ ...EMPTY_PASSENGER }])
    setName('')
    setEmail('')
    setTrainResults([])
    setSelectedTrain(null)
    setPendingPayload(null)
    setModalSummary(null)
    setPaymentError(null)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()
    const results = generateTrainResults({ from, to, date })
    setTrainResults(results)
    setStep('results')
  }

  function handleSelectTrain(train) {
    setSelectedTrain(train)
    setStep('details')
  }

  function handleDetailsSubmit(event) {
    event.preventDefault()
    const validPassengers = collectPassengerDetails(passengers)
    const amount = selectedTrain.price * quantity

    setPendingPayload({
      name,
      email,
      date,
      time: selectedTrain.departureTime,
      quantity,
      additional_info: {
        from,
        to,
        passengers: validPassengers,
        operator: selectedTrain.operator,
        train_number: selectedTrain.trainNumber,
        departure_time_actual: selectedTrain.departureTime,
        arrival_time_actual: selectedTrain.arrivalTime,
        duration: selectedTrain.duration,
      },
    })

    setModalSummary(
      <div className="booking-summary">
        <h4>🚂 Train Details</h4>
        <div className="booking-summary-item">
          <strong>Train:</strong> {selectedTrain.operator} #{selectedTrain.trainNumber}
        </div>
        <div className="booking-summary-item">
          <strong>Route:</strong> {from} → {to}
        </div>
        <div className="booking-summary-item">
          <strong>Date:</strong> {formatDate(date)}
        </div>
        <div className="booking-summary-item">
          <strong>Departure:</strong> {formatTime(selectedTrain.departureTime)}
        </div>
        <div className="booking-summary-item">
          <strong>Arrival:</strong> {formatTime(selectedTrain.arrivalTime)}
          {selectedTrain.nextDay ? ' (+1 day)' : ''}
        </div>
        <div className="booking-summary-item">
          <strong>Duration:</strong> {selectedTrain.duration}
        </div>
        <div className="booking-summary-item">
          <strong>Passengers:</strong> {quantity}
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
        amount: selectedTrain.price * quantity,
        name,
        email,
        description: `${selectedTrain.operator} #${selectedTrain.trainNumber}`,
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
      const res = await bookTrain(payload)
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

  return (
    <>
      <PageHeader
        themeClass="trains-header"
        glowClass="trains-glow"
        accentClass="trains-accent"
        titleMain="🚂 TRAIN BOOKING"
        titleSub="NEXT-GEN RAIL TRAVEL"
      />

      <section className="booking-section futuristic-booking">
        <div className={`modern-booking-wrapper${step === 'search' ? '' : ' single-column'}`}>
          {step === 'search' && (
            <>
              <div className="modern-booking-card trains-theme futuristic-glass-card">
                <div className="card-glow trains-card-glow"></div>
                <div className="booking-header-modern futuristic-form-header">
                  <h2 className="futuristic-form-title">🚂 BOOK TRAIN TICKETS</h2>
                  <div className="welcome-accent trains-accent"></div>
                  <p className="subtitle-modern futuristic-form-subtitle">Fast, convenient, and affordable travel</p>
                </div>

                <form className="modern-booking-form" onSubmit={handleSearchSubmit}>
                  <div className="route-inputs">
                    <div className="route-input-wrapper">
                      <div className="input-icon">🚉</div>
                      <div className="input-content">
                        <label htmlFor="from">From Station</label>
                        <AutocompleteInput
                          id="from"
                          kind="station"
                          placeholder="Enter source station"
                          value={from}
                          onValueChange={setFrom}
                          selectedItem={fromItem}
                          onSelect={setFromItem}
                          country={country}
                          countryName={country}
                          required
                        />
                      </div>
                      <SwapRouteButton onClick={handleSwap} />
                    </div>

                    <div className="route-input-wrapper">
                      <div className="input-icon">🎯</div>
                      <div className="input-content">
                        <label htmlFor="to">To Station</label>
                        <AutocompleteInput
                          id="to"
                          kind="station"
                          placeholder="Enter destination station"
                          value={to}
                          onValueChange={setTo}
                          selectedItem={toItem}
                          onSelect={setToItem}
                          country={country}
                          countryName={country}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label htmlFor="country">Filter by Country</label>
                      <CountrySelect countries={countries} value={country} onChange={setCountry} />
                    </div>
                  </div>

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label htmlFor="date">📅 Travel Date</label>
                      <input
                        type="date"
                        id="date"
                        className="modern-input"
                        value={date}
                        onChange={(event) => setDate(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label htmlFor="quantity">👥 Number of Tickets</label>
                      <QuantitySelector value={quantity} onChange={handleQuantityChange} />
                    </div>
                  </div>

                  <button type="submit" className="modern-submit-btn trains-submit">
                    <span>Search Trains</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </form>
                <div className={`booking-result${result ? ` ${result.type}` : ''}`}>{result?.message}</div>
              </div>

              <PopularRoutes routes={TRAIN_ROUTES} onSelectRoute={handleSelectRoute} variant="trains" />
            </>
          )}

          {step === 'results' && (
            <div className="modern-booking-card trains-theme futuristic-glass-card">
              <div className="card-glow trains-card-glow"></div>
              <div className="wizard-step-label">Step 2 of 3 — Choose a Train</div>
              <div className="results-grid">
                {trainResults.map((train) => (
                  <TrainResultCard key={train.id} train={train} onSelect={handleSelectTrain} />
                ))}
              </div>
              <div className="wizard-nav">
                <button type="button" className="wizard-back-btn" onClick={() => setStep('search')}>
                  ← Back to Search
                </button>
                <button type="button" className="wizard-cancel-btn" onClick={() => navigate('/')}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'details' && selectedTrain && (
            <div className="modern-booking-card trains-theme futuristic-glass-card">
              <div className="card-glow trains-card-glow"></div>
              <div className="wizard-step-label">Step 3 of 3 — Traveller Details</div>

              <div className="booking-summary">
                <h4>🚂 {selectedTrain.operator} #{selectedTrain.trainNumber}</h4>
                <div className="booking-summary-item">
                  <strong>Route:</strong> {from} → {to}
                </div>
                <div className="booking-summary-item">
                  <strong>Departure:</strong> {formatTime(selectedTrain.departureTime)}
                </div>
                <div className="booking-summary-item">
                  <strong>Arrival:</strong> {formatTime(selectedTrain.arrivalTime)}
                  {selectedTrain.nextDay ? ' (+1 day)' : ''}
                </div>
              </div>

              <form className="modern-booking-form" onSubmit={handleDetailsSubmit}>
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

                <PassengerFields quantity={quantity} passengers={passengers} onChange={handlePassengerChange} />

                <div className="wizard-nav">
                  <button type="button" className="wizard-back-btn" onClick={() => setStep('results')}>
                    ← Back
                  </button>
                  <button type="submit" className="modern-submit-btn trains-submit">
                    <span>Review Booking</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>

      <BookingConfirmModal
        open={modalOpen}
        checked={policyChecked}
        onCheckedChange={setPolicyChecked}
        onConfirm={handleConfirm}
        onCancel={handleModalCancel}
        summary={modalSummary}
        amount={selectedTrain ? selectedTrain.price * quantity : null}
        paying={paying}
        paymentError={paymentError}
      />
    </>
  )
}
