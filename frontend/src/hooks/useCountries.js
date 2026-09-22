import { useEffect, useState } from 'react'
import { getCountries } from '../api/client'

export function useCountries() {
  const [countries, setCountries] = useState([])

  useEffect(() => {
    let cancelled = false
    getCountries()
      .then((data) => {
        if (!cancelled) setCountries(data.countries || [])
      })
      .catch((error) => {
        console.error('Error loading countries:', error)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return countries
}
