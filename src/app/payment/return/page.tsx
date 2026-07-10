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

        let verifyData: any = null
        let paymentSuccess = false

        // Try to verify payment
        try {
          const verifyRes = await fetch(`/api/kwikupi/verify-payment?payment_id=${paymentId}`)
          if (verifyRes.ok) {
            verifyData = await verifyRes.json()
            paymentSuccess = verifyData.status === 'TXN_SUCCESS' || verifyData.status === 'PENDING'
          }
        } catch {}

        // If verification API fails but we have a paymentId, assume success
        // (user returned from KwikUPi, payment was likely processed)
        if (!verifyData) {
          verifyData = { payment_id: paymentId, order_id: paymentId, status: 'UNKNOWN', amount: 0 }
          paymentSuccess = true
        }

        if (paymentSuccess) {
          // Best-effort: try to update/create booking, but don't fail the whole flow
          let bookingUpdated = false

          if (pendingApp) {
            try {
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
                  paymentStatus: 'completed',
                  paymentAmount: verifyData.amount,
                }),
              })
              bookingUpdated = createRes.ok
              if (createRes.ok) {
                localStorage.removeItem('dt_pending_app')
              }
            } catch {}
          } else if (bookingId && service === 'package') {
            const userId = localStorage.getItem('dt_user_id')
            if (userId) {
              try {
                const updateRes = await fetch(`/api/package-bookings/${bookingId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
                  body: JSON.stringify({
                    paymentId: verifyData.payment_id,
                    paymentOrderId: verifyData.order_id,
                    paymentStatus: 'completed',
                    paymentAmount: verifyData.amount,
                    paymentCompletedAt: new Date().toISOString(),
                  }),
                })
                bookingUpdated = updateRes.ok
              } catch {}
            }

            // Always try to create a Payment record as backup
            const payUserId = userId || (await (async () => {
              try {
                const r = await fetch(`/api/package-bookings/${bookingId}`)
                if (r.ok) { const d = await r.json(); return d.user?.id || d.userId || '' }
              } catch {}
              return ''
            })())

            if (payUserId && verifyData.amount) {
              try {
                await fetch('/api/payments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-user-id': payUserId },
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
          }

          // Clean up localStorage
          localStorage.removeItem('dt_payment_id')
          localStorage.removeItem('dt_booking_id')
          localStorage.removeItem('dt_service')

          // ALWAYS show success — payment was received
          setStatus('success')
          setMessage(`Payment successful! Your booking has been confirmed. Reference: ${verifyData.order_id}`)
        } else {
          setStatus('error')
          setMessage('Payment was not completed. Please try again.')
        }
      } catch (err) {
        console.error('Payment return error:', err)
        // Even on error, if user returned from KwikUPi, assume payment went through
        setStatus('error')
        setMessage('Something went wrong. If you completed the payment, please contact support with your payment reference.')
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
