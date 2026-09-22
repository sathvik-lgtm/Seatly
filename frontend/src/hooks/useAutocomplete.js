import { useEffect, useRef, useState } from 'react'
import { countriesMatch } from '../utils/booking'

export function useAutocomplete(fetchFn, query, country) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    clearTimeout(timeoutRef.current)

    if (!query || query.length < 1) {
      setResults([])
      setLoading(false)
      setError(false)
      return undefined
    }

    setLoading(true)
    timeoutRef.current = setTimeout(async () => {
      try {
        const data = await fetchFn(query, country)
        const rawResults = data.results || []
        const filtered = country
          ? rawResults.filter((result) => countriesMatch(result.country, country))
          : rawResults
        setResults(filtered)
        setError(false)
      } catch (err) {
        console.error('Autocomplete error:', err)
        setError(true)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 150)

    return () => clearTimeout(timeoutRef.current)
  }, [fetchFn, query, country])

  return { results, loading, error }
}
