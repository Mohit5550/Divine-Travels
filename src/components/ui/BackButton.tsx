'use client'

import { useAppStore } from '@/lib/store'
import { ArrowLeft } from 'lucide-react'

export function BackButton({ className = '' }: { className?: string }) {
  const { goBack, currentView } = useAppStore()

  if (currentView === 'landing') return null

  return (
    <button
      onClick={goBack}
      className={`inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-orange transition-colors group ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      Back
    </button>
  )
}
