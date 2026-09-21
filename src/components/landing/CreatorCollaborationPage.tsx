'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Video, Instagram, Youtube, Gift, DollarSign, Camera, ShieldCheck,
  CheckCircle2, ArrowRight, Send, Compass, Users, Award, Star, Clock,
  ChevronDown, MessageCircle, HeartHandshake, MapPin, Check, Zap, Flame,
  Search, RefreshCw, AlertCircle, Receipt, Lock, CheckCircle, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ActivityBar } from './ActivityBar'
import { toast } from 'sonner'

const FREE_ACTIVITIES = [
  {
    id: 'bungee',
    name: "🪂 India's Highest Bungee Jump (Rishikesh - 83m/113m)",
    badge: '⭐ Most Popular for Creators',
    desc: 'Jump from India’s highest bungee platform with HD GoPro footage provided.',
  },
  {
    id: 'rafting',
    name: '🌊 26 KM Marine Drive River Rafting & Cliff Jump',
    badge: 'High Adrenaline',
    desc: 'Grade III/IV rapids, Body Surfing, and 25ft Cliff Jump into Holy Ganga.',
  },
  {
    id: 'camping',
    name: '🏕️ Luxury Riverside Camp Stay (1 Night + Bonfire & All Meals)',
    badge: 'Relax & Vibe',
    desc: 'Swiss luxury tents by the river with live music, bonfire night, dinner & breakfast.',
  },
  {
    id: 'bike',
    name: '🏍️ Royal Enfield Himalayan 450 Rental (1 Full Day)',
    badge: 'Mountain Riding',
    desc: 'Ride through Mohan Chatti, Kunjapuri Temple, and scenic mountain loops.',
  },
  {
    id: 'sightseeing',
    name: '🛕 Haridwar & Rishikesh VIP Sightseeing Tour with AC Cab',
    badge: 'Spiritual & Culture',
    desc: 'Ganga Aarti at Triveni Ghat, Beatles Ashram, Neer Garh Waterfall, Parmarth Niketan.',
  },
  {
    id: 'swing',
    name: '🦅 Giant Swing (113m) or Extreme Flying Fox',
    badge: 'Extreme Adventure',
    desc: 'Soar through the valley over the river at 140 kmph speed.',
  },
]

export function CreatorCollaborationPage() {
  const [activeTab, setActiveTab] = useState<'apply' | 'tracker'>('apply')
  const [collabType, setCollabType] = useState<'barter' | 'affiliate' | 'paid'>('barter')

  // Application form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    instagram: '',
    youtube: '',
    followersCount: '10K - 50K',
    niche: 'Adventure & Ganga Rafting',
    selectedFreeActivity: "🪂 India's Highest Bungee Jump (Rishikesh - 83m/113m)",
    expectedBudget: '',
    proposedCoupon: '',
    deliverables: '2 Instagram Reels + 5 Stories + 1 YouTube Vlog',
    travelDates: '',
    message: '',
  })

  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // Creator tracker state
  const [trackerQuery, setTrackerQuery] = useState('')
  const [trackerLoading, setTrackerLoading] = useState(false)
  const [trackerData, setTrackerData] = useState<any>(null)

  const handleSelectModel = (type: 'barter' | 'affiliate' | 'paid') => {
    setActiveTab('apply')
    setCollabType(type)
    const el = document.getElementById('creator-application-form')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Please fill in your Name, Email, and WhatsApp Phone Number')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        collaborationType: collabType,
        selectedFreeActivity: collabType === 'barter' ? formData.selectedFreeActivity : null,
        expectedBudget: collabType === 'paid' ? formData.expectedBudget : null,
        proposedCoupon: collabType === 'affiliate' ? (formData.proposedCoupon || (formData.name.split(' ')[0] + '10').toUpperCase()) : null,
      }

      const res = await fetch('/api/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application')
      }

      setSubmitted(true)
      toast.success('Application submitted successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleTrackCreator = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackerQuery.trim()) {
      toast.error('Please enter your Promo Code, Phone Number, or Email')
      return
    }

    setTrackerLoading(true)
    try {
      const res = await fetch(`/api/collaborations/track?query=${encodeURIComponent(trackerQuery.trim())}`)
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No creator account found')
      }
      setTrackerData(data)
      toast.success(`Welcome back, ${data.creator.name}!`)
    } catch (err: any) {
      toast.error(err.message || 'Creator account not found. Please check your code or contact team.')
      setTrackerData(null)
    } finally {
      setTrackerLoading(false)
    }
  }

  const requestPayoutWhatsApp = () => {
    if (!trackerData) return
    const c = trackerData.creator
    const s = trackerData.stats
    const text = encodeURIComponent(
      `Hi Divine Travels Team, I am ${c.name} (Partner Code: ${c.assignedCoupon}). My creator dashboard shows ₹${s.payableCommission.toLocaleString()} in confirmed completed earnings. Please process my payout to my UPI/Bank account.`
    )
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <ActivityBar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden bg-gradient-to-b from-brand-teal/95 via-brand-teal to-brand-dark text-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-brand-orange mb-6">
              <Sparkles className="w-4 h-4" /> Divine Travels Creator Network
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto mb-6 drop-shadow-sm">
              Create. Travel. Inspire. <br />
              <span className="bg-gradient-to-r from-brand-orange via-amber-300 to-brand-orange bg-clip-text text-transparent">
                Partner with Divine Travels.
              </span>
            </h1>

            <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Get <strong>Free Bungee Jumps, Ganga Rafting &amp; Luxury Camps</strong> in exchange for content, or earn <strong>10% cash commission</strong> on every booking using your custom promo code.
            </p>

            {/* Mode Toggle Bar: Apply vs Live Tracker */}
            <div className="inline-flex items-center p-1.5 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/15 max-w-md mx-auto mb-8">
              <button
                onClick={() => setActiveTab('apply')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'apply'
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/25'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                ✨ Apply for Partnership
              </button>
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tracker'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <DollarSign className="w-4 h-4" /> Track Earnings &amp; Bookings
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* VIEW 1: CREATOR LIVE EARNINGS & BOOKINGS TRACKER */}
      {activeTab === 'tracker' && (
        <section className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 flex-1 w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search Box */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl text-center max-w-2xl mx-auto">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-gray-900">Creator Earnings &amp; Booking Tracker</h2>
              <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto mt-1 mb-6">
                Enter your assigned Promo Code (e.g. <code>ROHAN10</code>) or registered phone number to view live customer bookings and commission payouts.
              </p>

              <form onSubmit={handleTrackCreator} className="flex gap-2 max-w-lg mx-auto">
                <input
                  type="text"
                  placeholder="Enter Promo Code / Phone Number..."
                  value={trackerQuery}
                  onChange={(e) => setTrackerQuery(e.target.value.toUpperCase())}
                  className="flex-1 border-2 border-emerald-500/40 rounded-xl px-4 py-2.5 text-sm font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <Button
                  type="submit"
                  disabled={trackerLoading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 rounded-xl"
                >
                  {trackerLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Check Stats'}
                </Button>
              </form>
            </div>

            {/* Live Stats Display */}
            {trackerData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Creator Header Card */}
                <div className="bg-gradient-to-r from-brand-teal to-brand-dark p-6 sm:p-8 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                  <div>
                    <span className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider text-brand-orange">
                      Verified Divine Creator
                    </span>
                    <h3 className="font-bold text-2xl sm:text-3xl mt-2">{trackerData.creator.name}</h3>
                    <p className="text-white/70 text-xs sm:text-sm mt-0.5">
                      {trackerData.creator.instagram} · Rate: <strong>{trackerData.creator.commissionPct}% Cash Commission</strong>
                    </p>
                  </div>

                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-brand-orange text-white font-mono font-extrabold text-sm sm:text-base px-4 py-1.5 rounded-xl shadow-md">
                      <Tag className="w-4 h-4" /> Code: {trackerData.creator.assignedCoupon}
                    </span>
                    <span className="text-xs text-white/70">10% Off for your followers</span>
                  </div>
                </div>

                {/* 4 Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Confirmed Payable Earnings (TRIP COMPLETED) */}
                  <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-sm bg-gradient-to-b from-emerald-50/50 to-white">
                    <div className="flex items-center justify-between text-emerald-800 text-xs font-bold uppercase">
                      <span>🟢 Confirmed Earnings</span>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-emerald-700 mt-2">
                      ₹{trackerData.stats.payableCommission.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-emerald-800/80 mt-1 font-medium">
                      From {trackerData.stats.completedBookingsCount} Completed Trips (Ready for Payout!)
                    </p>
                  </div>

                  {/* 2. Pending In-Progress Earnings (TRIP UPCOMING) */}
                  <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-b from-amber-50/40 to-white">
                    <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase">
                      <span>🟡 Pending Earnings</span>
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-3xl font-extrabold text-amber-600 mt-2">
                      ₹{trackerData.stats.pendingCommission.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-amber-800/80 mt-1 font-medium">
                      From {trackerData.stats.pendingBookingsCount} Upcoming / Booked Trips
                    </p>
                  </div>

                  {/* 3. Total Sales Driven */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase">
                      <span>Total Bookings Value</span>
                      <Receipt className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">
                      ₹{(trackerData.stats.completedSales + trackerData.stats.pendingSales).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Total {trackerData.stats.totalBookings} customer bookings
                    </p>
                  </div>

                  {/* 4. Payout Action */}
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-5 rounded-2xl text-white shadow-md flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase text-white/80">Commission Payout</p>
                      <p className="text-xs text-white/90 mt-1">
                        Request payout to your UPI or bank anytime for completed trips.
                      </p>
                    </div>
                    <Button
                      onClick={requestPayoutWhatsApp}
                      className="w-full bg-white hover:bg-white/95 text-emerald-800 font-bold text-xs h-9 rounded-xl mt-3 shadow"
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5 text-emerald-600" /> Request Payout
                    </Button>
                  </div>
                </div>

                {/* Important Policy Note */}
                <div className="bg-blue-50/80 border border-blue-200/80 p-4 rounded-2xl text-xs text-blue-900 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Transparent Partnership Policy:</strong>
                    <p className="mt-0.5 text-blue-800 leading-relaxed">
                      Inquiries and upcoming bookings remain in <strong>&ldquo;Pending&rdquo;</strong> status until the customer actually visits and completes their tour/activity in Rishikesh. Once the trip is marked <strong>&ldquo;Completed&rdquo;</strong>, your commission moves to <strong>&ldquo;Confirmed Earnings&rdquo;</strong> and is 100% eligible for instant payout.
                    </p>
                  </div>
                </div>

                {/* Bookings Breakdown Table */}
                <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-gray-900">
                      Bookings Made With Your Code ({trackerData.bookings.length})
                    </h4>
                    <span className="text-xs text-gray-500">Updated in Real-Time</span>
                  </div>

                  {trackerData.bookings.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 text-xs">
                      No bookings recorded yet with code <strong>{trackerData.creator.assignedCoupon}</strong>. Share your promo code in your reels &amp; video descriptions to start earning!
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-gray-600">
                        <thead className="bg-slate-50 text-gray-700 font-bold uppercase text-[11px]">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Booked Package</th>
                            <th className="px-4 py-3">Booking Amount</th>
                            <th className="px-4 py-3">Trip Status</th>
                            <th className="px-4 py-3 text-right">Your Commission</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {trackerData.bookings.map((b: any) => (
                            <tr key={b.id} className="hover:bg-slate-50/70">
                              <td className="px-4 py-3 text-gray-500 font-mono">
                                {new Date(b.bookedAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-900">{b.customerName}</td>
                              <td className="px-4 py-3">{b.packageName}</td>
                              <td className="px-4 py-3 font-bold text-gray-900">₹{b.totalPrice?.toLocaleString()}</td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                                    b.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : b.status === 'confirmed'
                                      ? 'bg-blue-100 text-blue-700'
                                      : b.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {b.status === 'completed' ? '🟢 Trip Completed' : b.status === 'confirmed' ? '🔵 Confirmed' : '🟡 Upcoming'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {b.status === 'completed' ? (
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                    +₹{b.commission.toLocaleString()} (Earned)
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">
                                    Pending completion
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </section>
      )}

      {/* VIEW 2: NEW CREATOR APPLICATION & OVERVIEW */}
      {activeTab === 'apply' && (
        <>
          {/* Choose How You Want to Collaborate Section */}
          <section id="tiers" className="py-16 sm:py-24 bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="text-brand-orange text-xs font-bold uppercase tracking-wider bg-brand-orange/10 px-3 py-1 rounded-full">
                  Partnership Options
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-3">
                  Choose How You Want to Collaborate
                </h2>
                <p className="text-gray-600 text-sm sm:text-base mt-2">
                  Select the model that fits your audience and travel goals.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tier 1: Barter Experience */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="relative rounded-3xl p-8 border border-brand-orange bg-gradient-to-b from-brand-orange/5 to-white shadow-xl ring-2 ring-brand-orange/20 flex flex-col justify-between"
                >
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-xs font-bold px-4 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Most Popular for Creators
                  </span>

                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Creators 5K – 50K+</span>
                    <h3 className="font-bold text-2xl text-gray-900 mt-1">1 Free Activity / Stay</h3>
                    <p className="text-brand-orange font-semibold text-sm mt-1">100% Free Barter Experience</p>
                    <p className="text-gray-600 text-sm mt-3 pb-5 border-b border-gray-100 leading-relaxed">
                      Choose <strong>ANY 1</strong> complimentary experience in Rishikesh in exchange for high-quality Reels and Stories.
                    </p>

                    <div className="py-5 space-y-2.5">
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Choose 1 Free Option:</p>
                      <div className="space-y-2 text-xs text-gray-700">
                        <div className="flex items-center gap-2 font-semibold text-brand-orange bg-brand-orange/10 p-2 rounded-lg">
                          <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>🪂 India&apos;s Highest Bungee Jump (83m/113m)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>🌊 26 KM River Rafting &amp; Cliff Jump</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>🏕️ 1 Night Riverside Camp Stay + Bonfire</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>🏍️ 1 Day Royal Enfield Himalayan Rental</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Deliverables Required:</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 mb-5">1-2 Reels + 3-5 Stories + Tag Collab</p>
                    <Button
                      onClick={() => handleSelectModel('barter')}
                      className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl h-11 shadow-md shadow-brand-orange/20"
                    >
                      Apply for Free Experience
                    </Button>
                  </div>
                </motion.div>

                {/* Tier 2: Affiliate Partner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="relative rounded-3xl p-8 border border-gray-200 bg-white shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-colors"
                >
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Open For All Creators</span>
                    <h3 className="font-bold text-2xl text-gray-900 mt-1">Affiliate Partner</h3>
                    <p className="text-emerald-600 font-semibold text-sm mt-1">10% Cash Commission On Completed Trips</p>
                    <p className="text-gray-600 text-sm mt-3 pb-5 border-b border-gray-100 leading-relaxed">
                      Monetize your travel audience with a personalized promo code. Earn 10% cash commission on every completed booking.
                    </p>

                    <div className="py-5 space-y-2.5">
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">What You Get:</p>
                      <div className="space-y-2 text-xs text-gray-700">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Custom 10% Discount Code for your followers</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-emerald-700">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>10% Direct Cash Commission on completed bookings</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Live Real-Time Creator Dashboard &amp; Tracking</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>Direct UPI / Bank Transfer Payouts</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Deliverables Required:</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 mb-5">Link in Bio / Video Description Mention</p>
                    <Button
                      onClick={() => handleSelectModel('affiliate')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 shadow-md shadow-emerald-600/20"
                    >
                      Get 10% Affiliate Code
                    </Button>
                  </div>
                </motion.div>

                {/* Tier 3: Sponsored Expedition */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="relative rounded-3xl p-8 border border-gray-200 bg-white shadow-sm flex flex-col justify-between hover:border-purple-300 transition-colors"
                >
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Macro Creators (100K+)</span>
                    <h3 className="font-bold text-2xl text-gray-900 mt-1">Paid Sponsorship</h3>
                    <p className="text-purple-600 font-semibold text-sm mt-1">Fixed Fee + Luxury Tour Covered</p>
                    <p className="text-gray-600 text-sm mt-3 pb-5 border-b border-gray-100 leading-relaxed">
                      Full custom itineraries with dedicated private chauffeur, VIP stays, and upfront creator sponsorship fee.
                    </p>

                    <div className="py-5 space-y-2.5">
                      <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">What You Get:</p>
                      <div className="space-y-2 text-xs text-gray-700">
                        <div className="flex items-center gap-2 font-semibold text-purple-700">
                          <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span>Fixed Sponsorship Fee (as per mutual agreement)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span>All-inclusive Luxury Stay &amp; Activities covered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span>Private AC Taxi &amp; VIP Tour Escort</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span>Cross-channel co-marketing push</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">Deliverables Required:</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5 mb-5">Dedicated YouTube Vlog + Series of Reels</p>
                    <Button
                      onClick={() => handleSelectModel('paid')}
                      className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-bold rounded-xl h-11 shadow-md shadow-brand-teal/20"
                    >
                      Request Paid Sponsorship
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Interactive Application Form */}
          <section id="creator-application-form" className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
            >
              {/* Header with Model Selector */}
              <div className="bg-gradient-to-r from-brand-teal to-brand-dark p-8 sm:p-10 text-white text-center">
                <span className="inline-flex items-center gap-1.5 bg-brand-orange px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> Fast 2-Minute Form
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold">Apply for Creator Partnership</h2>
                <p className="text-white/80 text-sm max-w-md mx-auto mt-2">
                  Select your preferred collaboration type below and fill in your social handles.
                </p>

                {/* Model Switcher Tabs */}
                <div className="grid grid-cols-3 gap-2 max-w-xl mx-auto mt-6 bg-black/20 p-1.5 rounded-2xl backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setCollabType('barter')}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      collabType === 'barter'
                        ? 'bg-brand-orange text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    🎁 Free Experience
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollabType('affiliate')}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      collabType === 'affiliate'
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    💰 10% Affiliate
                  </button>
                  <button
                    type="button"
                    onClick={() => setCollabType('paid')}
                    className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      collabType === 'paid'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    👑 Paid Sponsor
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-10 sm:p-14 text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Application Received!</h3>
                    <p className="text-gray-600 text-sm max-w-md mx-auto">
                      Thank you for applying, <strong>{formData.name}</strong>! Our partnerships team will review your application for{' '}
                      <strong className="text-brand-orange capitalize">
                        {collabType === 'barter' ? formData.selectedFreeActivity : collabType === 'affiliate' ? '10% Affiliate Code' : 'Paid Sponsorship'}
                      </strong>{' '}
                      and message you on WhatsApp (<strong>{formData.phone}</strong>) within 24 hours.
                    </p>
                    <div className="pt-4">
                      <Button
                        onClick={() => {
                          setSubmitted(false)
                          setFormData({
                            name: '',
                            email: '',
                            phone: '',
                            instagram: '',
                            youtube: '',
                            followersCount: '10K - 50K',
                            niche: 'Adventure & Ganga Rafting',
                            selectedFreeActivity: "🪂 India's Highest Bungee Jump (Rishikesh - 83m/113m)",
                            expectedBudget: '',
                            proposedCoupon: '',
                            deliverables: '2 Instagram Reels + 5 Stories + 1 YouTube Vlog',
                            travelDates: '',
                            message: '',
                          })
                        }}
                        variant="outline"
                        className="rounded-full px-6"
                      >
                        Submit Another Application
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-6">
                    {/* Specific Model Highlights */}
                    {collabType === 'barter' && (
                      <div className="bg-amber-50/70 border border-amber-200 p-4 sm:p-5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-brand-orange" />
                          <label className="text-xs sm:text-sm font-bold text-gray-900">
                            Select Your 1 Free Complimentary Experience *
                          </label>
                        </div>
                        <select
                          value={formData.selectedFreeActivity}
                          onChange={(e) => setFormData({ ...formData, selectedFreeActivity: e.target.value })}
                          className="w-full border-2 border-brand-orange/40 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 bg-white"
                        >
                          {FREE_ACTIVITIES.map((act) => (
                            <option key={act.id} value={act.name}>
                              {act.name}
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-gray-500">
                          💡 Tip: Bungee Jump &amp; River Rafting videos perform best on Instagram Reels &amp; YouTube Shorts!
                        </p>
                      </div>
                    )}

                    {collabType === 'affiliate' && (
                      <div className="bg-emerald-50/70 border border-emerald-200 p-4 sm:p-5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-emerald-700" />
                          <label className="text-xs sm:text-sm font-bold text-gray-900">
                            Preferred Promo Code Name (Optional)
                          </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="e.g. ROHAN10 or PRIYATRAVELS"
                            value={formData.proposedCoupon}
                            onChange={(e) => setFormData({ ...formData, proposedCoupon: e.target.value.toUpperCase() })}
                            className="w-full border border-emerald-300 rounded-xl px-4 py-2.5 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                          />
                          <div className="text-xs text-emerald-800 flex items-center">
                            ✅ Your viewers get 10% discount &amp; you get 10% payout on every completed booking!
                          </div>
                        </div>
                      </div>
                    )}

                    {collabType === 'paid' && (
                      <div className="bg-purple-50/70 border border-purple-200 p-4 sm:p-5 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-purple-700" />
                          <label className="text-xs sm:text-sm font-bold text-gray-900">
                            Expected Sponsorship Budget (₹ INR) *
                          </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            placeholder="e.g. ₹25,000 / $300"
                            value={formData.expectedBudget}
                            onChange={(e) => setFormData({ ...formData, expectedBudget: e.target.value })}
                            className="w-full border border-purple-300 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                          />
                          <div className="text-xs text-purple-800 flex items-center">
                            Includes video production + all travel accommodations covered.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Full Name *</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. Rohan Sharma"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Email Address *</label>
                        <input
                          required
                          type="email"
                          placeholder="rohan@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">WhatsApp Phone Number *</label>
                        <PhoneInput
                          value={formData.phone}
                          onChange={(val) => setFormData({ ...formData, phone: val })}
                          placeholder="Enter WhatsApp number"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Follower / Subscriber Count *</label>
                        <select
                          value={formData.followersCount}
                          onChange={(e) => setFormData({ ...formData, followersCount: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white font-medium"
                        >
                          <option value="<10K">&lt; 10K (Emerging Creator)</option>
                          <option value="10K - 50K">10K – 50K (Micro Creator)</option>
                          <option value="50K - 200K">50K – 200K (Mid-Tier Creator)</option>
                          <option value="200K - 500K">200K – 500K (Established Creator)</option>
                          <option value="500K+">500K+ (Macro / Celebrity Creator)</option>
                        </select>
                      </div>
                    </div>

                    {/* Social Profiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                          <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram Handle / Profile Link
                        </label>
                        <input
                          type="text"
                          placeholder="@yourhandle or instagram.com/handle"
                          value={formData.instagram}
                          onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                          <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube Channel Link / Blog
                        </label>
                        <input
                          type="text"
                          placeholder="youtube.com/@channel or blog URL"
                          value={formData.youtube}
                          onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                        />
                      </div>
                    </div>

                    {/* Dates & Deliverables */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          {collabType === 'affiliate' ? 'Primary Travel Niche' : 'Planned Visit Month / Dates'}
                        </label>
                        {collabType === 'affiliate' ? (
                          <select
                            value={formData.niche}
                            onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white"
                          >
                            <option value="Adventure & Ganga Rafting">Adventure &amp; Ganga Rafting</option>
                            <option value="Trekking & Mountain Expeditions">Trekking &amp; Mountain Expeditions</option>
                            <option value="Luxury Hotels, Camps & Resorts">Luxury Hotels, Camps &amp; Resorts</option>
                            <option value="Spiritual & Char Dham Yatra">Spiritual &amp; Char Dham Yatra</option>
                            <option value="Travel Vlogs, Food & Culture">Travel Vlogs, Food &amp; Culture</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            placeholder="e.g. Next month / September 15-20"
                            value={formData.travelDates}
                            onChange={(e) => setFormData({ ...formData, travelDates: e.target.value })}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                          />
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                          {collabType === 'affiliate' ? 'Where will you promote?' : 'Proposed Content Deliverables'}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            collabType === 'affiliate'
                              ? 'e.g. Instagram Bio, YouTube Description, Telegram Group'
                              : 'e.g. 2 Instagram Reels + 5 Stories + 1 YouTube Vlog'
                          }
                          value={formData.deliverables}
                          onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-gray-700 mb-1.5 block">About You &amp; Pitch Notes (Optional)</label>
                      <textarea
                        rows={3}
                        placeholder="Tell us a little about your content style, previous brand collaborations, or what you'd like to feature..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className={`w-full text-white font-bold h-12 rounded-xl text-base shadow-lg transition-all ${
                        collabType === 'barter'
                          ? 'bg-brand-orange hover:bg-brand-orange/90 shadow-brand-orange/25'
                          : collabType === 'affiliate'
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                          : 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25'
                      }`}
                    >
                      {loading ? 'Submitting Application...' : `Submit Application for ${collabType === 'barter' ? 'Free Experience' : collabType === 'affiliate' ? '10% Affiliate Code' : 'Paid Sponsorship'}`}
                    </Button>

                    <p className="text-center text-xs text-gray-500">
                      🔒 We respect your privacy. Your contact details will only be used by the Divine Travels team.
                    </p>
                  </form>
                )}
              </AnimatePresence>
            </motion.div>
          </section>
        </>
      )}

      {/* FAQs */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'When do I get my affiliate commission payout?',
                a: "Commission is officially confirmed as soon as the customer finishes their tour/stay in Rishikesh. You can track completed trips live in the Creator Tracker and request instant UPI/Bank transfer payouts.",
              },
              {
                q: 'What happens if a customer cancels their booking?',
                a: "If a booking is cancelled or refunded before the trip takes place, no commission is credited. This ensures 100% fair and transparent accounting.",
              },
              {
                q: 'Can I choose Bungee Jumping as my free barter perk?',
                a: "Yes! India's Highest Bungee Jump (Rishikesh) is our most popular collaboration perk for travel creators with 10K+ followers. We also provide raw HD GoPro jump footage for your Reels and YouTube videos.",
              },
              {
                q: 'How long does the application review take?',
                a: 'Our partnerships team reviews creator applications within 24 to 48 hours and connects directly on WhatsApp.',
              },
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-semibold text-gray-900 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                      openFaq === idx ? 'rotate-180 text-brand-orange' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
