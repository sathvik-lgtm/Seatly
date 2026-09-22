import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ANIMATION_CONFIG = {
  flights: { icon: '✈️', text: 'Preparing your flight...', className: 'flight' },
  trains: { icon: '🚄', text: 'All aboard! Getting your train ready...', className: 'trains' },
  movies: { icon: '🎬', text: 'Rolling the reels...', className: 'movies' },
}

export function useNavTransition() {
  const navigate = useNavigate()
  const [overlay, setOverlay] = useState({
    show: false,
    icon: '✈️',
    text: 'Preparing your trip...',
    className: '',
  })
  const transitioningRef = useRef(false)

  const playTransition = useCallback(
    (type, targetUrl) => {
      if (transitioningRef.current) return
      const config = ANIMATION_CONFIG[type] || ANIMATION_CONFIG.movies
      transitioningRef.current = true
      setOverlay({ show: true, icon: config.icon, text: config.text, className: config.className })

      setTimeout(() => {
        setOverlay((current) => ({ ...current, show: false, className: '' }))
        transitioningRef.current = false
        navigate(targetUrl)
      }, 1000)
    },
    [navigate],
  )

  return { overlay, playTransition }
}
