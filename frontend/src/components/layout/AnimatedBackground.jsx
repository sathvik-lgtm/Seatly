const PARTICLE_COUNTS = { home: 8, movies: 6, trains: 6, flights: 6, profile: 6 }

const NEON_BACKGROUND_CLASS = {
  movies: 'neon-movie-background',
  trains: 'neon-train-background',
  flights: 'neon-airport-background',
}

function Particles({ count }) {
  return Array.from({ length: count }).map((_, i) => <div className="particle" key={i}></div>)
}

export default function AnimatedBackground({ variant }) {
  const particleCount = PARTICLE_COUNTS[variant] || 6

  if (variant === 'home') {
    return (
      <div className="futuristic-bg">
        <div className="grid-overlay"></div>
        <div className="particles-container">
          <Particles count={particleCount} />
        </div>
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
    )
  }

  if (variant === 'profile') {
    return (
      <div className="futuristic-bg profile-bg">
        <div className="grid-overlay profile-grid"></div>
        <div className="particles-container profile-particles">
          <Particles count={particleCount} />
        </div>
        <div className="gradient-orb profile-orb-1"></div>
        <div className="gradient-orb profile-orb-2"></div>
        <div className="gradient-orb profile-orb-3"></div>
      </div>
    )
  }

  return (
    <div className={`futuristic-bg ${variant}-bg`}>
      <div className={NEON_BACKGROUND_CLASS[variant]}></div>
      <div className={`grid-overlay ${variant}-grid`}></div>
      <div className={`particles-container ${variant}-particles`}>
        <Particles count={particleCount} />
      </div>
      <div className={`gradient-orb ${variant}-orb-1`}></div>
      <div className={`gradient-orb ${variant}-orb-2`}></div>
      <div className={`${variant}-background-overlay`}></div>
    </div>
  )
}
