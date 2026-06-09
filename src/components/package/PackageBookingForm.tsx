'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Route,
  Timer,
  Waves,
  Clock,
  Minus,
  Plus,
  Calendar,
  Phone,
  User,
  MessageSquare,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useState } from 'react'

interface PackageData {
  id: string
  name: string
  subtitle: string
  price: number
  category: string
  distance: string
  duration: string
  image: string
  timings: string
  rapidsLevel: string
}

const SUBOPTION_MAP: Record<string, string> = {
  brahmpuri: 'Brahmpuri 9km',
  shivpuri: 'Shivpuri 16km',
  'marine drive': 'Marine Drive 26km',
  'valley of flowers': 'Valley of Flowers',
  'nag tibba': 'Nag Tibba',
  kedarkantha: 'Kedarkantha',
  'har ki dun': 'Har Ki Dun',
  sedan: 'Sedan',
  suv: 'SUV',
  'tempo traveller': 'Tempo Traveller',
  bus: 'Bus',
  hunter: 'Hunter 350',
  activa: 'Activa',
  splendor: 'Splendor',
  'royal enfield': 'Royal Enfield',
  'access 125': 'Access 125',
  rishikesh: 'Rishikesh Tour',
  haridwar: 'Haridwar Tour',
  mussoorie: 'Mussoorie Tour',
  nainital: 'Nainital Tour',
  'hill stations': 'Hill Stations',
  'char dham': 'Char Dham',
}

function getSubOptionFromName(name: string): string | undefined {
  const lower = name.toLowerCase()
  for (const [key, sub] of Object.entries(SUBOPTION_MAP)) {
    if (lower.includes(key)) return sub
  }
  return undefined
}

export function PackageBookingForm() {
  const { selectedPackageId, navigate, isAuthenticated, user } = useAppStore()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    fullName: user?.name || '',
    mobile: user?.phone || '',
    numberOfPeople: 1,
    preferredDate: '',
    preferredTime: 'No preference',
    additionalNotes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package-booking', selectedPackageId],
    queryFn: async () => {
      const res = await fetch(`/api/packages/${selectedPackageId}`)
      if (!res.ok) throw new Error('Package not found')
      return res.json() as Promise<PackageData>
    },
    enabled: !!selectedPackageId,
  })

  const { data: effectivePrice } = useQuery({
    queryKey: ['effective-price', selectedPackageId, pkg?.category],
    queryFn: async () => {
      if (!pkg) return null
      const service = pkg.category || ''
      const res = await fetch(`/api/public/availability?service=${service}`)
      const data = await res.json()
      const records = data.records || []
      const subOption = getSubOptionFromName(pkg.name)
      const match = records.find((r: any) => {
        if (r.allDay) return true
        return (r.subOptions || []).includes(subOption)
      })
      return match?.price ?? pkg.price
    },
    enabled: !!pkg,
  })

  const displayPrice = effectivePrice ?? pkg?.price ?? 0

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-brand-orange" />
          </div>
          <h2 className="font-serif text-2xl text-brand-dark mb-2">Login Required</h2>
          <p className="text-muted-foreground text-sm mb-6">
            You need to login or create an account before booking a rafting package.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => navigate('landing')}
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-11"
            >
              Go to Login
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('rafting-packages')}
              className="w-full h-11"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Packages
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const handlePeopleChange = (delta: number) => {
    const newVal = Math.max(1, Math.min(20, form.numberOfPeople + delta))
    setForm({ ...form, numberOfPeople: newVal })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.fullName.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!form.mobile.trim() || form.mobile.length < 10) {
      toast.error('Please enter a valid mobile number')
      return
    }
    if (!form.preferredDate) {
      toast.error('Please select a preferred date')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/package-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          packageId: selectedPackageId,
          fullName: form.fullName,
          mobile: form.mobile,
          numberOfPeople: form.numberOfPeople,
          preferredDate: form.preferredDate,
          preferredTime: form.preferredTime,
          additionalNotes: form.additionalNotes,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create booking')
        return
      }

      const booking = await res.json()
      toast.success('Booking enquiry sent successfully! Our team will confirm your trip shortly.')
      queryClient.invalidateQueries({ queryKey: ['user-package-bookings'] })
      navigate('booking-success', null, selectedPackageId)
    } catch {
      toast.error('Failed to submit booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || !pkg) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  const totalPrice = displayPrice * form.numberOfPeople
  const timeSlots = [
    'No preference',
    'Early Morning (7-8 AM)',
    'Morning (8-10 AM)',
    'Late Morning (10-12 PM)',
    'Afternoon (12-2 PM)',
    'Late Afternoon (2-4 PM)',
  ]

  return (
    <div className="min-h-screen bg-brand-cream">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="text-brand-dark hover:text-brand-orange mb-4"
          onClick={() => navigate('package-detail', null, selectedPackageId)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Package Details
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative h-40 sm:h-48">
            <img
              src={pkg.image}
              alt={pkg.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/30 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <h1 className="text-white font-bold text-xl sm:text-2xl">{pkg.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/70 text-sm">{pkg.duration}</span>
                <span className="text-white/40">|</span>
                <span className="text-white/70 text-sm">{pkg.distance}</span>
              </div>
            </div>
            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-brand-teal text-white rounded-xl px-3.5 py-2 shadow-lg">
              <div className="font-bold text-lg leading-none">₹{displayPrice}</div>
              <div className="text-white/70 text-[10px] mt-0.5">/ person</div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-brand-dark mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="text-sm font-medium text-brand-dark mb-1.5 block">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/[^\d+]/g, '') })}
                  className="pl-10 h-11 rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Number of People */}
            <div>
              <label className="text-sm font-medium text-brand-dark mb-1.5 block">No. of People</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handlePeopleChange(-1)}
                  className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-semibold text-brand-dark">{form.numberOfPeople}</span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {form.numberOfPeople === 1 ? 'person' : 'people'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePeopleChange(1)}
                  className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preferred Date */}
            <div>
              <label className="text-sm font-medium text-brand-dark mb-1.5 block">Preferred Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  className="pl-10 h-11 rounded-xl"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Preferred Time */}
            <div>
              <label className="text-sm font-medium text-brand-dark mb-1.5 block">
                Preferred Time <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <select
                value={form.preferredTime}
                onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="text-sm font-medium text-brand-dark mb-1.5 block">
                Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  placeholder="Any special requests..."
                  value={form.additionalNotes}
                  onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                  className="pl-10 rounded-xl min-h-[80px] resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-brand-cream/70 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">₹{displayPrice} × {form.numberOfPeople} {form.numberOfPeople === 1 ? 'person' : 'people'}</span>
                <span className="text-brand-dark font-medium">₹{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>Booking goes to pending — admin will confirm</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                <span>Total</span>
                <span className="text-brand-orange">₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('package-detail', null, selectedPackageId)}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-brand-teal hover:bg-brand-teal/90 text-white h-11 rounded-xl font-semibold"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    Send Enquiry
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
