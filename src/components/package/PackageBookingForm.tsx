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
  MapPin,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useState, useCallback, useEffect } from 'react'
import { LoginModal } from '@/components/landing/LoginModal'
import { BookingInquirySuccess } from '@/components/booking/BookingInquirySuccess'
import { computeHotelBreakdown, computeCampingBreakdown, nightsBetween, maxTierPax } from '@/lib/hotelBooking'
import { getAuthHeaders } from '@/lib/auth-client'
import { getSubOptionFromName } from '@/lib/subpackage-utils'

interface PackageData {
  id: string
  name: string
  subtitle: string
  price: number
  originalPrice: number | null
  category: string
  distance: string
  duration: string
  image: string
  timings: string
  rapidsLevel: string
  roomTypes?: string
  mealPlans?: string
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


export function PackageBookingForm() {
  const { selectedPackageId, navigate, goBack, isAuthenticated, user } = useAppStore()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    fullName: user?.name || '',
    mobile: user?.phone || '',
    emergencyContact: '',
    pickupLocation: '',
    numberOfPeople: 1,
    preferredDate: '',
    preferredTime: 'No preference',
    additionalNotes: '',
    safetyDeclared: false,
    whatsappConsent: true,
  })

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        mobile: prev.mobile || user.phone || '',
      }))
    }
  }, [user])
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState<{
    bookingId: string
    title: string
    typeLabel: string
    date?: string
    travelers?: number
    total?: number
  } | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPct: number; discountAmount: number } | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  // Hotel / Camping specific fields
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(2)
  const [childrenCount, setChildrenCount] = useState(0)
  const [roomTypeName, setRoomTypeName] = useState('')
  const [mealPlanName, setMealPlanName] = useState('')
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) setLoginOpen(true)
  }, [isAuthenticated])

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package-booking', selectedPackageId],
    queryFn: async () => {
      const res = await fetch(`/api/packages/${selectedPackageId}`)
      if (!res.ok) throw new Error('Package not found')
      return res.json() as Promise<PackageData>
    },
    enabled: !!selectedPackageId,
  })

  const isStay = pkg?.category === 'stay-hotel' || pkg?.category === 'stay-camping'
  const isCamping = pkg?.category === 'stay-camping'
  const roomTypes = pkg ? (() => { try { return JSON.parse(pkg.roomTypes || '[]') } catch { return [] } })() : []
  const mealPlans = pkg ? (() => { try { return JSON.parse(pkg.mealPlans || '[]') } catch { return [] } })() : []

  const selRoom = roomTypes.find((r: any) => r.name === roomTypeName) || roomTypes[0] || null
  const selMeal = mealPlanName ? (mealPlans.find((m: any) => m.name === mealPlanName) || null) : null
  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0

  // Per-room capacity (max persons per room). Falls back to base + 2 if not set.
  const roomCapacity = selRoom?.guests ? Number(selRoom.guests) : ((selRoom?.baseOccupancy || 2) + 2)
  const maxPersons = roomCapacity * rooms

  // Admin-defined per-room adult/child limits (set per room type).
  const roomMaxAdults = selRoom?.maxAdults ? Number(selRoom.maxAdults) : null
  const roomMaxChildren = selRoom?.maxChildren ? Number(selRoom.maxChildren) : null
  const hasAdultCap = roomMaxAdults != null
  const hasChildCap = roomMaxChildren != null
  const adultHardCap = hasAdultCap ? Math.min(roomMaxAdults * rooms, maxPersons) : maxPersons
  const childHardCap = hasChildCap ? roomMaxChildren * rooms : maxPersons

  // Camping: biggest group one camp allows (from tiers, else room capacity).
  // Extra people automatically spill into more camps — pax is never clamped.
  const campPerCampCap = isCamping && selRoom ? maxTierPax(selRoom, roomCapacity) : roomCapacity
  const campingHeadCap = campPerCampCap * 10

  // Auto-select the first room type once loaded, and clamp guests when capacity shrinks.
  useEffect(() => {
    if (!isStay) return
    if (roomTypes.length > 0 && !roomTypeName) {
      setRoomTypeName(roomTypes[0].name)
    }
    if (isCamping && selRoom) {
      // Camping overflow: grow camps instead of cutting people.
      const head = adults + childrenCount
      const needed = Math.min(10, Math.max(1, Math.ceil(head / campPerCampCap)))
      if (needed > rooms) setRooms(needed)
      if (adults < 1) setAdults(1)
      if (childrenCount < 0) setChildrenCount(0)
      return
    }
    let newAdults = adults
    let newChildren = childrenCount
    if (newAdults > adultHardCap) newAdults = adultHardCap
    if (newAdults < 1) newAdults = 1
    const childMax = Math.min(childHardCap, Math.max(0, maxPersons - newAdults))
    if (newChildren > childMax) newChildren = childMax
    if (newChildren < 0) newChildren = 0
    if (newAdults !== adults) setAdults(newAdults)
    if (newChildren !== childrenCount) setChildrenCount(newChildren)
  }, [isStay, isCamping, roomTypes, roomTypeName, rooms, roomCapacity, adults, childrenCount, maxPersons, adultHardCap, childHardCap])

  const hotelBreakdown = isStay && !isCamping && selRoom && nights > 0
    ? computeHotelBreakdown(selRoom, selMeal, {
        checkIn,
        checkOut,
        nights,
        rooms,
        adults,
        children: childrenCount,
        discount: appliedCoupon?.discountAmount || 0,
      })
    : null
  const hotelTotal = hotelBreakdown?.total || 0

  // Camping uses group-size tiered pricing (per-person rate drops as the
  // per-camp headcount rises). The rate is resolved from the selected camp
  // type's `pricingTiers` for the actual headcount — never from a flat price.
  const campingBreakdown = isCamping && selRoom && nights > 0
    ? computeCampingBreakdown(selRoom, selMeal, {
        checkIn,
        checkOut,
        nights,
        camps: rooms,
        adults,
        children: childrenCount,
        discount: appliedCoupon?.discountAmount || 0,
      })
    : null
  const campingTotal = campingBreakdown?.total || 0

  const selectedDate = form.preferredDate || new Date().toISOString().split('T')[0]

  const { data: effectivePrice } = useQuery({
    queryKey: ['effective-price', selectedPackageId, pkg?.category, selectedDate],
    queryFn: async () => {
      if (!pkg) return null
      const service = pkg.category || ''
      const res = await fetch(`/api/public/availability?service=${service}&date=${selectedDate}`)
      const data = await res.json()
      const records = data.records || []
      const subOption = getSubOptionFromName(pkg.name, SUBOPTION_MAP)
      const allDayMatch = records.find((r: any) => r.allDay)
      if (allDayMatch) return allDayMatch.price ?? pkg.price
      if (!subOption) return pkg.price
      const match = records.find((r: any) => {
        return (r.subOptions || []).includes(subOption)
      })
      return match?.price ?? pkg.price
    },
    enabled: !!pkg,
  })

  const displayPrice = effectivePrice ?? pkg?.price ?? 0

  // If not authenticated, show login modal
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
              You need to login or create an account before booking this package.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => setLoginOpen(true)}
                className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-11"
              >
                Login / Sign Up
              </Button>
              <Button
                variant="outline"
                onClick={() => goBack()}
                className="w-full h-11"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Details
              </Button>
            </div>
        </motion.div>
        <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    )
  }

  const handlePeopleChange = (delta: number) => {
    const newVal = Math.max(1, Math.min(20, form.numberOfPeople + delta))
    setForm({ ...form, numberOfPeople: newVal })
  }

  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return
    if (!pkg) return

    setValidatingCoupon(true)
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode.trim().toUpperCase()}`)
      const result = await res.json()

      if (!result.valid) {
        toast.error(result.error || 'Invalid coupon code')
        setAppliedCoupon(null)
        return
      }

      if (!pkg) return
      const baseTotal = (effectivePrice ?? pkg.price) * form.numberOfPeople
      let discount = Math.round(baseTotal * (result.discountPct / 100))
      if (result.maxDiscount && discount > result.maxDiscount) {
        discount = result.maxDiscount
      }

      setAppliedCoupon({ code: result.code, discountPct: result.discountPct, discountAmount: discount })
      toast.success(`Coupon applied! You save ₹${discount}`)
    } catch {
      toast.error('Failed to validate coupon')
    } finally {
      setValidatingCoupon(false)
    }
  }, [couponCode, pkg, effectivePrice, form.numberOfPeople])

  const isAdventure = pkg?.category === 'adventure'

  const handleProceedToPay = async () => {
    if (!form.fullName.trim() || !form.mobile.trim() || form.mobile.length < 10 || !form.preferredDate) {
      toast.error('Please fill all required fields')
      return
    }

    setSubmitting(true)
    try {
      const actualPrice = pkg?.originalPrice && pkg.originalPrice > pkg.price ? pkg.originalPrice : (pkg?.price || 0)
      const pricePerPerson = effectivePrice || actualPrice

      const formData = {
        packageId: selectedPackageId,
        fullName: form.fullName,
        mobile: form.mobile,
        numberOfPeople: form.numberOfPeople,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        additionalNotes: form.additionalNotes,
        couponCode: appliedCoupon?.code || '',
        pricePerPerson: pricePerPerson,
        userId: user?.id || '',
      }

      localStorage.setItem('dt_pending_app', JSON.stringify(formData))
      localStorage.setItem('dt_user_id', user?.id || '')

      const payRes = await fetch('/api/kwikupi/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), },
        body: JSON.stringify({
          customer_name: form.fullName,
          customer_email: user?.email,
          booking_id: 'pending',
          service: 'package',
          amount: pricePerPerson * (form.numberOfPeople || 1),
        }),
      })

      if (!payRes.ok) {
        const d = await payRes.json()
        toast.error(d.error || 'Failed to create payment')
        localStorage.removeItem('dt_pending_app')
        return
      }

      const payData = await payRes.json()
      localStorage.setItem('dt_payment_id', payData.payment_id)
      localStorage.setItem('dt_service', 'package')
      window.location.href = payData.payment_page
    } catch {
      toast.error('Failed to process payment')
      localStorage.removeItem('dt_pending_app')
    } finally {
      setSubmitting(false)
    }
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

    if (isStay) {
      if (!checkIn || !checkOut) {
        toast.error('Please select check-in and check-out dates')
        return
      }
      if (!roomTypeName || !selRoom) {
        toast.error('Please select a room type')
        return
      }
    } else if (!form.preferredDate) {
      toast.error('Please select a preferred date')
      return
    }

    const isAdv = pkg?.category === 'rafting' || pkg?.category === 'trekking' || pkg?.category === 'adventure'
    if (isAdv && !form.safetyDeclared) {
      toast.error('Please confirm the safety & fitness declaration')
      return
    }

    const additionalNotesPayload = isCamping && campingBreakdown
      ? JSON.stringify({ ...campingBreakdown, pickupLocation: form.pickupLocation || undefined, emergencyContact: form.emergencyContact || undefined, whatsappConsent: form.whatsappConsent, specialRequests: form.additionalNotes || undefined })
      : isStay && hotelBreakdown
      ? JSON.stringify({ ...hotelBreakdown, pickupLocation: form.pickupLocation || undefined, emergencyContact: form.emergencyContact || undefined, whatsappConsent: form.whatsappConsent, specialRequests: form.additionalNotes || undefined })
      : JSON.stringify({
          pickupLocation: form.pickupLocation || undefined,
          emergencyContact: form.emergencyContact || undefined,
          whatsappConsent: form.whatsappConsent,
          notes: form.additionalNotes || undefined,
        })

    setSubmitting(true)
    try {
      const res = await fetch('/api/package-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), },
        body: JSON.stringify({
          packageId: selectedPackageId,
          fullName: form.fullName,
          mobile: form.mobile,
          numberOfPeople: isStay ? adults + childrenCount : form.numberOfPeople,
          preferredDate: isStay ? checkIn : form.preferredDate,
          preferredTime: isStay ? null : form.preferredTime,
          additionalNotes: additionalNotesPayload,
          couponCode: appliedCoupon?.code || '',
          pricePerPerson: isCamping ? (campingBreakdown?.pricePerPerson || 0) : isStay ? hotelTotal : displayPrice,
          totalPrice: isStay ? (isCamping ? campingTotal : hotelTotal) : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create booking')
        return
      }

      const booking = await res.json()
      const total = isStay
        ? (booking.totalPrice || (isCamping ? campingTotal : hotelTotal))
        : ((effectivePrice || displayPrice) * (form.numberOfPeople || 1) - (appliedCoupon?.discountAmount || 0))
      setConfirmed({
        bookingId: booking.id,
        title: pkg?.name || 'Booking',
        typeLabel: isStay ? (isCamping ? 'Camping Booking' : 'Hotel Stay Booking') : 'Package Booking',
        date: isStay ? checkIn : form.preferredDate,
        travelers: isStay ? adults + childrenCount : form.numberOfPeople,
        total,
      })
      queryClient.invalidateQueries({ queryKey: ['user-package-bookings'] })
    } catch {
      toast.error('Failed to submit booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <BookingInquirySuccess
        bookingId={confirmed.bookingId}
        title={confirmed.title}
        typeLabel={confirmed.typeLabel}
        date={confirmed.date}
        travelers={confirmed.travelers}
        total={confirmed.total}
        advanceAmount={confirmed.total ? Math.ceil(confirmed.total * 0.1) : undefined}
        onGoDashboard={() => navigate('user-dashboard')}
      />
    )
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
          onClick={() => goBack()}
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
              <PhoneInput
                value={form.mobile}
                onChange={(val) => setForm({ ...form, mobile: val })}
                placeholder="Enter phone number"
                required
              />
            </div>

            {isStay ? (
              <>
                {/* Check-in / Check-out */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-brand-dark mb-1.5 block">Check-in Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="pl-10 h-11 rounded-xl"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-dark mb-1.5 block">Check-out Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="pl-10 h-11 rounded-xl"
                        min={checkIn || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                </div>

                {nights > 0 && (
                  <p className="text-xs text-muted-foreground -mt-2">{nights} night{nights > 1 ? 's' : ''} stay</p>
                )}

                {/* Rooms / Adults / Children */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-brand-dark mb-1.5 block">{isCamping ? 'Camps' : 'Rooms'}</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))} className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20">
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center"><span className="text-lg font-semibold text-brand-dark">{rooms}</span></div>
                      <button type="button" onClick={() => setRooms(Math.min(10, rooms + 1))} className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-dark mb-1.5 block">Adults</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20">
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center"><span className="text-lg font-semibold text-brand-dark">{adults}</span></div>
                      <button type="button" onClick={() => setAdults(isCamping ? Math.min(adults + 1, campingHeadCap) : Math.min(adults + 1, adultHardCap))} className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brand-dark mb-1.5 block">Children</label>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))} className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20">
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex-1 text-center"><span className="text-lg font-semibold text-brand-dark">{childrenCount}</span></div>
                      <button type="button" onClick={() => setChildrenCount(isCamping ? Math.min(childrenCount + 1, Math.max(0, campingHeadCap - adults)) : Math.min(childrenCount + 1, Math.min(childHardCap, maxPersons - adults)))} className="w-10 h-10 rounded-xl bg-brand-teal/10 text-brand-teal flex items-center justify-center hover:bg-brand-teal/20">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {selRoom && (
                  <p className="text-xs text-muted-foreground -mt-1">
                      {isCamping
                      ? `Max ${campPerCampCap} guests per camp — extra guests automatically move to another camp, each camp billed at its own group rate.`
                      : hasAdultCap || hasChildCap
                      ? `Limit per room: ${hasAdultCap ? `${roomMaxAdults} adults` : 'any adults'}${hasChildCap ? ` / ${roomMaxChildren} children` : ' / any children'}. Up to ${adultHardCap} adults / ${childHardCap} children for ${rooms} room${rooms > 1 ? 's' : ''}.`
                      : `Max ${roomCapacity} guests per room (${selRoom.baseOccupancy || 2} included · ₹${selRoom.extraAdultPrice || 0}/extra adult/night). Up to ${maxPersons} total for ${rooms} room${rooms > 1 ? 's' : ''}.`}
                  </p>
                )}

                {/* Room / Camp Type */}
                <div>
                  <label className="text-sm font-medium text-brand-dark mb-1.5 block">{isCamping ? 'Camp Type' : 'Room Type'}</label>
                  <select
                    value={roomTypeName}
                    onChange={(e) => setRoomTypeName(e.target.value)}
                    className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select room type</option>
                    {roomTypes.map((r: any, i: number) => (
                      <option key={i} value={r.name}>
                        {r.name} — {isCamping ? 'Group-size tiered pricing' : `₹${(r.price || 0).toLocaleString()}/night (base ${r.baseOccupancy || 2} pax)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Meal Plan */}
                {mealPlans.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-brand-dark mb-1.5 block">
                      Meal Plan <span className="text-muted-foreground font-normal">(optional)</span>
                    </label>
                    <select
                      value={mealPlanName}
                      onChange={(e) => setMealPlanName(e.target.value)}
                      className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">No meal plan</option>
                      {mealPlans.map((m: any, i: number) => (
                        <option key={i} value={m.name}>
                          {m.name} {m.description ? `(${m.description})` : ''} — ₹{(m.price || 0).toLocaleString()}/person
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Special Requests */}
                <div>
                  <label className="text-sm font-medium text-brand-dark mb-1.5 block">
                    Special Requests <span className="text-muted-foreground font-normal">(optional)</span>
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
              </>
            ) : (
              <>
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

                {/* Pickup / Reporting Location */}
                <div>
                  <label className="text-sm font-medium text-brand-dark mb-1.5 block">
                    Pickup / Reporting Location <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. Tapovan / Ram Jhula / Hotel in Rishikesh"
                      value={form.pickupLocation}
                      onChange={(e) => setForm({ ...form, pickupLocation: e.target.value })}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <label className="text-sm font-medium text-brand-dark mb-1.5 block">
                    Emergency Contact <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <PhoneInput
                    value={form.emergencyContact || ''}
                    onChange={(val) => setForm({ ...form, emergencyContact: val })}
                    placeholder="Alternate contact number"
                    className="rounded-xl"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="text-sm font-medium text-brand-dark mb-1.5 block">
                    Additional Notes <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Textarea
                      placeholder="Any special requests or instructions..."
                      value={form.additionalNotes}
                      onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                      className="pl-10 rounded-xl min-h-[80px] resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Safety Declaration for Adventure / Rafting / Trekking */}
                {(pkg.category === 'rafting' || pkg.category === 'trekking' || pkg.category === 'adventure') && (
                  <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-2">
                    <div className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900 leading-relaxed font-semibold">
                        Safety & Fitness Requirement
                      </div>
                    </div>
                    <label className="flex items-start gap-2 text-xs text-brand-dark cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.safetyDeclared}
                        onChange={(e) => setForm({ ...form, safetyDeclared: e.target.checked })}
                        className="mt-0.5 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                      />
                      <span>I confirm all participants meet age/fitness criteria and do not suffer from severe medical or heart conditions.</span>
                    </label>
                  </div>
                )}

                {/* WhatsApp Updates Opt-in */}
                <label className="flex items-center gap-2.5 text-xs text-gray-700 font-medium cursor-pointer bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <input
                    type="checkbox"
                    checked={form.whatsappConsent}
                    onChange={(e) => setForm({ ...form, whatsappConsent: e.target.checked })}
                    className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Receive booking voucher, pickup timing & driver details on WhatsApp</span>
                </label>
              </>
            )}

            {/* Coupon Code */}
            <div>
              <label className="text-sm font-medium text-brand-dark mb-1.5 block">
                Coupon Code <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 h-11 rounded-xl uppercase"
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setAppliedCoupon(null); setCouponCode('') }}
                    className="h-11 rounded-xl text-red-500 border-red-200 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={!couponCode.trim() || validatingCoupon}
                    className="h-11 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white"
                  >
                    {validatingCoupon ? '...' : 'Apply'}
                  </Button>
                )}
              </div>
              {appliedCoupon && (
                <p className="text-xs text-green-600 mt-1">
                  Coupon {appliedCoupon.code} applied — {appliedCoupon.discountPct}% off (save ₹{appliedCoupon.discountAmount})
                </p>
              )}
            </div>

            {/* Price Summary */}
            <div className="bg-brand-cream/70 rounded-xl p-4 space-y-2">
              {isCamping && campingBreakdown ? (
                <>
                  {(campingBreakdown.campSplit?.length
                    ? campingBreakdown.campSplit
                    : [{ pax: campingBreakdown.tierPerCamp, pricePerPerson: campingBreakdown.pricePerPerson, cost: campingBreakdown.roomCost }]
                  ).map((s, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {campingBreakdown.campTypeName}{campingBreakdown.camps > 1 ? ` — Camp ${i + 1}` : ''} · {s.pax} pax @ ₹{s.pricePerPerson.toLocaleString()}/pax/night
                      </span>
                      <span className="text-brand-dark font-medium">₹{s.cost.toLocaleString()}</span>
                    </div>
                  ))}
                  {campingBreakdown.mealCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{campingBreakdown.mealPlanName} (₹{campingBreakdown.mealPlanPrice}/pax/night)</span>
                      <span className="text-brand-dark font-medium">₹{campingBreakdown.mealCost.toLocaleString()}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount ({appliedCoupon.code})</span>
                      <span className="text-green-600 font-medium">-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : isStay && hotelBreakdown ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">₹{hotelBreakdown.roomTypePrice.toLocaleString()} × {nights} night{nights > 1 ? 's' : ''} × {rooms} room{rooms > 1 ? 's' : ''}</span>
                    <span className="text-brand-dark font-medium">₹{hotelBreakdown.roomCost.toLocaleString()}</span>
                  </div>
                  {hotelBreakdown.extraAdultCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Extra adults (₹{hotelBreakdown.extraAdultPrice}/pax/night)</span>
                      <span className="text-brand-dark font-medium">₹{hotelBreakdown.extraAdultCost.toLocaleString()}</span>
                    </div>
                  )}
                  {hotelBreakdown.extraChildCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Extra children (₹{hotelBreakdown.extraChildPrice}/child/night)</span>
                      <span className="text-brand-dark font-medium">₹{hotelBreakdown.extraChildCost.toLocaleString()}</span>
                    </div>
                  )}
                  {hotelBreakdown.mealCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{hotelBreakdown.mealPlanName} (₹{hotelBreakdown.mealPlanPrice}/pax/night)</span>
                      <span className="text-brand-dark font-medium">₹{hotelBreakdown.mealCost.toLocaleString()}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount ({appliedCoupon.code})</span>
                      <span className="text-green-600 font-medium">-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">₹{displayPrice} × {form.numberOfPeople} {form.numberOfPeople === 1 ? 'person' : 'people'}</span>
                    <span className="text-brand-dark font-medium">₹{(displayPrice * form.numberOfPeople).toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600">Discount ({appliedCoupon.code})</span>
                      <span className="text-green-600 font-medium">-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>Booking goes to pending — admin will confirm</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border/50">
                <span>Total</span>
                <span className="text-brand-orange">₹{(((isCamping ? campingTotal : isStay ? hotelTotal : totalPrice)) - (appliedCoupon?.discountAmount || 0)).toLocaleString()}</span>
              </div>
            </div>

            {/* Trust Badges Strip */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-gray-500 py-3 border-y border-border/40 bg-gray-50/50 rounded-xl px-2">
              <div className="flex flex-col items-center gap-1">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>100% Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                <span>Instant Confirmation</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Phone className="w-4 h-4 text-brand-teal" />
                <span>24/7 Helpline</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => goBack()}
                className="flex-1 h-11 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className={`flex-1 h-11 rounded-xl font-semibold ${isAdventure ? 'bg-brand-orange hover:bg-brand-orange/90 text-white' : 'bg-brand-teal hover:bg-brand-teal/90 text-white'}`}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    {isAdventure ? 'Redirecting...' : 'Sending...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    {isAdventure ? `Pay ₹${effectivePrice || pkg?.price || 0}` : 'Send Enquiry'}
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
