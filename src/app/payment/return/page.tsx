'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

function PaymentContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Processing your payment...')

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentId =
          searchParams.get('payment_id') ||
          searchParams.get('pay_id') ||
          searchParams.get('id') ||
          searchParams.get('txn_id') ||
          localStorage.getItem('dt_payment_id')

        const bookingId = searchParams.get('booking_id') || localStorage.getItem('dt_booking_id')
        const service = searchParams.get('service') || localStorage.getItem('dt_service') || 'package'
        const pendingApp = localStorage.getItem('dt_pending_app')

        if (!paymentId) {
          setStatus('error')
          setMessage('No payment reference found. Please contact support.')
          return
        }

        const verifyRes = await fetch(`/api/kwikupi/verify-payment?payment_id=${paymentId}`)
        if (!verifyRes.ok) {
          setStatus('error')
          setMessage('Failed to verify payment. Please contact support.')
          return
        }

        const verifyData = await verifyRes.json()
        const paymentSuccess = verifyData.status === 'TXN_SUCCESS' || verifyData.status === 'PENDING'

        if (paymentSuccess) {
          if (pendingApp) {
            // Adventure flow: pending app in localStorage — create booking now
            const formData = JSON.parse(pendingApp)
            const createRes = await fetch('/api/package-bookings', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': formData.userId || '',
              },
              body: JSON.stringify({
                ...formData,
                paymentId: verifyData.payment_id,
                paymentOrderId: verifyData.order_id,
                paymentStatus: verifyData.status === 'TXN_SUCCESS' ? 'completed' : 'pending',
                paymentAmount: verifyData.amount,
              }),
            })

            if (createRes.ok) {
              localStorage.removeItem('dt_pending_app')
              localStorage.removeItem('dt_payment_id')
              localStorage.removeItem('dt_booking_id')
              localStorage.removeItem('dt_service')
              setStatus('success')
              setMessage(`Payment successful! Your booking has been submitted. Reference: ${verifyData.order_id}`)
            } else {
              const err = await createRes.json().catch(() => ({}))
              setStatus('error')
              setMessage(`Payment was processed (${verifyData.order_id}) but booking creation failed. ${err.error || 'Please contact support.'}`)
            }
          } else if (bookingId && service === 'package') {
            // Non-adventure flow: booking already exists, update payment status
            let userId = localStorage.getItem('dt_user_id')

            // If userId not in localStorage, try to fetch booking to find it
            if (!userId) {
              try {
                const bookingRes = await fetch(`/api/package-bookings/${bookingId}`)
                if (bookingRes.ok) {
                  const bookingData = await bookingRes.json()
                  userId = bookingData.user?.id || bookingData.userId
                  if (userId) localStorage.setItem('dt_user_id', userId)
                }
              } catch {
                // fall through
              }
            }

            if (!userId) {
              setStatus('error')
              setMessage('Session expired. Payment was received but could not be linked. Please contact support with reference: ' + verifyData.order_id)
              return
            }

            const updateRes = await fetch(`/api/package-bookings/${bookingId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'x-user-id': userId,
              },
              body: JSON.stringify({
                paymentId: verifyData.payment_id,
                paymentOrderId: verifyData.order_id,
                paymentStatus: 'completed',
                paymentAmount: verifyData.amount,
                paymentCompletedAt: new Date().toISOString(),
              }),
            })

            if (updateRes.ok) {
              localStorage.removeItem('dt_payment_id')
              localStorage.removeItem('dt_booking_id')
              localStorage.removeItem('dt_service')
              setStatus('success')
              setMessage(`Payment successful! Booking confirmed. Reference: ${verifyData.order_id}`)
            } else {
              const err = await updateRes.json().catch(() => ({}))
              // Try creating Payment record directly even if booking update failed
              if (userId && verifyData.amount) {
                try {
                  await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                    body: JSON.stringify({
                      pkgBookingId: bookingId,
                      amount: verifyData.amount,
                      transactionId: verifyData.payment_id,
                      status: 'completed',
                      method: 'online',
                    }),
                  })
                } catch {}
              }
              setStatus('error')
              setMessage(`Payment received (${verifyData.order_id}) but status update failed. ${err.error || 'Contact support.'}`)
            }
          } else {
            setStatus('success')
            setMessage(`Payment successful! Reference: ${verifyData.order_id}`)
          }
        } else {
          setStatus('error')
          setMessage('Payment was not completed. Please try again.')
        }
      } catch (err) {
        console.error('Payment return error:', err)
        setStatus('error')
        setMessage('Something went wrong. Please contact support.')
      }
    }

    processPayment()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-brand-orange mx-auto mb-4 animate-spin" />
            <h2 className="font-serif text-2xl text-brand-dark mb-2">Processing Payment</h2>
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-brand-dark mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => { localStorage.setItem('dt_redirect', 'user-dashboard'); window.location.href = '/' }}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl px-6 py-3 font-semibold"
            >
              Go to Dashboard
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-brand-dark mb-2">Payment Issue</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <button
              onClick={() => { localStorage.setItem('dt_redirect', 'user-dashboard'); window.location.href = '/' }}
              className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl px-6 py-3 font-semibold"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-brand-orange mx-auto mb-4 animate-spin" />
          <h2 className="font-serif text-2xl text-brand-dark mb-2">Loading...</h2>
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}
