export default function PassengerFields({ quantity, passengers, onChange }) {
  if (quantity <= 0) return null

  return (
    <div className="passenger-section" id="passengerSection">
      <div className="section-divider">
        <span>Passenger Details</span>
      </div>
      <div id="passengerDetails">
        {Array.from({ length: quantity }).map((_, index) => {
          const passenger = passengers[index] || { name: '', age: '', gender: '' }
          return (
            <div className="passenger-card" key={index}>
              <h4 className="passenger-number">Passenger {index + 1}</h4>
              <div className="passenger-fields">
                <div className="form-group-modern">
                  <label htmlFor={`passenger_name_${index + 1}`}>👤 Full Name</label>
                  <input
                    type="text"
                    id={`passenger_name_${index + 1}`}
                    className="modern-input"
                    placeholder="Enter passenger name"
                    value={passenger.name}
                    onChange={(event) => onChange(index, 'name', event.target.value)}
                    required
                  />
                </div>
                <div className="form-row-modern">
                  <div className="form-group-modern">
                    <label htmlFor={`passenger_age_${index + 1}`}>🎂 Age</label>
                    <input
                      type="number"
                      id={`passenger_age_${index + 1}`}
                      className="modern-input"
                      min="1"
                      max="120"
                      placeholder="Age"
                      value={passenger.age}
                      onChange={(event) => onChange(index, 'age', event.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group-modern">
                    <label htmlFor={`passenger_gender_${index + 1}`}>⚧️ Gender</label>
                    <select
                      id={`passenger_gender_${index + 1}`}
                      className="modern-select"
                      value={passenger.gender}
                      onChange={(event) => onChange(index, 'gender', event.target.value)}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
