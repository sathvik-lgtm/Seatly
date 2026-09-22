import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="profile-container" ref={containerRef}>
      <button
        className="profile-btn futuristic-btn"
        aria-label="View profile"
        onClick={(event) => {
          event.stopPropagation()
          setOpen((current) => !current)
        }}
      >
        <span className="profile-icon">👤</span>
      </button>
      <div
        className="profile-dropdown"
        style={{ opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden' }}
      >
        <Link to="/profile" className="profile-option" onClick={() => setOpen(false)}>
          View My Bookings
        </Link>
      </div>
    </div>
  )
}
