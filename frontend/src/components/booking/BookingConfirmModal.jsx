export default function BookingConfirmModal({
  open,
  checked,
  onCheckedChange,
  onConfirm,
  onCancel,
  summary,
  amount,
  paying,
  paymentError,
}) {
  if (!open) return null

  return (
    <div
      className="modal-overlay"
      style={{ display: 'flex' }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !paying) onCancel()
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h3>⚠️ Cancellation Policy</h3>
        </div>
        <div className="modal-body">
          {summary && (
            <>
              {summary}
              <div className="modal-divider"></div>
            </>
          )}
          <p>
            <strong>Important:</strong> Cancellation is free until 3 days before the booking date.
          </p>
          <p className="modal-info">After that, a cancellation fee of ₹100 will apply.</p>
          {amount != null && (
            <p className="modal-info">🧪 Test Mode — this uses Razorpay's sandbox, no real charge will be made.</p>
          )}
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="bookingPolicyCheckbox"
              checked={checked}
              onChange={(event) => onCheckedChange(event.target.checked)}
              disabled={paying}
              required
            />
            <label htmlFor="bookingPolicyCheckbox">I understand and agree to the cancellation policy</label>
          </div>
          {paymentError && (
            <p className="modal-info" style={{ color: '#dc3545' }}>
              ⚠️ {paymentError}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="modal-btn modal-btn-cancel" onClick={onCancel} disabled={paying}>
            Return to Home
          </button>
          <button
            type="button"
            className="modal-btn modal-btn-confirm"
            disabled={!checked || paying}
            onClick={onConfirm}
          >
            {paying
              ? 'Processing…'
              : amount != null
                ? `Pay ₹${amount.toLocaleString('en-IN')} & Confirm Booking`
                : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  )
}
