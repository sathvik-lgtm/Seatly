import { useCallback, useEffect, useState } from 'react'
import { cancelBooking as cancelBookingRequest, getAllBookings } from '../api/client'

export function useBookings() {
  const [bookings, setBookings] = useState({ movies: [], trains: [], flights: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllBookings()
      setBookings({
        movies: data.movies || [],
        trains: data.trains || [],
        flights: data.flights || [],
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching bookings:', err)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refetch()
  }, [refetch])

  async function cancelBooking(type, bookingId) {
    const result = await cancelBookingRequest(type, bookingId)
    await refetch()
    return result
  }

  return { bookings, loading, error, cancelBooking, refetch }
}
