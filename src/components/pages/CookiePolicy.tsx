'use client'

import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Cookie, ArrowLeft, CheckCircle2, ShieldCheck, Settings, Info } from 'lucide-react'

export function CookiePolicy() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <button
          onClick={() => navigate('landing')}
          className="flex items-center gap-2 text-muted-foreground hover:text-brand-orange mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center mx-auto mb-6 shadow-md shadow-brand-orange/20">
            <Cookie className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-dark mb-4 font-bold">Cookie Policy</h1>
          <div className="w-20 h-1 bg-brand-orange mx-auto mb-4 rounded-full" />
          <p className="text-muted-foreground text-sm">Last updated: August 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10 space-y-8 text-sm leading-relaxed text-gray-600">
          <section>
            <div className="flex items-center gap-2.5 mb-3 text-brand-dark font-semibold text-xl">
              <Info className="w-5 h-5 text-brand-orange shrink-0" />
              <h2>1. What Are Cookies?</h2>
            </div>
            <p>
              Cookies are small text files that are placed on your computer, tablet, or mobile device when you visit our website. They are widely used to make websites work efficiently, provide personalized experiences, protect your account, and deliver reporting information.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-2.5 mb-3 text-brand-dark font-semibold text-xl">
              <ShieldCheck className="w-5 h-5 text-brand-teal shrink-0" />
              <h2>2. Types of Cookies We Use</h2>
            </div>
            <div className="space-y-4 mt-3">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Essential & Functional Cookies (Strictly Necessary)
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  These cookies are vital for the core functionality of Divine Travels. They enable secure login sessions, booking carts, transaction security, and navigation state. Without these cookies, services like booking packages and accessing your user dashboard cannot function.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Performance & Analytics Cookies
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  These cookies collect anonymous aggregate information about how travelers use our website (e.g., most popular tour packages, error logs, and loading speed). This helps us improve our website performance and booking speed.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                  Preference & Experience Cookies
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  These cookies remember your preferences such as selected destinations, currency options, coupon codes, and wishlist items to offer a personalized booking journey.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2.5 mb-3 text-brand-dark font-semibold text-xl">
              <Settings className="w-5 h-5 text-brand-orange shrink-0" />
              <h2>3. How You Can Manage Cookies</h2>
            </div>
            <p>
              You have the right to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2 text-gray-600">
              <li><strong>Google Chrome:</strong> Settings &gt; Privacy and Security &gt; Cookies and other site data</li>
              <li><strong>Mozilla Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies and Site Data</li>
              <li><strong>Apple Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
              <li><strong>Microsoft Edge:</strong> Settings &gt; Cookies and site permissions &gt; Manage and delete cookies</li>
            </ul>
            <p className="mt-3 text-xs sm:text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
              Note: If you choose to block essential cookies, certain features of Divine Travels (such as cart storage, instant booking, and authentication) may not operate correctly.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-3 font-semibold">4. Third-Party Cookies</h2>
            <p>
              In some instances, we may use trusted third-party services (such as secure payment gateways like UPI/Razorpay/KwikUPI and map integrations) that may set their own cookies to ensure secure transactions and interactive maps.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-brand-dark mb-3 font-semibold">5. Policy Updates &amp; Contact</h2>
            <p>
              We may update this Cookie Policy from time to time to reflect changes in our technology or legal requirements. Any updates will be posted on this page with an updated revision date.
            </p>
            <p className="mt-3">
              If you have any questions regarding our cookie practices, feel free to reach out to us at{' '}
              <a href="mailto:info@divinetravels.in" className="text-brand-orange font-medium hover:underline">
                info@divinetravels.in
              </a>{' '}
              or call{' '}
              <a href="tel:+916396919007" className="text-brand-orange font-medium hover:underline">
                +91 63969 19007
              </a>.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  )
}
