import { useEffect, useRef, useState } from 'react'
import { autocompleteAirports, autocompleteTrainStations } from '../../api/client'
import { useAutocomplete } from '../../hooks/useAutocomplete'
import { countriesMatch } from '../../utils/booking'

const FETCHERS = {
  airport: autocompleteAirports,
  station: autocompleteTrainStations,
}

const TYPE_META = {
  airport: { icon: '✈️', label: 'airport' },
  station: { icon: '🚂', label: 'station' },
}

export default function AutocompleteInput({
  id,
  kind,
  placeholder,
  value,
  onValueChange,
  selectedItem,
  onSelect,
  country,
  countryName,
  required,
  onBlur,
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef(null)
  const prevCountryRef = useRef(country)
  const { icon, label } = TYPE_META[kind]
  const { results, loading, error } = useAutocomplete(FETCHERS[kind], value, country)
  const limitedResults = results.slice(0, 8)

  useEffect(() => {
    setActiveIndex(0)
  }, [results])

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Clear the field if a country filter change makes the current selection invalid,
  // mirroring the old Autocomplete class's country-change handler.
  useEffect(() => {
    if (prevCountryRef.current === country) return
    prevCountryRef.current = country
    if (selectedItem && country && !countriesMatch(selectedItem.country, country)) {
      onValueChange('')
      onSelect(null)
    } else if (country && !selectedItem) {
      onValueChange('')
    }
    setOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country])

  function handleChange(event) {
    const text = event.target.value
    onValueChange(text)
    if (selectedItem) onSelect(null)
    setOpen(text.length > 0)
  }

  function handleFocus() {
    if (value.length > 0) setOpen(true)
  }

  function selectResult(item) {
    if (country && !countriesMatch(item.country, country)) {
      alert(`⚠️ Can only select ${label}s in ${countryName}. This ${label} is not in the selected country.`)
      setOpen(false)
      return
    }
    onValueChange(item.display || item.name || item.code)
    onSelect(item)
    setOpen(false)
  }

  function handleClear() {
    onValueChange('')
    onSelect(null)
    setOpen(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, limitedResults.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      if (open && limitedResults[activeIndex]) {
        event.preventDefault()
        selectResult(limitedResults[activeIndex])
      }
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="autocomplete-group" ref={containerRef}>
      <input
        type="text"
        id={id}
        name={id}
        autoComplete="off"
        placeholder={country ? `Select ${label} in ${countryName}` : placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        required={required}
      />
      {value.trim() && (
        <button type="button" className="autocomplete-clear" aria-label="Clear input" onClick={handleClear}>
          ✕
        </button>
      )}
      {open && (
        <div
          className="autocomplete-dropdown autocomplete-dropdown-visible"
          style={{ display: 'block', visibility: 'visible', opacity: 1 }}
        >
          {loading && (
            <div className="autocomplete-loading">
              <div className="loading-spinner"></div>
              <div className="loading-text">Searching...</div>
            </div>
          )}
          {!loading && error && (
            <div className="autocomplete-error">
              <div className="error-icon">⚠️</div>
              <div className="error-text">Error loading results</div>
              <div className="error-hint">Please try again</div>
            </div>
          )}
          {!loading && !error && limitedResults.length === 0 && (
            <div className="autocomplete-no-results">
              <div className="no-results-icon">🔍</div>
              <div className="no-results-text">No results found</div>
              <div className="no-results-hint">Try a different search term</div>
            </div>
          )}
          {!loading &&
            !error &&
            limitedResults.map((result, index) => (
              <div
                key={`${result.code}-${index}`}
                className={`autocomplete-item${index === activeIndex ? ' active' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectResult(result)}
              >
                <div className="autocomplete-item-icon">{icon}</div>
                <div className="autocomplete-item-content">
                  <div className="autocomplete-main">{result.display || result.name || result.code}</div>
                  <div className="autocomplete-details">
                    {result.code && <span className="autocomplete-code">{result.code}</span>}
                    {result.city && <span className="autocomplete-city">{result.city}</span>}
                    {result.country && <span className="autocomplete-country">{result.country}</span>}
                  </div>
                </div>
                <div className="autocomplete-item-arrow">→</div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
