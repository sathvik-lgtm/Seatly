import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button className="theme-switcher futuristic-btn" onClick={toggleTheme} aria-label="Toggle theme">
      <span className="theme-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
    </button>
  )
}
