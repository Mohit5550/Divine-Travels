'use client'

import { useState, useEffect } from 'react'
import { Cookie, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COOKIE_KEY = 'divine-travels-cookie-consent'

export function getCookieConsent(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(COOKIE_KEY)
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = getCookieConsent()
    if (!consent) setVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted')
    setVisible(false)
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_KEY, 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Cookie className="w-6 h-6 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-1">We use cookies</p>
            <p className="text-xs text-gray-500 leading-relaxed">
              We use cookies to improve your experience, remember your preferences, and provide personalized content.
              By continuing, you agree to our cookie policy.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            className="text-xs text-gray-500 border-gray-300"
          >
            Reject
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs"
          >
            Accept All
          </Button>
          <button
            onClick={handleAccept}
            className="ml-1 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
