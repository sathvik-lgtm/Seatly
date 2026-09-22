import { Link } from 'react-router-dom'

export default function PageHeader({ themeClass, glowClass, accentClass, titleMain, titleSub }) {
  return (
    <header className={`header futuristic-header ${themeClass}`}>
      <div className={`title-glow ${glowClass}`}></div>
      <h1 className="main-title futuristic-title">
        <span className="title-main">{titleMain}</span>
        <span className="title-sub">{titleSub}</span>
      </h1>
      <div className={`header-accent-line ${accentClass}`}></div>
      <Link to="/" className="back-btn futuristic-back-btn">
        ← Back to Home
      </Link>
    </header>
  )
}
