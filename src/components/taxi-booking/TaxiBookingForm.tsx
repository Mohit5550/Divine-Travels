'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Users,
  FileText,
  ArrowRight,
  ArrowLeftRight,
  ChevronLeft,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { Footer } from '@/components/landing/Footer'

export function TaxiBookingForm() {
  const { navigate, user, isAuthenticated } = useAppStore()
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way')
  const [vehicleType, setVehicleType] = useState('')
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/packages?category=taxi-booking')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const names = data.map((p: { name: string }) => p.name).filter(Boolean)
          setVehicleTypes([...new Set(names)])
        }
      })
      .catch(() => {})
  }, [])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  // Auto-fill name and phone for signed-in users
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.name && !name) setName(user.name)
      if (user.phone && !phone) setPhone(user.phone)
    }
  }, [isAuthenticated, user, name, phone])
  const [pickupDate, setPickupDate] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [pickupLocation, setPickupLocation] = useState('')
  const [dropLocation, setDropLocation] = useState('')
  const [numberOfDays, setNumberOfDays] = useState(1)
  const [numberOfPassengers, setNumberOfPassengers] = useState(1)
  const [tourDescription, setTourDescription] = useState('')
  const [quoteBestPrice, setQuoteBestPrice] = useState(false)
  const [bookingAmount, setBookingAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [bookingRef, setBookingRef] = useState('')

  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!vehicleType) return toast.error('Please select a vehicle type')
    if (!name) return toast.error('Please enter your name')
    if (!phone) return toast.error('Please enter your mobile number')
    if (!pickupDate) return toast.error('Please select a pick up date')
    if (!pickupTime) return toast.error('Please select a pick up time')
    if (!pickupLocation) return toast.error('Please enter a pick up location')
    if (!dropLocation) return toast.error('Please enter a drop location')
    if (pickupLocation === dropLocation) return toast.error('Pick up and drop locations must be different')
    if (!numberOfPassengers || numberOfPassengers < 1) return toast.error('Please enter number of passengers')

    setSubmitting(true)
    try {
      const payload = {
        destination: `${pickupLocation} → ${dropLocation}`,
        dayLabel: null,
        packageType: `Taxi - ${vehicleType}`,
        selectedPrograms: JSON.stringify({
          tripType,
          vehicleType,
          pickupDate,
          pickupTime,
          pickupLocation,
          dropLocation,
          numberOfDays: tripType === 'round-trip' ? numberOfDays : 1,
          numberOfPassengers,
          tourDescription,
          quoteBestPrice,
          bookingAmount: quoteBestPrice ? null : Number(bookingAmount) || null,
        }),
        name,
        phone,
        travelDate: pickupDate,
        travelers: numberOfPassengers,
      }

      const res = await fetch('/api/taxi-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setBookingRef(`DT${Date.now().toString().slice(-8)}`)
        setSubmitted(true)
        toast.success('Booking request submitted! We will contact you shortly.')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit booking')
      }
    } catch {
      toast.error('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
        <ActivityBar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </motion.div>

            <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-6">
              Your taxi has been booked successfully. Our team will contact you shortly.
            </p>

            <div className="bg-brand-cream rounded-lg p-4 mb-6 text-left space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-brand-orange" />
                <span className="text-muted-foreground">Booking Reference:</span>
                <span className="font-mono font-medium text-brand-dark">{bookingRef}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span className="text-muted-foreground">Traveler:</span>
                <span className="font-medium text-brand-dark">{user?.name || name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-brand-orange" />
                <span className="text-muted-foreground">Status:</span>
                <span className="font-medium text-amber-600">Pending Confirmation</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-700">
              Your booking is pending confirmation. Our team will confirm it within 24 hours.
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('user-dashboard')}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                View My Bookings <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('landing')}
              >
                Continue Exploring
              </Button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <ActivityBar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand-dark/95 to-brand-dark/90 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-brand-orange blur-3xl" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-brand-gold blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Car className="w-4 h-4 text-brand-orange" />
              <span className="text-brand-orange text-sm font-semibold">POST A BOOKING</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3">
              Book Your Taxi
            </h1>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto">
              Tell us your travel plan and get the best quote for your journey
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-6"
        >
          {/* Trip Type Toggle */}
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-3">Trip Type</label>
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setTripType('one-way')}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  tripType === 'one-way'
                    ? 'bg-white text-brand-orange shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ArrowRight className="w-4 h-4" />
                One Way
              </button>
              <button
                type="button"
                onClick={() => setTripType('round-trip')}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                  tripType === 'round-trip'
                    ? 'bg-white text-brand-orange shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                Round Trip
              </button>
            </div>
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-3">
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none appearance-none bg-white"
                required
              >
                <option value="">Select Vehicle Type</option>
                {vehicleTypes.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-3">
                Your Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-3">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your mobile number"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-3">
                Pick Up Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-3">
                Pick Up Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pickup & Drop Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-3">
                Enter Pickup Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  placeholder="e.g. Delhi Airport, Rishikesh Hotel..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-3">
                Enter Drop Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                <input
                  type="text"
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  placeholder="e.g. Manali, Dehradun Railway Station..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {tripType === 'round-trip' && (
            <> {/* Number of Days - Round Trip Only */}
              <label className="block text-sm font-semibold text-brand-dark mb-3">
                Enter Number of Days <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  min={2}
                  max={30}
                  value={numberOfDays}
                  onChange={(e) => setNumberOfDays(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                  required
                />
              </div>
            </>
          )}

          {/* Total Number of Passengers */}
          <label className="block text-sm font-semibold text-brand-dark mb-3 mt-4">
            Total Number of Passengers <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              min={1}
              max={50}
              value={numberOfPassengers}
              onChange={(e) => setNumberOfPassengers(Number(e.target.value))}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-3">
              Enter Tour Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                value={tourDescription}
                onChange={(e) => setTourDescription(e.target.value)}
                placeholder="Tell us about your travel plan, special requirements, or any stops you want to make..."
                rows={4}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none resize-none"
              />
            </div>
          </div>

          {/* Quote Best Price Toggle */}
          <div>
            <label className="block text-sm font-semibold text-brand-dark mb-3">
              Booking Amount
            </label>
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1 mb-3">
              <button
                type="button"
                onClick={() => setQuoteBestPrice(false)}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  !quoteBestPrice
                    ? 'bg-white text-brand-orange shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Enter Amount
              </button>
              <button
                type="button"
                onClick={() => { setQuoteBestPrice(true); setBookingAmount('') }}
                className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  quoteBestPrice
                    ? 'bg-white text-brand-orange shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Quote Best Price
              </button>
            </div>

            {!quoteBestPrice && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">₹</span>
                <input
                  type="number"
                  min={0}
                  value={bookingAmount}
                  onChange={(e) => setBookingAmount(e.target.value)}
                  placeholder="Enter your budget (optional)"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                />
              </div>
            )}

            {quoteBestPrice && (
              <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-4">
                <p className="text-sm text-brand-orange font-medium">
                  Our team will calculate the best price based on your trip details and contact you shortly.
                </p>
              </div>
            )}
          </div>

          {/* Total Booking Amount */}
          {!quoteBestPrice && bookingAmount && (
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Booking Amount</span>
                <span className="text-lg font-bold text-brand-dark">₹{Number(bookingAmount).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white py-3.5 rounded-xl font-semibold text-base transition-all disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              'Post Booking'
            )}
          </Button>

          <p className="text-center text-xs text-gray-400">
            By posting this booking, you agree to be contacted by our team for trip planning.
          </p>
        </motion.form>
      </section>

      <Footer />
    </div>
  )
}
