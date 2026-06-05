'use client'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { FileText, ArrowLeft } from 'lucide-react'

export function TermsOfService() {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-dark mb-4">Terms & Conditions</h1>
          <div className="w-20 h-1 bg-brand-orange mx-auto mb-4" />
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">1. Booking & Confirmation</h2>
            <p>By booking any service through Divine Travels, you agree to these terms. A booking is confirmed only after you receive a confirmation email with your booking reference number. It is your responsibility to verify all details in the confirmation.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">2. Payment Terms</h2>
            <p>Full payment is required at the time of booking unless otherwise specified. Prices are in Indian Rupees (INR) and include applicable taxes unless stated otherwise. We accept payments via credit/debit cards, UPI, net banking, and bank transfers.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">3. Participant Responsibilities</h2>
            <p>You must provide accurate information about your health, fitness level, and any medical conditions that may affect your participation in activities. For adventure activities, you may be required to sign a waiver form. Failure to disclose relevant health information may result in refusal of service without refund.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">4. Activity Risks</h2>
            <p>Adventure activities including rafting, bungee jumping, trekking, and paragliding carry inherent risks. By booking these activities, you acknowledge and accept these risks. Divine Travels follows all safety protocols but cannot be held liable for accidents, injuries, or loss of property during activities.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">5. Force Majeure</h2>
            <p>We are not liable for delays, cancellations, or changes caused by events beyond our control including but not limited to: natural disasters, weather conditions, government restrictions, strikes, or civil unrest. In such cases, we will make reasonable efforts to reschedule or offer alternatives.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">6. Conduct</h2>
            <p>We reserve the right to refuse service or terminate any booking if a participant engages in disruptive, dangerous, or illegal behavior. No refund will be provided in such cases.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">7. Contact</h2>
            <p>For questions about these terms, contact <a href="mailto:info@divinetravels.in" className="text-brand-orange hover:underline">info@divinetravels.in</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
