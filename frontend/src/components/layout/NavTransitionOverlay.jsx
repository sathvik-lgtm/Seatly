export default function NavTransitionOverlay({ overlay }) {
  const classNames = ['show', overlay.className].filter(Boolean)
  return (
    <div id="transitionOverlay" className={overlay.show ? classNames.join(' ') : ''}>
      <div className="animation-wrapper">
        <div className="animation-icon">{overlay.icon}</div>
        <p className="animation-text">{overlay.text}</p>
      </div>
    </div>
  )
}
