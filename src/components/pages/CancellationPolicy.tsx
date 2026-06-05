'use client'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { XCircle, ArrowLeft } from 'lucide-react'

export function CancellationPolicy() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-muted-foreground hover:text-brand-orange mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-dark mb-4">Cancellation Policy</h1>
          <div className="w-20 h-1 bg-brand-orange mx-auto mb-4" />
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">General Cancellation Policy</h2>
            <p>Our cancellation policy varies by service type. Below is a comprehensive guide to help you understand your options. All cancellation requests must be submitted in writing via email or through our contact form.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">Tour Packages (Domestic & Spiritual)</h2>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand-cream">
                    <th className="text-left py-2 px-3 border border-border font-medium">Time Before Departure</th>
                    <th className="text-left py-2 px-3 border border-border font-medium">Refund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="py-2 px-3 border border-border">30+ days</td><td className="py-2 px-3 border border-border">90% refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">15-29 days</td><td className="py-2 px-3 border border-border">75% refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">7-14 days</td><td className="py-2 px-3 border border-border">50% refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">3-6 days</td><td className="py-2 px-3 border border-border">25% refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">Less than 48 hours</td><td className="py-2 px-3 border border-border">No refund</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">Adventure Activities</h2>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand-cream">
                    <th className="text-left py-2 px-3 border border-border font-medium">Time Before Activity</th>
                    <th className="text-left py-2 px-3 border border-border font-medium">Refund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="py-2 px-3 border border-border">24+ hours</td><td className="py-2 px-3 border border-border">100% refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">12-24 hours</td><td className="py-2 px-3 border border-border">50% refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">Less than 12 hours</td><td className="py-2 px-3 border border-border">No refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">Weather/Operator cancellation</td><td className="py-2 px-3 border border-border">100% refund or reschedule</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">Rental Services (Bikes & Taxis)</h2>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-brand-cream">
                    <th className="text-left py-2 px-3 border border-border font-medium">Time Before Pickup</th>
                    <th className="text-left py-2 px-3 border border-border font-medium">Refund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="py-2 px-3 border border-border">24+ hours</td><td className="py-2 px-3 border border-border">100% refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">12-24 hours</td><td className="py-2 px-3 border border-border">50% refund</td></tr>
                  <tr><td className="py-2 px-3 border border-border">Less than 12 hours</td><td className="py-2 px-3 border border-border">No refund</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">How to Cancel</h2>
            <p>To cancel a booking:</p>
            <ol className="list-decimal pl-6 mt-2 space-y-1">
              <li>Email us at <a href="mailto:info@divinetravels.in" className="text-brand-orange hover:underline">info@divinetravels.in</a> with your booking reference</li>
              <li>Call or WhatsApp <a href="tel:+916396919007" className="text-brand-orange hover:underline">+91 63969 19007</a></li>
              <li>Include your name, booking ID, and reason for cancellation</li>
            </ol>
            <p className="mt-3">We will acknowledge your cancellation request within 24 hours and process your refund according to the applicable policy above.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
