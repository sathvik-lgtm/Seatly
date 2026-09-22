export default function CountrySelect({ id = 'country', countries, value, onChange }) {
  return (
    <select id={id} name={id} className="modern-select" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">All Countries</option>
      {countries.map((country) => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>
  )
}
