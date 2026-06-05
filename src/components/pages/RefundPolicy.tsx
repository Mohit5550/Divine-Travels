'use client'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { RotateCcw, ArrowLeft } from 'lucide-react'

export function RefundPolicy() {
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
            <RotateCcw className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-dark mb-4">Refund & Return Policy</h1>
          <div className="w-20 h-1 bg-brand-orange mx-auto mb-4" />
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">1. Cancellation by Customer</h2>
            <p>You may cancel your booking subject to the following refund structure:</p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>15+ days before travel:</strong> 100% refund (minus processing fees)</li>
              <li><strong>7-14 days before travel:</strong> 50% refund</li>
              <li><strong>3-6 days before travel:</strong> 25% refund</li>
              <li><strong>Less than 48 hours:</strong> No refund</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">2. Cancellation by Divine Travels</h2>
            <p>In the rare event that we need to cancel a trip due to insufficient bookings, safety concerns, or operational issues, you will receive a full refund or the option to reschedule at no additional cost. We will notify you as early as possible.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">3. Adventure Activity Refunds</h2>
            <p>For adventure activities (rafting, bungee, paragliding, etc.), cancellations made 24+ hours before the scheduled time receive a 100% refund. Cancellations between 12-24 hours receive 50% refund. Less than 12 hours or no-shows receive no refund. If weather or river conditions force cancellation by the operator, a full refund or rescheduling is provided.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">4. Rental Refunds (Bikes/Taxis)</h2>
            <p>Rental cancellations made 24+ hours before pickup receive a 100% refund. 50% refund for cancellations between 12-24 hours. No refund for cancellations within 12 hours of pickup.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">5. Refund Processing Time</h2>
            <p>Refunds are processed within 5-10 business days after cancellation confirmation. The amount will be credited to your original payment method. International transactions may take longer depending on your bank.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">6. How to Request a Refund</h2>
            <p>To request a cancellation and refund, email us at <a href="mailto:info@divinetravels.in" className="text-brand-orange hover:underline">info@divinetravels.in</a> with your booking reference number, or call <a href="tel:+916396919007" className="text-brand-orange hover:underline">+91 63969 19007</a>. We aim to respond within 24 hours.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
