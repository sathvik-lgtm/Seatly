export default function PopularRoutes({ routes, onSelectRoute, variant = 'trains' }) {
  const cards = routes.map((r) => (
    <div key={`${r.from}-${r.to}`} className="suggestion-card" onClick={() => onSelectRoute(r.from, r.to)}>
      <span className="route">{r.route}</span>
      <span className="price">{r.price}</span>
    </div>
  ))

  if (variant === 'trains') {
    return (
      <div className="quick-suggestions futuristic-glass-card">
        <div className="card-glow trains-card-glow"></div>
        <h3 className="futuristic-sidebar-title">Popular Routes</h3>
        <div className="suggestion-cards futuristic-suggestions">{cards}</div>
      </div>
    )
  }

  return (
    <div className="quick-suggestions">
      <h3>Popular Routes</h3>
      <div className="suggestion-cards">{cards}</div>
    </div>
  )
}
