export default function QuantitySelector({ id = 'quantity', value, onChange, min = 1, max = 10 }) {
  function decrement() {
    if (value > min) onChange(value - 1)
  }

  function increment() {
    if (value < max) onChange(value + 1)
  }

  function handleChange(event) {
    const parsed = parseInt(event.target.value, 10)
    onChange(Number.isNaN(parsed) ? min : parsed)
  }

  return (
    <div className="quantity-selector">
      <button type="button" className="qty-btn" onClick={decrement}>
        −
      </button>
      <input
        type="number"
        id={id}
        name={id}
        value={value}
        min={min}
        max={max}
        className="qty-input"
        required
        onChange={handleChange}
      />
      <button type="button" className="qty-btn" onClick={increment}>
        +
      </button>
    </div>
  )
}
