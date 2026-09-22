import { createPaymentOrder, verifyPayment } from '../api/client'

// Wraps Razorpay's callback-based checkout widget in a promise: resolves with
// {razorpay_payment_id, razorpay_order_id} once a payment is made AND
// verified server-side; rejects on cancel, failure, or if checkout.js never
// loaded (e.g. blocked by an ad-blocker).
async function payWithRazorpay({ amount, name, email, description }) {
  if (typeof window.Razorpay === 'undefined') {
    throw new Error('Payment gateway failed to load. Please check your connection and try again.')
  }

  const order = await createPaymentOrder(amount)

  return new Promise((resolve, reject) => {
    let settled = false

    const options = {
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: 'Seatly',
      description,
      prefill: { name, email },
      theme: { color: '#6c5ce7' },
      handler: async (response) => {
        if (settled) return
        try {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
          settled = true
          resolve({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
          })
        } catch (error) {
          settled = true
          reject(error)
        }
      },
      modal: {
        ondismiss: () => {
          if (settled) return
          settled = true
          reject(new Error('Payment cancelled'))
        },
      },
    }

    new window.Razorpay(options).open()
  })
}

export function useRazorpayCheckout() {
  return { payWithRazorpay }
}
