import { useOutletContext } from 'react-router-dom'

const NAV_ITEMS = [
  { type: 'movies', to: '/movies', icon: '🎬', label: 'MOVIES', glow: 'movies-glow' },
  { type: 'trains', to: '/trains', icon: '🚂', label: 'TRAINS', glow: 'trains-glow' },
  { type: 'flights', to: '/flights', icon: '✈️', label: 'FLIGHTS', glow: 'flights-glow' },
]

export default function HomePage() {
  const { playTransition } = useOutletContext()

  return (
    <>
      <header className="header futuristic-header">
        <div className="title-glow"></div>
        <h1 className="main-title futuristic-title">
          <span className="title-main">SEATLY</span>
          <span className="title-sub">NEXT-GEN BOOKING</span>
        </h1>
        <p className="subtitle futuristic-subtitle">Experience the future of travel &amp; entertainment</p>
        <div className="header-accent-line"></div>
      </header>

      <nav className="nav-menu futuristic-nav">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.type}
            href={item.to}
            className={`nav-btn ${item.type}-btn futuristic-card`}
            onClick={(event) => {
              event.preventDefault()
              playTransition(item.type, item.to)
            }}
          >
            <div className={`card-glow ${item.glow}`}></div>
            <div className="card-content">
              <div className="btn-icon futuristic-icon">{item.icon}</div>
              <span className="btn-text">{item.label}</span>
              <div className="card-accent"></div>
            </div>
          </a>
        ))}
      </nav>

      <section className="welcome-section futuristic-welcome">
        <div className="welcome-card futuristic-glass">
          <div className="welcome-header">
            <h2 className="welcome-title">WELCOME TO THE FUTURE</h2>
            <div className="welcome-accent"></div>
          </div>
          <p className="welcome-text">Seamlessly book your next adventure with cutting-edge technology</p>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">🎬</div>
              <div className="feature-content">
                <h3>Cinema Experience</h3>
                <p>Premium movie bookings</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🚂</div>
              <div className="feature-content">
                <h3>Rail Network</h3>
                <p>Fast train reservations</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✈️</div>
              <div className="feature-content">
                <h3>Sky Travel</h3>
                <p>Global flight bookings</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
