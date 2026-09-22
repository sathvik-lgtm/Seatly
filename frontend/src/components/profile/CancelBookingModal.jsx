import { isWithinThreeDays } from '../../utils/booking'

export default function CancelBookingModal({ open, booking, checked, onCheckedChange, onConfirm, onCancel }) {
  if (!open || !booking) return null

  const isLate = isWithinThreeDays(booking.date)

  return (
    <div
      className="modal-overlay"
      style={{ display: 'flex' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onCancel()
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3>⚠️ Cancel Booking</h3>
        </div>
        <div className="modal-body">
          {isLate ? (
            <>
              <p className="modal-warning" style={{ color: '#dc3545', fontWeight: 'bold', fontSize: '1.2rem' }}>
                ⚠️ Late Cancellation
              </p>
              <p>You are cancelling within 3 days of the booking date.</p>
              <p className="modal-warning" style={{ color: '#dc3545', fontSize: '1.1rem', marginTop: '15px' }}>
                <strong>Cancellation Fee: ₹100</strong>
              </p>
              <div className="checkbox-container" style={{ marginTop: '20px' }}>
                <input
                  type="checkbox"
                  id="cancelFeeCheckbox"
                  checked={checked}
                  onChange={(event) => onCheckedChange(event.target.checked)}
                  required
                />
                <label htmlFor="cancelFeeCheckbox">I understand and agree to pay the cancellation fee of ₹100</label>
              </div>
            </>
          ) : (
            <>
              <p>Are you sure you want to cancel !?</p>
              <p className="modal-info">Cancellation is free as you are cancelling more than 3 days before the booking date.</p>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onCancel}>
            No, Keep Booking
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-confirm"
            disabled={isLate && !checked}
            onClick={onConfirm}
          >
            Yes, Cancel Booking
          </button>
        </div>
      </div>
    </div>
  )
}
