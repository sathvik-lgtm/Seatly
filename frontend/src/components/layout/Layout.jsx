import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AnimatedBackground from './AnimatedBackground'
import ThemeToggle from './ThemeToggle'
import ProfileDropdown from './ProfileDropdown'
import NavTransitionOverlay from './NavTransitionOverlay'
import { useNavTransition } from '../../hooks/useNavTransition'

const VARIANT_BY_PATH = {
  '/': 'home',
  '/movies': 'movies',
  '/trains': 'trains',
  '/flights': 'flights',
  '/profile': 'profile',
}

const BODY_CLASS_BY_PATH = {
  '/': 'homepage-futuristic',
  '/movies': 'movies-page movies-futuristic',
  '/trains': 'trains-page trains-futuristic',
  '/flights': 'flights-page flights-futuristic',
  '/profile': 'profile-futuristic',
}

export default function Layout() {
  const location = useLocation()
  const variant = VARIANT_BY_PATH[location.pathname] || 'home'
  const { overlay, playTransition } = useNavTransition()

  useEffect(() => {
    document.body.className = BODY_CLASS_BY_PATH[location.pathname] || ''
  }, [location.pathname])

  return (
    <>
      <AnimatedBackground variant={variant} />
      <div className="container futuristic-container">
        <ThemeToggle />
        <ProfileDropdown />
        <Outlet context={{ playTransition }} />
      </div>
      <NavTransitionOverlay overlay={overlay} />
    </>
  )
}
