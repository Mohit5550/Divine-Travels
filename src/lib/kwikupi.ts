const BASE_URL = 'https://kwikupi.com/api'

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-API-KEY': process.env.KWIKUPI_API_KEY || '',
    'X-API-SECRET': process.env.KWIKUPI_API_SECRET || '',
  }
}

export function generateOrderId(): string {
  return `DT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}


export async function createPayment({
  amount,
  order_id,
  customer_name,
  customer_email,
  redirect_url,
}: {
  amount: number
  order_id: string
  customer_name?: string
  customer_email?: string
  redirect_url?: string
}) {
  const res = await fetch(`${BASE_URL}/create-payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      amount,
      order_id,
      customer_name,
      customer_email,
      redirect_url,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Payment creation failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  return res.json() as Promise<{ payment_id: string; payment_page: string }>
}

export async function checkPaymentStatus(paymentId: string) {
  const res = await fetch(`${BASE_URL}/payment-status/${paymentId}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!res.ok) {
    throw new Error(`Failed to check payment status: HTTP ${res.status}`)
  }

  return res.json() as Promise<{
    payment_id: string
    order_id: string
    status: string
    amount: number
    created_at: string
  }>
}
