import nodemailer from 'nodemailer'

function createTransport() {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587')

  if (host) {
    return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } })
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

const transporter = createTransport()

const FROM = process.env.SMTP_FROM || 'Divine Travels <noreply@divinetravels.in>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://divinetravels.in'

export async function sendPasswordResetEmail(to: string, code: string, token: string) {
  const resetLink = `${BASE_URL}/reset-password?token=${token}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Divine Travels</h1>
        <p style="color: #e67e22; font-weight: 600; margin: 4px 0 0;">Password Reset</p>
      </div>
      <div style="background: white; border-radius: 8px; padding: 24px;">
        <p style="color: #555; font-size: 15px; line-height: 1.6;">We received a request to reset your password. Use the code below or click the link to proceed.</p>
        <div style="text-align: center; margin: 24px 0;">
          <div style="background: #fef3e2; border-radius: 8px; padding: 16px; display: inline-block;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #e67e22;">${code}</span>
          </div>
        </div>
        <a href="${resetLink}" style="display: block; text-align: center; background: #e67e22; color: white; text-decoration: none; padding: 14px; border-radius: 8px; font-weight: 600; font-size: 16px;">Reset Password</a>
        <p style="color: #999; font-size: 13px; margin-top: 20px;">This code expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reset Your Divine Travels Password',
    html,
  })
}

export async function sendBookingConfirmationEmail(to: string, booking: {
  id: string
  packageName: string
  date: string
  people: number
  totalPrice: number
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #1a1a2e; font-size: 24px; margin: 0;">Divine Travels</h1>
        <p style="color: #27ae60; font-weight: 600; margin: 4px 0 0;">Booking Confirmed</p>
      </div>
      <div style="background: white; border-radius: 8px; padding: 24px;">
        <p style="color: #555; font-size: 15px; line-height: 1.6;">Your booking has been confirmed! Here are the details:</p>
        <div style="background: #f0fdf4; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0; color: #555;"><strong>Booking ID:</strong> ${booking.id.slice(0, 8).toUpperCase()}</p>
          <p style="margin: 4px 0; color: #555;"><strong>Package:</strong> ${booking.packageName}</p>
          <p style="margin: 4px 0; color: #555;"><strong>Date:</strong> ${booking.date}</p>
          <p style="margin: 4px 0; color: #555;"><strong>People:</strong> ${booking.people}</p>
          <p style="margin: 4px 0; color: #555;"><strong>Total:</strong> ₹${booking.totalPrice.toLocaleString()}</p>
        </div>
        <p style="color: #555; font-size: 15px; line-height: 1.6;">We'll contact you shortly with further details. For any queries, reply to this email or call us.</p>
        <p style="color: #999; font-size: 13px; margin-top: 20px;">Thank you for choosing Divine Travels!</p>
      </div>
    </div>
  `

  await transporter.sendMail({
    from: FROM,
    to,
    subject: `Booking Confirmed - ${booking.packageName} | Divine Travels`,
    html,
  })
}
