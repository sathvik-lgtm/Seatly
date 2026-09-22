export default function SwapRouteButton({ onClick }) {
  return (
    <button type="button" className="swap-btn" onClick={onClick} aria-label="Swap route">
      ⇄
    </button>
  )
}
