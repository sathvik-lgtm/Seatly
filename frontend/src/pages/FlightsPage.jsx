import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookFlight, autocompleteAirports } from '../api/client'
import { collectPassengerDetails, countriesMatch } from '../utils/booking'
import { formatDateShort, formatTime } from '../utils/format'
import { generateFlightResults } from '../utils/mockResults'
import { FLIGHT_ROUTES } from '../data/popularRoutes'
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
import FlightResultCard from '../components/results/FlightResultCard'
import SeatMap from '../components/seats/SeatMap'

const EMPTY_PASSENGER = { name: '', age: '', gender: '' }
const EMPTY_SEATS = { outbound: [], return: [] }

export default function FlightsPage() {
  const navigate = useNavigate()
  const countries = useCountries()
  const { payWithRazorpay } = useRazorpayCheckout()

  // 'search' | 'results' | 'returnResults' | 'details' | 'seats'
  const [step, setStep] = useState('search')

  const [tripType, setTripType] = useState('one-way')
  const [country, setCountry] = useState('')

  const [from, setFrom] = useState('')
  const [fromItem, setFromItem] = useState(null)
  const [to, setTo] = useState('')
  const [toItem, setToItem] = useState(null)
  const [date, setDate] = useState('')

  const [returnFrom, setReturnFrom] = useState('')
  const [returnFromItem, setReturnFromItem] = useState(null)
  const [returnTo, setReturnTo] = useState('')
  const [returnToItem, setReturnToItem] = useState(null)
  const [returnDate, setReturnDate] = useState('')

  const [quantity, setQuantity] = useState(1)
  const [flightClass, setFlightClass] = useState('economy')
  const [passengers, setPassengers] = useState([{ ...EMPTY_PASSENGER }])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const [outboundResults, setOutboundResults] = useState([])
  const [returnResults, setReturnResults] = useState([])
  const [outboundFlight, setOutboundFlight] = useState(null)
  const [returnFlight, setReturnFlight] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState(EMPTY_SEATS)
  const [activeSeatLeg, setActiveSeatLeg] = useState('outbound')

  const [result, setResult] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [policyChecked, setPolicyChecked] = useState(false)
  const [pendingPayload, setPendingPayload] = useState(null)
  const [modalSummary, setModalSummary] = useState(null)
  const [paying, setPaying] = useState(false)
  const [paymentError, setPaymentError] = useState(null)

  const isRoundTrip = tripType === 'round-trip'
  const totalSteps = isRoundTrip ? 5 : 4
  const amount = outboundFlight
    ? outboundFlight.price * quantity + (isRoundTrip && returnFlight ? returnFlight.price * quantity : 0)
    : null

  function mirrorReturnRoute({ force }) {
    if (!force && (returnFrom || returnTo)) return
    setReturnFrom(to)
    setReturnFromItem(toItem)
    setReturnTo(from)
    setReturnToItem(fromItem)
  }

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

  function handleSelectTripType(next) {
    setTripType(next)
    if (next === 'round-trip') {
      mirrorReturnRoute({ force: true })
    }
  }

  function handleSwapOutgoing() {
    const newFrom = to
    const newFromItem = toItem
    const newTo = from
    const newToItem = fromItem
    setFrom(newFrom)
    setFromItem(newFromItem)
    setTo(newTo)
    setToItem(newToItem)
    if (isRoundTrip) {
      // Mirror using the post-swap route, not the stale pre-swap closure values.
      setReturnFrom(newTo)
      setReturnFromItem(newToItem)
      setReturnTo(newFrom)
      setReturnToItem(newFromItem)
    }
  }

  function handleSwapReturn() {
    setReturnFrom(returnTo)
    setReturnTo(returnFrom)
    setReturnFromItem(returnToItem)
    setReturnToItem(returnFromItem)
  }

  function handleOutgoingBlur() {
    if (isRoundTrip) mirrorReturnRoute({ force: false })
  }

  function handleDepartureDateChange(value) {
    setDate(value)
    if (isRoundTrip && returnDate && returnDate < value) {
      setReturnDate('')
    }
  }

  function handleReturnDateChange(value) {
    if (date && value < date) {
      alert('⚠️ Return date must be after or equal to departure date!')
      setReturnDate('')
      return
    }
    setReturnDate(value)
  }

  async function handleSelectRoute(fromCode, toCode) {
    try {
      const [fromData, toData] = await Promise.all([autocompleteAirports(fromCode), autocompleteAirports(toCode)])
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
    setTripType('one-way')
    setFrom('')
    setFromItem(null)
    setTo('')
    setToItem(null)
    setDate('')
    setReturnFrom('')
    setReturnFromItem(null)
    setReturnTo('')
    setReturnToItem(null)
    setReturnDate('')
    setQuantity(1)
    setFlightClass('economy')
    setPassengers([{ ...EMPTY_PASSENGER }])
    setName('')
    setEmail('')
    setOutboundResults([])
    setReturnResults([])
    setOutboundFlight(null)
    setReturnFlight(null)
    setSelectedSeats(EMPTY_SEATS)
    setActiveSeatLeg('outbound')
    setPendingPayload(null)
    setModalSummary(null)
    setPaymentError(null)
  }

  // This is the existing search-form validation, byte-for-byte — only what
  // happens after it passes has changed (generate mock results instead of
  // opening the confirm modal directly).
  function handleSearchSubmit(event) {
    event.preventDefault()

    if (country) {
      const countryName = country
      if (!fromItem || !toItem) {
        alert('⚠️ Please select both "From" and "To" airports.')
        return
      }
      if (!countriesMatch(fromItem.country, country)) {
        alert(`⚠️ Can only select airports in ${countryName}. The "From" airport must be in the selected country.`)
        return
      }
      if (!countriesMatch(toItem.country, country)) {
        alert(`⚠️ Can only select airports in ${countryName}. The "To" airport must be in the selected country.`)
        return
      }
      const fromCountry = (fromItem.country || '').toLowerCase()
      const toCountry = (toItem.country || '').toLowerCase()
      if (fromCountry !== toCountry && fromCountry && toCountry) {
        alert(
          `⚠️ Can only select airports in ${countryName}. International flights are not allowed when a country filter is selected. Both airports must be from ${countryName}.`,
        )
        return
      }
    }

    if (isRoundTrip) {
      if (!returnDate) {
        alert('⚠️ Please fill in a return date for round trip booking.')
        return
      }
      if (!returnFrom || !returnTo) {
        alert('⚠️ Please fill in return flight route (From and To) for round trip booking.')
        return
      }
      if (returnDate < date) {
        alert('⚠️ Return date must be after or equal to departure date!')
        return
      }
      if (country) {
        const countryName = country
        if (!returnFromItem || !returnToItem) {
          alert('⚠️ Please select both "From" and "To" airports for return flight.')
          return
        }
        if (!countriesMatch(returnFromItem.country, country)) {
          alert(`⚠️ Can only select airports in ${countryName}. The return "From" airport must be in the selected country.`)
          return
        }
        if (!countriesMatch(returnToItem.country, country)) {
          alert(`⚠️ Can only select airports in ${countryName}. The return "To" airport must be in the selected country.`)
          return
        }
        const returnFromCountry = (returnFromItem.country || '').toLowerCase()
        const returnToCountry = (returnToItem.country || '').toLowerCase()
        if (returnFromCountry !== returnToCountry && returnFromCountry && returnToCountry) {
          alert(
            `⚠️ Can only select airports in ${countryName}. International flights are not allowed when a country filter is selected. Both return airports must be from ${countryName}.`,
          )
          return
        }
      }
    }

    const results = generateFlightResults({ from, to, date, flightClass })
    setOutboundResults(results)
    setStep('results')
  }

  function handleSelectOutbound(flight) {
    setOutboundFlight(flight)
    // Seat codes are only meaningful relative to the flight they were picked
    // for (occupancy is seeded per-flight) — clear any stale selection.
    setSelectedSeats((prev) => ({ ...prev, outbound: [] }))
    if (isRoundTrip) {
      const results = generateFlightResults({ from: returnFrom, to: returnTo, date: returnDate, flightClass })
      setReturnResults(results)
      setStep('returnResults')
    } else {
      setStep('details')
    }
  }

  function handleSelectReturn(flight) {
    setReturnFlight(flight)
    setSelectedSeats((prev) => ({ ...prev, return: [] }))
    setStep('details')
  }

  function handleDetailsSubmit(event) {
    event.preventDefault()
    setSelectedSeats((prev) => ({
      outbound: prev.outbound.length === quantity ? prev.outbound : Array(quantity).fill(null),
      return: !isRoundTrip ? [] : prev.return.length === quantity ? prev.return : Array(quantity).fill(null),
    }))
    setActiveSeatLeg('outbound')
    setStep('seats')
  }

  const outboundSeatsComplete = selectedSeats.outbound.filter(Boolean).length === quantity
  const returnSeatsComplete = !isRoundTrip || selectedSeats.return.filter(Boolean).length === quantity
  const canContinueFromSeats = outboundSeatsComplete && returnSeatsComplete

  function handleSeatsContinue() {
    if (!canContinueFromSeats) return
    const validPassengers = collectPassengerDetails(passengers)

    const payload = {
      name,
      email,
      date,
      time: outboundFlight.departureTime,
      quantity,
      additional_info: {
        from,
        to,
        class: flightClass,
        passengers: validPassengers,
        trip_type: tripType,
        return_date: isRoundTrip ? returnDate : null,
        return_time: isRoundTrip ? returnFlight.departureTime : null,
        return_from: isRoundTrip ? returnFrom : null,
        return_to: isRoundTrip ? returnTo : null,
        airline: outboundFlight.airline,
        flight_number: outboundFlight.flightNumber,
        departure_time_actual: outboundFlight.departureTime,
        arrival_time_actual: outboundFlight.arrivalTime,
        duration: outboundFlight.duration,
        seats: selectedSeats.outbound,
        return_airline: isRoundTrip ? returnFlight.airline : null,
        return_flight_number: isRoundTrip ? returnFlight.flightNumber : null,
        return_departure_time_actual: isRoundTrip ? returnFlight.departureTime : null,
        return_arrival_time_actual: isRoundTrip ? returnFlight.arrivalTime : null,
        return_duration: isRoundTrip ? returnFlight.duration : null,
        return_seats: isRoundTrip ? selectedSeats.return : [],
      },
    }

    setModalSummary(
      <div className="booking-summary">
        <h4>✈️ Flight Details</h4>
        <div className="booking-summary-item">
          <strong>Outgoing Route:</strong> {from} → {to}
        </div>
        <div className="booking-summary-item">
          <strong>Flight:</strong> {outboundFlight.airline} {outboundFlight.flightNumber}
        </div>
        <div className="booking-summary-item">
          <strong>Seats:</strong> {selectedSeats.outbound.join(', ')}
        </div>
        {isRoundTrip && (
          <>
            <div className="booking-summary-item">
              <strong>Return Route:</strong> {returnFrom} → {returnTo}
            </div>
            <div className="booking-summary-item">
              <strong>Return Flight:</strong> {returnFlight.airline} {returnFlight.flightNumber}
            </div>
            <div className="booking-summary-item">
              <strong>Return Seats:</strong> {selectedSeats.return.join(', ')}
            </div>
          </>
        )}
        <div className="booking-summary-item">
          <strong>Trip Type:</strong> {isRoundTrip ? '🔄 Round Trip' : '➡️ One Way'}
        </div>
        <div className="booking-summary-item">
          <strong>Departure:</strong> {formatDateShort(date)} at {formatTime(outboundFlight.departureTime)}
        </div>
        {isRoundTrip && (
          <div className="booking-summary-item">
            <strong>Return:</strong> {formatDateShort(returnDate)} at {formatTime(returnFlight.departureTime)}
          </div>
        )}
        <div className="booking-summary-item">
          <strong>Passengers:</strong> {quantity}
        </div>
        <div className="booking-summary-item">
          <strong>Class:</strong> {flightClass}
        </div>
        <div className="booking-summary-item">
          <strong>Total:</strong> ₹
          {(outboundFlight.price * quantity + (isRoundTrip ? returnFlight.price * quantity : 0)).toLocaleString(
            'en-IN',
          )}
        </div>
      </div>,
    )
    setPaymentError(null)
    setPendingPayload(payload)
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
        description: isRoundTrip
          ? `${outboundFlight.airline} ${outboundFlight.flightNumber} + return`
          : `${outboundFlight.airline} ${outboundFlight.flightNumber}`,
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
      const res = await bookFlight(payload)
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
        themeClass="flights-header"
        glowClass="flights-glow"
        accentClass="flights-accent"
        titleMain="✈️ FLIGHT BOOKING"
        titleSub="NEXT-GEN AIR TRAVEL"
      />

      <section className="booking-section futuristic-booking">
        <div className={`modern-booking-wrapper${step === 'search' ? '' : ' single-column'}`}>
          {step === 'search' && (
            <>
              <div className="modern-booking-card flights-theme futuristic-glass-card">
                <div className="card-glow flights-card-glow"></div>
                <div className="booking-header-modern futuristic-form-header">
                  <h2 className="futuristic-form-title">✈️ BOOK YOUR FLIGHT</h2>
                  <div className="welcome-accent flights-accent"></div>
                  <p className="subtitle-modern futuristic-form-subtitle">Find the best flights at great prices</p>
                </div>

                <form className="modern-booking-form" onSubmit={handleSearchSubmit}>
                  <div className="route-selector">
                    <div
                      className={`route-option${!isRoundTrip ? ' active' : ''}`}
                      onClick={() => handleSelectTripType('one-way')}
                    >
                      <span>One Way</span>
                    </div>
                    <div
                      className={`route-option${isRoundTrip ? ' active' : ''}`}
                      onClick={() => handleSelectTripType('round-trip')}
                    >
                      <span>Round Trip</span>
                    </div>
                  </div>

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label htmlFor="country">🌍 Select Country (Optional)</label>
                      <CountrySelect countries={countries} value={country} onChange={setCountry} />
                      <small className="form-hint">Select a country to filter airports by location</small>
                    </div>
                  </div>

                  <div className="flight-section" id="outgoingSection">
                    <div className="section-divider">
                      <span>✈️ Outgoing Flight</span>
                    </div>

                    <div className="route-inputs">
                      <div className="route-input-wrapper">
                        <div className="input-icon">📍</div>
                        <div className="input-content">
                          <label htmlFor="from">From</label>
                          <AutocompleteInput
                            id="from"
                            kind="airport"
                            placeholder="City or Airport"
                            value={from}
                            onValueChange={setFrom}
                            selectedItem={fromItem}
                            onSelect={setFromItem}
                            country={country}
                            countryName={country}
                            required
                            onBlur={handleOutgoingBlur}
                          />
                        </div>
                        <SwapRouteButton onClick={handleSwapOutgoing} />
                      </div>

                      <div className="route-input-wrapper">
                        <div className="input-icon">✈️</div>
                        <div className="input-content">
                          <label htmlFor="to">To</label>
                          <AutocompleteInput
                            id="to"
                            kind="airport"
                            placeholder="City or Airport"
                            value={to}
                            onValueChange={setTo}
                            selectedItem={toItem}
                            onSelect={setToItem}
                            country={country}
                            countryName={country}
                            required
                            onBlur={handleOutgoingBlur}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-row-modern">
                      <div className="form-group-modern">
                        <label htmlFor="date">📅 Departure Date</label>
                        <input
                          type="date"
                          id="date"
                          className="modern-input"
                          value={date}
                          onChange={(event) => handleDepartureDateChange(event.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {isRoundTrip && (
                    <div className="flight-section" id="returnSection">
                      <div className="section-divider">
                        <span>🔄 Return Flight</span>
                      </div>

                      <div className="route-inputs">
                        <div className="route-input-wrapper">
                          <div className="input-icon">📍</div>
                          <div className="input-content">
                            <label htmlFor="returnFrom">From</label>
                            <AutocompleteInput
                              id="returnFrom"
                              kind="airport"
                              placeholder="City or Airport"
                              value={returnFrom}
                              onValueChange={setReturnFrom}
                              selectedItem={returnFromItem}
                              onSelect={setReturnFromItem}
                              country={country}
                              countryName={country}
                              required={isRoundTrip}
                            />
                          </div>
                          <SwapRouteButton onClick={handleSwapReturn} />
                        </div>

                        <div className="route-input-wrapper">
                          <div className="input-icon">✈️</div>
                          <div className="input-content">
                            <label htmlFor="returnTo">To</label>
                            <AutocompleteInput
                              id="returnTo"
                              kind="airport"
                              placeholder="City or Airport"
                              value={returnTo}
                              onValueChange={setReturnTo}
                              selectedItem={returnToItem}
                              onSelect={setReturnToItem}
                              country={country}
                              countryName={country}
                              required={isRoundTrip}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-row-modern">
                        <div className="form-group-modern">
                          <label htmlFor="returnDate">📅 Return Date</label>
                          <input
                            type="date"
                            id="returnDate"
                            className="modern-input"
                            min={date || undefined}
                            value={returnDate}
                            onChange={(event) => handleReturnDateChange(event.target.value)}
                            required={isRoundTrip}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="form-row-modern">
                    <div className="form-group-modern">
                      <label htmlFor="quantity">👥 Passengers</label>
                      <QuantitySelector value={quantity} onChange={handleQuantityChange} />
                    </div>
                    <div className="form-group-modern">
                      <label>💺 Class</label>
                      <div className="class-selector">
                        {['economy', 'business', 'first'].map((option) => (
                          <label className="class-option" key={option}>
                            <input
                              type="radio"
                              name="class"
                              value={option}
                              checked={flightClass === option}
                              onChange={(event) => setFlightClass(event.target.value)}
                            />
                            <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="modern-submit-btn flights-submit">
                    <span>Search Flights</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </form>
                <div className={`booking-result${result ? ` ${result.type}` : ''}`}>{result?.message}</div>
              </div>

              <PopularRoutes routes={FLIGHT_ROUTES} onSelectRoute={handleSelectRoute} variant="flights" />
            </>
          )}

          {step === 'results' && (
            <div className="modern-booking-card flights-theme futuristic-glass-card">
              <div className="card-glow flights-card-glow"></div>
              <div className="wizard-step-label">
                Step 2 of {totalSteps} — Choose Your Outbound Flight ({from} → {to})
              </div>
              <div className="results-grid">
                {outboundResults.map((flight) => (
                  <FlightResultCard key={flight.id} flight={flight} onSelect={handleSelectOutbound} />
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

          {step === 'returnResults' && (
            <div className="modern-booking-card flights-theme futuristic-glass-card">
              <div className="card-glow flights-card-glow"></div>
              <div className="wizard-step-label">
                Step 3 of {totalSteps} — Choose Your Return Flight ({returnFrom} → {returnTo})
              </div>
              <div className="results-grid">
                {returnResults.map((flight) => (
                  <FlightResultCard key={flight.id} flight={flight} onSelect={handleSelectReturn} />
                ))}
              </div>
              <div className="wizard-nav">
                <button type="button" className="wizard-back-btn" onClick={() => setStep('results')}>
                  ← Back
                </button>
                <button type="button" className="wizard-cancel-btn" onClick={() => navigate('/')}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === 'details' && outboundFlight && (
            <div className="modern-booking-card flights-theme futuristic-glass-card">
              <div className="card-glow flights-card-glow"></div>
              <div className="wizard-step-label">
                Step {isRoundTrip ? 4 : 3} of {totalSteps} — Traveller Details
              </div>

              <div className="booking-summary">
                <h4>✈️ {outboundFlight.airline} {outboundFlight.flightNumber}</h4>
                <div className="booking-summary-item">
                  <strong>Route:</strong> {from} → {to}
                </div>
                <div className="booking-summary-item">
                  <strong>Departure:</strong> {formatTime(outboundFlight.departureTime)}
                </div>
                {isRoundTrip && returnFlight && (
                  <div className="booking-summary-item">
                    <strong>Return:</strong> {returnFlight.airline} {returnFlight.flightNumber} at{' '}
                    {formatTime(returnFlight.departureTime)}
                  </div>
                )}
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
                  <button
                    type="button"
                    className="wizard-back-btn"
                    onClick={() => setStep(isRoundTrip ? 'returnResults' : 'results')}
                  >
                    ← Back
                  </button>
                  <button type="submit" className="modern-submit-btn flights-submit">
                    <span>Continue to Seat Selection</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'seats' && outboundFlight && (
            <div className="modern-booking-card flights-theme futuristic-glass-card">
              <div className="card-glow flights-card-glow"></div>
              <div className="wizard-step-label">
                Step {totalSteps} of {totalSteps} — Select Your Seat{quantity > 1 ? 's' : ''}
              </div>

              {isRoundTrip && (
                <div className="seat-leg-tabs">
                  <button
                    type="button"
                    className={`seat-leg-tab${activeSeatLeg === 'outbound' ? ' active' : ''}`}
                    onClick={() => setActiveSeatLeg('outbound')}
                  >
                    ✈️ Outbound: {from} → {to}
                    {outboundSeatsComplete ? ' ✓' : ''}
                  </button>
                  <button
                    type="button"
                    className={`seat-leg-tab${activeSeatLeg === 'return' ? ' active' : ''}`}
                    onClick={() => setActiveSeatLeg('return')}
                  >
                    🔄 Return: {returnFrom} → {returnTo}
                    {returnSeatsComplete ? ' ✓' : ''}
                  </button>
                </div>
              )}

              <SeatMap
                key={activeSeatLeg}
                flightId={activeSeatLeg === 'outbound' ? outboundFlight.id : returnFlight.id}
                passengers={passengers}
                assignedSeats={selectedSeats[activeSeatLeg]}
                onChange={(next) => setSelectedSeats((prev) => ({ ...prev, [activeSeatLeg]: next }))}
              />

              <div className="wizard-nav">
                <button type="button" className="wizard-back-btn" onClick={() => setStep('details')}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="modern-submit-btn flights-submit"
                  disabled={!canContinueFromSeats}
                  onClick={handleSeatsContinue}
                >
                  <span>Continue to Review</span>
                  <span className="btn-arrow">→</span>
                </button>
              </div>
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
        amount={amount}
        paying={paying}
        paymentError={paymentError}
      />
    </>
  )
}
