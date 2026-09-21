'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const COUNTRIES = [
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳', digits: 10 },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸', digits: 10 },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧', digits: 10 },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪', digits: 9 },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦', digits: 9 },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵', digits: 10 },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰', digits: 9 },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩', digits: 10 },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰', digits: 10 },
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺', digits: 9 },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦', digits: 10 },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪', digits: 11 },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷', digits: 9 },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬', digits: 8 },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾', digits: 9 },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭', digits: 9 },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩', digits: 10 },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵', digits: 10 },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳', digits: 11 },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿', digits: 8 },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦', digits: 9 },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷', digits: 11 },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
  defaultCountry?: string
}

export function PhoneInput({
  value,
  onChange,
  placeholder = 'Enter phone number',
  required = false,
  className = '',
  defaultCountry = 'IN',
}: PhoneInputProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(() => COUNTRIES.find((c) => c.code === defaultCountry) || COUNTRIES[0])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus()
  }, [open])

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  )

  const handleCountrySelect = (country: typeof COUNTRIES[0]) => {
    setSelected(country)
    setOpen(false)
    setSearch('')
    const digits = value.startsWith(selected.dial) ? value.slice(selected.dial.length) : value.replace(/^\+\d{1,4}/, '')
    onChange(country.dial + digits)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '')
    if (raw.length <= selected.digits) {
      onChange(selected.dial + raw)
    }
  }

  const numberOnly = value.startsWith(selected.dial) ? value.slice(selected.dial.length) : value.replace(/^\+\d{1,4}/, '')

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Country Selector */}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 h-full px-2.5 py-0 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl hover:bg-gray-100 transition-colors cursor-pointer text-sm min-w-[72px] justify-center"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="text-xs font-medium text-gray-600">{selected.dial}</span>
          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 z-50 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country..."
                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-brand-cream/60 transition-colors cursor-pointer ${
                    c.code === selected.code ? 'bg-brand-orange/5' : ''
                  }`}
                >
                  <span className="text-lg">{c.flag}</span>
                  <span className="flex-1 text-left">
                    <span className="font-medium text-gray-800">{c.name}</span>
                    <span className="text-gray-400 ml-1.5">{c.dial}</span>
                  </span>
                  {c.code === selected.code && <Check className="w-3.5 h-3.5 text-brand-orange" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">No country found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Phone Number Input */}
      <input
        type="tel"
        value={numberOnly}
        onChange={handleNumberChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 h-[42px] px-3 py-2.5 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange cursor-text"
      />
    </div>
  )
}

export function getCountryByCode(code: string) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0]
}

export function getPhoneDigits(countryCode: string): number {
  return getCountryByCode(countryCode).digits
}
