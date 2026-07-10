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
  const [tourDescription, setTourDescription] = useState('')
  const [quoteBestPrice, setQuoteBestPrice] = useState(false)
  const [bookingAmount, setBookingAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
          tourDescription,
          quoteBestPrice,
          bookingAmount: quoteBestPrice ? null : Number(bookingAmount) || null,
        }),
        name,
        phone,
        travelDate: pickupDate,
        travelers: 1,
      }

      const res = await fetch('/api/taxi-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-brand-dark mb-3">Booking Request Sent!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your taxi booking request. Our team will review it and contact you shortly with the best quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => { setSubmitted(false); setName(''); setPhone(''); setVehicleType(''); setPickupDate(''); setPickupTime(''); setPickupLocation(''); setDropLocation(''); setTourDescription(''); setBookingAmount(''); setNumberOfDays(1); setQuoteBestPrice(false) }}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white"
              >
                Book Another Taxi
              </Button>
              <Button
                onClick={() => navigate('taxi-booking')}
                variant="outline"
                className="border-brand-dark/20"
              >
                View Taxi Packages
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

          {/* Number of Days - Both trip types */}
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
