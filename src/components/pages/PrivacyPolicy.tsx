'use client'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Shield, ArrowLeft } from 'lucide-react'

export function PrivacyPolicy() {
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
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-dark mb-4">Privacy Policy</h1>
          <div className="w-20 h-1 bg-brand-orange mx-auto mb-4" />
          <p className="text-muted-foreground">Last updated: June 2026</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">1. Information We Collect</h2>
            <p>When you use Divine Travels services, we collect information you provide directly: your name, email address, phone number, billing details, and travel preferences. We also collect information automatically through cookies and similar technologies, including your IP address, browser type, and usage patterns.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Process your bookings and payments</li>
              <li>Send booking confirmations and travel updates</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Improve our services and personalize your experience</li>
              <li>Send promotional offers (only with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">3. Information Sharing</h2>
            <p>We do not sell your personal information. We may share your data with trusted third-party service providers who help us deliver our services (payment processors, accommodation providers, transportation partners). These partners are contractually bound to protect your data.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">4. Data Security</h2>
            <p>We implement industry-standard security measures including SSL encryption, secure servers, and regular security audits. However, no method of transmission over the Internet is 100% secure. We strive to protect your data but cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. You may also withdraw consent for marketing communications. To exercise these rights, contact us at info@divinetravels.in.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">6. Cookies</h2>
            <p>We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings. Disabling cookies may affect certain features of our website.</p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-4">7. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:info@divinetravels.in" className="text-brand-orange hover:underline">info@divinetravels.in</a> or call <a href="tel:+916396919007" className="text-brand-orange hover:underline">+91 63969 19007</a>.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
