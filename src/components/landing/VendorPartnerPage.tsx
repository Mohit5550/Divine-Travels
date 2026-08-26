'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Tent, Waves, Hotel, Bike, Compass, Car, Sparkles, CheckCircle2,
  ShieldCheck, ArrowRight, Check, DollarSign, Users, Award, MapPin, Phone,
  Mail, Search, RefreshCw, AlertCircle, ChevronDown, MessageCircle, FileText,
  Clock, Zap, Camera, Star, HelpCircle, Plus, Edit3, Trash2, X, Tag, Package,
  TrendingUp, Shield, CheckCircle, ArrowUpRight, LogOut, Layers, Lock, Eye,
  EyeOff, Upload, Calendar, Percent, Navigation, Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ActivityBar } from './ActivityBar'
import { toast } from 'sonner'

const CITIES = [
  'Rishikesh (Shivpuri / Tapovan / Mohan Chatti)',
  'Haridwar',
  'Dehradun & Airport',
  'Mussoorie',
  'Nainital',
  'Chopta Tungnath',
  'Kedarnath & Char Dham',
  'Jim Corbett',
]

const CATEGORIES = [
  {
    id: 'camping',
    name: 'Riverside Camps & Resorts',
    icon: Tent,
    desc: 'Luxury Swiss Tents, River Camps, Domes & Cottages',
    popularAmenities: ['Attached Washroom', 'Swimming Pool', 'Bonfire & Music', 'All 3 Meals', 'River Access', 'AC / Geyser', 'Free Parking'],
    popularInclusions: ['Buffet Breakfast & Dinner', 'Evening Snacks & Tea', 'Campfire & DJ Music', 'Swimming Pool Access', 'Nature Walk & Badminton'],
    popularExclusions: ['Personal Transportation', 'Alcohol & Soft Drinks', 'Extra Bedding beyond Pax'],
    defaultEligibility: 'Suitable for all age groups, families, and couples.',
  },
  {
    id: 'rafting',
    name: 'River Rafting Operator',
    icon: Waves,
    desc: '12km, 16km, 26km, 36km Ganga Rafting & Cliff Jump',
    popularAmenities: ['Grade III/IV Rapids', 'GoPro HD Video', 'Cliff Jump 25ft', 'Body Surfing', 'Certified River Guide', 'Safety Kayak', 'Transport Included'],
    popularInclusions: ['International Life Jacket & Helmet', 'Certified River Guide', 'Safety Kayak Escort', 'Cliff Jump 25ft', 'Body Surfing in Ganga'],
    popularExclusions: ['GoPro Raw Video (Unless booked)', 'Personal Dry Bag', 'Hotel Pickup & Drop'],
    defaultEligibility: 'Age: 14 to 60 Years. Weight: 35kg to 110kg. Not recommended for pregnant women or severe heart conditions.',
  },
  {
    id: 'hotel',
    name: 'Hotels & Homestays',
    icon: Hotel,
    desc: 'Boutique Hotels, River View Rooms, Cottages & Stays',
    popularAmenities: ['River View Balcony', 'AC & Heating', 'Free High Speed WiFi', 'Restaurant / Room Service', 'Elevator', 'Power Backup', 'Near Ganga Ghat'],
    popularInclusions: ['Complimentary Breakfast', 'High-Speed WiFi', '24x7 Hot & Cold Water', 'Daily Housekeeping', 'Electric Kettle & Tea Kit'],
    popularExclusions: ['Lunch & Dinner (A-la-carte)', 'Laundry Services', 'Late Check-out Charges'],
    defaultEligibility: 'Valid Govt ID proof (Aadhar / Passport) mandatory for all check-in guests.',
  },
  {
    id: 'bike-rental',
    name: 'Bike & Scooty Rental Fleet',
    icon: Bike,
    desc: 'Royal Enfield, Himalayan 450, Hunter 350 & Scooters',
    popularAmenities: ['Himalayan 450 Available', 'Classic / Hunter 350', 'Activa / Access Scooty', '2 ISI Helmets Provided', 'Zero Hidden Charges', 'Luggage Carrier', 'Full Tank Option'],
    popularInclusions: ['2 ISI Marked Helmets', 'Valid Vehicle RC & Insurance Copy', 'Luggage Carrier with Bungee Cords', 'Full Maintenance Check'],
    popularExclusions: ['Fuel / Petrol (Returned as given)', 'Puncture / Accidental Damages', 'Security Deposit (Refundable)'],
    defaultEligibility: 'Original Valid 2-Wheeler Driving License + Aadhar Card + Refundable Security Deposit.',
  },
  {
    id: 'adventure',
    name: 'Adventure Activity Operator',
    icon: Zap,
    desc: 'Bungee Jump, Giant Swing, Flying Fox, Zipline & Paragliding',
    popularAmenities: ['83m / 113m Bungee', 'Extreme Flying Fox', 'Reverse Bungee', 'GoPro Action Footage', 'Certified Jump Masters', 'International Safety Gear', 'Medically Insured'],
    popularInclusions: ['Jump Master Safety Briefing', 'International Harness & Bungee Cord', 'Activity Completion Certificate', 'On-ground First Aid Support'],
    popularExclusions: ['GoPro HD 4K Video Package', 'Express Jump Lane', 'Transport to Activity Zone'],
    defaultEligibility: 'Age: 12 to 50 Years. Weight: 35kg to 120kg. Strict restriction for high BP, asthma, or recent fractures.',
  },
  {
    id: 'taxi',
    name: 'Taxi & Tempo Fleet Operator',
    icon: Car,
    desc: 'Innova Crysta, Ertiga, Dzire & 12/26 Seater Travellers',
    popularAmenities: ['Innova Crysta AC', 'Ertiga / Dzire', '12-26 Seater Tempo Traveller', 'Airport Pickup / Drop', 'Char Dham Yatra Specialist', 'Uniformed Chauffeur', '24x7 Breakdown Support'],
    popularInclusions: ['Clean AC Vehicle', 'Experienced Mountain Chauffeur', 'Toll Tax & State Green Tax', 'Fuel & Driver Allowance'],
    popularExclusions: ['Monument / Temple Entry Tickets', 'Night Driving Surcharge (Post 10 PM)', 'Parking Charges outside booking itinerary'],
    defaultEligibility: 'Maximum passenger capacity strictly enforced as per vehicle registration.',
  },
  {
    id: 'trekking',
    name: 'Trekking & Expeditions',
    icon: Compass,
    desc: 'Kedarkantha, Valley of Flowers, Chopta Tungnath & Day Hikes',
    popularAmenities: ['Certified Trek Leader', 'High Altitude Tents', 'Nutritious Meals', 'Sleeping Bags & Mats', 'First Aid / Oxygen Cylinder', 'Forest Permits Included', 'Porter / Mule Support'],
    popularInclusions: ['Certified Wilderness Trek Leader', 'Alpine 4-Season Tents & Sleeping Bags', 'All Vegetarian Meals on Trek', 'Forest Entry Permits', 'Medical First Aid & O2 Kit'],
    popularExclusions: ['Personal Backpack Offloading', 'Trekking Shoes / Poles Rental', 'Emergency Evacuation Costs'],
    defaultEligibility: 'Basic physical fitness required. Minimum age: 10 Years.',
  },
]

export function VendorPartnerPage() {
  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'dashboard'>('register')

  // Step 1: OkGhumo-style Client & User Registration
  const [clientName, setClientName] = useState('')
  const [selectedCity, setSelectedCity] = useState(CITIES[0])
  const [businessCategory, setBusinessCategory] = useState('camping')
  const [gstNumber, setGstNumber] = useState('')
  const [panNumber, setPanNumber] = useState('')
  const [gstDocUrl, setGstDocUrl] = useState('')
  const [panDocUrl, setPanDocUrl] = useState('')
  const [advancePercentage, setAdvancePercentage] = useState('20')

  // User credentials
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPhone, setUserPhone] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userConfirmPassword, setUserConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [bankUpi, setBankUpi] = useState('')
  const [listingTitle, setListingTitle] = useState('')
  const [vendorLocation, setVendorLocation] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [vendorPhotos, setVendorPhotos] = useState('')
  const [vendorAmenities, setVendorAmenities] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)

  // Step 2: Login State
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Step 3: Active Vendor Session
  const [activeVendor, setActiveVendor] = useState<any>(null)

  // Modal: Add / Edit Activity / Stay with 3-tier Pricing, Inclusions, Exclusions, and Time Slots
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [itemCategory, setItemCategory] = useState('camping')
  const [itemTitle, setItemTitle] = useState('')
  const [itemMrpPrice, setItemMrpPrice] = useState('')
  const [itemSellingPrice, setItemSellingPrice] = useState('')
  const [itemB2bPrice, setItemB2bPrice] = useState('')
  const [itemAdvancePct, setItemAdvancePct] = useState('20')
  const [itemCapacity, setItemCapacity] = useState('')
  const [itemPickupLocation, setItemPickupLocation] = useState('')
  const [itemSpotLocation, setItemSpotLocation] = useState('')
  const [itemDescription, setItemDescription] = useState('')
  const [itemHighlights, setItemHighlights] = useState('')
  const [itemInclusions, setItemInclusions] = useState<string[]>([])
  const [itemExclusions, setItemExclusions] = useState<string[]>([])
  const [itemEligibility, setItemEligibility] = useState('')
  const [itemAmenities, setItemAmenities] = useState<string[]>([])
  const [itemPhotos, setItemPhotos] = useState<string[]>([])
  const [itemPhotoInput, setItemPhotoInput] = useState('')

  // Time slots state for batches
  const [itemTimeSlots, setItemTimeSlots] = useState<{ startTime: string; endTime: string; capacity: number }[]>([
    { startTime: '06:00', endTime: '09:00', capacity: 10 },
    { startTime: '10:00', endTime: '13:00', capacity: 15 },
  ])

  const [itemSaving, setItemSaving] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  // 1. Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !userName.trim() || !userPhone.trim() || !userEmail.trim()) {
      toast.error('Please fill in Client Name, User Name, Phone, and Email')
      return
    }

    if (!userPassword) {
      toast.error('Please set a password to secure your vendor account')
      return
    }

    if (userPassword && userPassword !== userConfirmPassword) {
      toast.error('Password and Confirm Password do not match!')
      return
    }

    setRegisterLoading(true)
    try {
      const res = await fetch('/api/vendors/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: clientName.trim(),
          ownerName: userName.trim(),
          phone: userPhone.trim(),
          email: userEmail.trim().toLowerCase(),
          password: userPassword.trim() || null,
          city: selectedCity,
          businessCategory,
          gstNumber: gstNumber.trim() || null,
          panNumber: panNumber.trim() || null,
          gstDocUrl: gstDocUrl.trim() || null,
          panDocUrl: panDocUrl.trim() || null,
          advancePercentage: Number(advancePercentage) || 20,
          bankUpi: bankUpi.trim() || null,
          listingTitle: listingTitle.trim() || null,
          location: vendorLocation.trim() || null,
          description: businessDescription.trim() || null,
          photos: vendorPhotos.trim()
            ? vendorPhotos.split(',').map((s: string) => s.trim()).filter(Boolean)
            : null,
          amenities: vendorAmenities.trim()
            ? vendorAmenities.split(',').map((s: string) => s.trim()).filter(Boolean)
            : null,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create vendor account')
      }

      toast.success('Vendor Partner Account created successfully! Welcome to your Dashboard.')
      setActiveVendor(data.vendor)
      setActiveTab('dashboard')
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Please try again.')
    } finally {
      setRegisterLoading(false)
    }
  }

  // 2. Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginId.trim()) {
      toast.error('Please enter your Phone number or Email')
      return
    }

    setLoginLoading(true)
    try {
      const res = await fetch('/api/vendors/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: loginId.trim(),
          password: loginPassword.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials')
      }

      toast.success(`Welcome back, ${data.vendor.businessName}!`)
      setActiveVendor(data.vendor)
      setActiveTab('dashboard')
    } catch (err: any) {
      // Passwordless lookup is only allowed when the user intentionally left
      // the password blank (legacy vendors created without a password). When a
      // password was supplied and rejected, we must NOT fall back — otherwise
      // the password is never actually enforced.
      if (!loginPassword.trim()) {
        try {
          const trackRes = await fetch(`/api/vendors/track?query=${encodeURIComponent(loginId.trim())}`)
          const trackData = await trackRes.json()
          if (trackData.success && trackData.vendor) {
            toast.success(`Welcome to Vendor Dashboard, ${trackData.vendor.businessName}!`)
            setActiveVendor(trackData.vendor)
            setActiveTab('dashboard')
            return
          }
        } catch {}
      }
      toast.error(err.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  const reloadVendorData = async () => {
    if (!activeVendor) return
    try {
      const res = await fetch(`/api/vendors/track?query=${encodeURIComponent(activeVendor.phone || activeVendor.email)}`)
      const data = await res.json()
      if (data.success && data.vendor) {
        setActiveVendor(data.vendor)
      }
    } catch {}
  }

  // 3. Add / Edit Activity Modal
  const openAddActivityModal = (cat?: string) => {
    const selectedCat = cat || activeVendor?.businessCategory || 'camping'
    const catObj = CATEGORIES.find((c) => c.id === selectedCat) || CATEGORIES[0]

    setEditingItem(null)
    setItemCategory(selectedCat)
    setItemTitle('')
    setItemMrpPrice('1500')
    setItemSellingPrice('1200')
    setItemB2bPrice('1000')
    setItemAdvancePct(String(activeVendor?.advancePercentage || '20'))
    setItemCapacity('')
    setItemPickupLocation(activeVendor?.city || 'Tapovan / Shivpuri')
    setItemSpotLocation(activeVendor?.city || 'Shivpuri')
    setItemDescription('')
    setItemHighlights('')
    setItemInclusions(catObj.popularInclusions || [])
    setItemExclusions(catObj.popularExclusions || [])
    setItemEligibility(catObj.defaultEligibility || '')
    setItemAmenities(catObj.popularAmenities || [])
    setItemPhotos([])
    setItemPhotoInput('')
    setItemTimeSlots([
      { startTime: '06:00', endTime: '09:00', capacity: 10 },
      { startTime: '10:00', endTime: '13:00', capacity: 15 },
    ])
    setShowItemModal(true)
  }

  const openEditActivityModal = (item: any) => {
    setEditingItem(item)
    setItemCategory(item.category)
    setItemTitle(item.title)
    setItemMrpPrice(String(item.mrpPrice || ''))
    setItemSellingPrice(String(item.sellingPrice || ''))
    setItemB2bPrice(String(item.b2bBasePrice || ''))
    setItemAdvancePct(String(item.advancePercentage || '20'))
    setItemCapacity(item.capacity || '')
    setItemPickupLocation(item.pickupLocation || '')
    setItemSpotLocation(item.spotLocation || '')
    setItemDescription(item.description || '')
    setItemHighlights(Array.isArray(item.highlights) ? item.highlights.join('\n') : item.highlights || '')
    setItemInclusions(Array.isArray(item.inclusions) ? item.inclusions : [])
    setItemExclusions(Array.isArray(item.exclusions) ? item.exclusions : [])
    setItemEligibility(item.eligibility || '')
    setItemAmenities(Array.isArray(item.amenities) ? item.amenities : [])
    setItemPhotos(Array.isArray(item.photos) ? item.photos : [])
    setItemPhotoInput('')
    setItemTimeSlots(
      Array.isArray(item.timeSlots) && item.timeSlots.length > 0
        ? item.timeSlots
        : [{ startTime: '06:00', endTime: '09:00', capacity: 10 }]
    )
    setShowItemModal(true)
  }

  const addTimeSlotRow = () => {
    setItemTimeSlots([
      ...itemTimeSlots,
      { startTime: '14:00', endTime: '17:00', capacity: 10 },
    ])
  }

  const removeTimeSlotRow = (index: number) => {
    if (itemTimeSlots.length <= 1) {
      toast.error('At least one time slot is required')
      return
    }
    setItemTimeSlots(itemTimeSlots.filter((_, i) => i !== index))
  }

  const updateTimeSlot = (index: number, field: string, val: any) => {
    const updated = [...itemTimeSlots]
    updated[index] = { ...updated[index], [field]: val }
    setItemTimeSlots(updated)
  }

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!itemTitle.trim() || !itemB2bPrice) {
      toast.error('Activity Title and B2B Net Price are required')
      return
    }

    setItemSaving(true)
    try {
      const b2b = Number(itemB2bPrice) || 0
      const selling = Number(itemSellingPrice) || Math.round(b2b * 1.2) || 0
      const mrp = Number(itemMrpPrice) || Math.round(selling * 1.25) || 0

      const method = editingItem ? 'PUT' : 'POST'
      const payload = {
        id: editingItem?.id,
        vendorId: activeVendor?.id,
        category: itemCategory,
        title: itemTitle.trim(),
        mrpPrice: mrp,
        sellingPrice: selling,
        b2bBasePrice: b2b,
        advancePercentage: Number(itemAdvancePct) || 20,
        capacity: itemCapacity.trim() || null,
        highlights: itemHighlights ? itemHighlights.split('\n').filter(Boolean) : [],
        inclusions: itemInclusions,
        exclusions: itemExclusions,
        eligibility: itemEligibility.trim() || null,
        timeSlots: itemTimeSlots,
        pickupLocation: itemPickupLocation.trim() || null,
        spotLocation: itemSpotLocation.trim() || null,
        amenities: itemAmenities,
        photos: itemPhotos,
        description: itemDescription.trim() || null,
        status: 'active',
      }

      const res = await fetch('/api/vendors/items', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save activity')

      toast.success(editingItem ? 'Activity updated successfully!' : 'New Activity & Time Slots added!')
      setShowItemModal(false)
      await reloadVendorData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save activity')
    } finally {
      setItemSaving(false)
    }
  }

  const handleDeleteItem = async (itemId: string, itemTitle: string) => {
    if (!confirm(`Delete listing "${itemTitle}"?`)) return
    try {
      const res = await fetch(`/api/vendors/items?id=${itemId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Activity removed')
      await reloadVendorData()
    } catch {
      toast.error('Failed to delete item')
    }
  }

  const currentCatObj = CATEGORIES.find((c) => c.id === itemCategory) || CATEGORIES[0]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-orange selection:text-white">
      <Navbar />
      <ActivityBar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden bg-gradient-to-b from-brand-teal via-brand-teal/95 to-brand-dark text-white">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-brand-orange shadow-sm">
              <Building2 className="w-3.5 h-3.5" /> Divine Travels Partner &amp; Vendor Onboarding
            </span>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto drop-shadow-sm">
              List Your Stays, Rafting &amp; Fleets. <br />
              <span className="bg-gradient-to-r from-brand-orange via-amber-300 to-brand-orange bg-clip-text text-transparent">
                Power Your Direct Bookings.
              </span>
            </h1>

            <p className="text-white/80 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed">
              Register your company, upload your verification documents, and manage your activities, 3-tier pricing, inclusions &amp; batch time slots in real time.
            </p>

            {/* Navigation Mode Switcher */}
            <div className="inline-flex items-center p-1.5 bg-black/30 backdrop-blur-lg rounded-2xl border border-white/15 max-w-md mx-auto mt-4">
              <button
                onClick={() => setActiveTab('register')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/25'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                📝 Register Partner
              </button>
              <button
                onClick={() => setActiveTab('login')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-brand-teal text-white shadow-lg shadow-brand-teal/25'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🔑 Partner Login
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" /> Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUST METRICS BAR */}
      <section className="py-5 bg-white border-b border-gray-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-dark">₹2.5 Cr+</p>
              <p className="text-xs text-gray-500 font-medium">Partner Payouts Settled</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-teal">50,000+</p>
              <p className="text-xs text-gray-500 font-medium">Verified Active Travelers</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">0%</p>
              <p className="text-xs text-gray-500 font-medium">Signup &amp; Setup Fee</p>
            </div>
            <div className="p-2">
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-orange">100%</p>
              <p className="text-xs text-gray-500 font-medium">Instant WhatsApp Connect</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: ONBOARDING & CLIENT VERIFICATION FORM (OkGhumo Architecture)    */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 flex-1 w-full">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-teal to-brand-dark p-6 sm:p-8 text-white">
              <div className="flex items-center gap-2 text-brand-orange text-xs font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full w-fit">
                <ShieldCheck className="w-4 h-4" /> Vendor Verification &amp; Onboarding Form
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-2">Partner Application for Divine Travels</h2>
              <p className="text-white/80 text-xs sm:text-sm mt-1">
                Fill in your company details, legal verification documents, and create your partner dashboard credentials.
              </p>
            </div>

            <form onSubmit={handleRegister} className="p-6 sm:p-10 space-y-8">
              {/* 1. Client / Business Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Building2 className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-serif text-lg font-bold text-gray-900">1. Client / Company Details</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Client / Business Name *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Splash Bungee / Ganga Waves Resort"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Operating Destination / City *</label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange bg-white font-medium"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Primary Business Category *</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {CATEGORIES.map((cat) => {
                      const isSelected = businessCategory === cat.id
                      const Icon = cat.icon
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setBusinessCategory(cat.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? 'border-brand-orange bg-brand-orange/5 ring-2 ring-brand-orange/20 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? 'text-brand-orange' : 'text-gray-500'}`} />
                          <p className={`text-xs font-bold ${isSelected ? 'text-brand-orange' : 'text-gray-900'}`}>
                            {cat.name}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Document Verification Uploads */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-brand-teal" /> Client Verification Documents
                    </span>
                    <span className="text-[11px] text-gray-500">PDF, JPG, PNG accepted</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">GST Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 05AAAAA0000A1Z5"
                        value={gstNumber}
                        onChange={(e) => setGstNumber(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono uppercase bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">PAN Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. ABCDE1234F"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono uppercase bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">GST Certificate Document Link / URL</label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... or Document URL"
                        value={gstDocUrl}
                        onChange={(e) => setGstDocUrl(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-gray-700 block mb-1">PAN Card Document Link / URL</label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/... or Document URL"
                        value={panDocUrl}
                        onChange={(e) => setPanDocUrl(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. User Credentials & Password */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <Users className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-serif text-lg font-bold text-gray-900">2. User Account &amp; Dashboard Credentials</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">User Name (Contact Person) *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Rawat"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">User Email *</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">User Phone Number (WhatsApp) *</label>
                    <input
                      required
                      type="tel"
                      maxLength={10}
                      placeholder="e.g. 9876543210"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Advance Booking Deposit Policy (%)</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={advancePercentage}
                        onChange={(e) => setAdvancePercentage(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold bg-white"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">%</span>
                    </div>
                  </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60">
                  <div>
                    <label className="text-xs font-bold text-emerald-950 mb-1.5 block">Dashboard Password *</label>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password..."
                        value={userPassword}
                        onChange={(e) => setUserPassword(e.target.value)}
                        className="w-full border border-emerald-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-emerald-950 mb-1.5 block">Confirm Password *</label>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Repeat your password..."
                        value={userConfirmPassword}
                        onChange={(e) => setUserConfirmPassword(e.target.value)}
                        className="w-full border border-emerald-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-semibold bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Payout UPI ID (e.g. PhonePe / GooglePay)</label>
                  <input
                    type="text"
                    placeholder="business@okaxis / 9876543210@paytm"
                    value={bankUpi}
                    onChange={(e) => setBankUpi(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono bg-white"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">🔒 Payouts are transferred automatically to this UPI upon customer trip completion.</span>
                </div>
              </div>

              {/* 3. Business Listing Details (visible to customers after approval) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <MapPin className="w-5 h-5 text-brand-orange" />
                  <h3 className="font-serif text-lg font-bold text-gray-900">3. Business Listing Details</h3>
                </div>
                <p className="text-[11px] text-gray-500 -mt-2">These details appear on your public listing once an admin approves your account.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Listing Display Title / Tagline *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ganga Waves Riverside Luxury Camp"
                      value={listingTitle}
                      onChange={(e) => setListingTitle(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Location (you can write your own) *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Badrinath Road, near Shivpuri, Rishikesh"
                      value={vendorLocation}
                      onChange={(e) => setVendorLocation(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">About Your Business</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your property / services, what makes it special..."
                    value={businessDescription}
                    onChange={(e) => setBusinessDescription(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Photo URLs (comma separated)</label>
                    <textarea
                      rows={2}
                      placeholder="https://image1.jpg, https://image2.jpg"
                      value={vendorPhotos}
                      onChange={(e) => setVendorPhotos(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Amenities / Features (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Bonfire, Parking, Meals, Wifi"
                      value={vendorAmenities}
                      onChange={(e) => setVendorAmenities(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-bold h-12 rounded-xl text-base shadow-lg shadow-brand-orange/25 transition-all flex items-center justify-center gap-2"
                >
                  {registerLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Submit Vendor Verification & Open Dashboard →'}
                </Button>
                <p className="text-center text-xs text-gray-500 mt-2.5">
                  Already registered? <button type="button" onClick={() => setActiveTab('login')} className="text-brand-orange font-bold hover:underline">Click here to Login</button>
                </p>
              </div>
            </form>
          </motion.div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: VENDOR LOGIN                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'login' && (
        <section className="py-14 sm:py-20 max-w-md mx-auto px-4 sm:px-6 flex-1 w-full">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-xl space-y-6">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-brand-teal/10 text-brand-teal rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-gray-900">Partner Portal Login</h2>
              <p className="text-gray-500 text-xs sm:text-sm">
                Enter your registered Phone/Email and Password to manage your services and time slots.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Phone Number or Email</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 9876543210 or name@business.com"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/20 focus:border-brand-teal"
                />
              </div>

              <Button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white font-bold h-11 rounded-xl text-sm shadow-md"
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Log In to Vendor Portal'}
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-gray-500 space-y-1">
              <p>Don&apos;t have an account yet? <button onClick={() => setActiveTab('register')} className="text-brand-orange font-bold hover:underline">Register New Company</button></p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: ENTERPRISE VENDOR DASHBOARD                                    */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 flex-1 w-full space-y-8">
          {!activeVendor ? (
            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl text-center max-w-lg mx-auto space-y-4">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-lg text-gray-900">Please Log In to View Dashboard</h3>
              <p className="text-xs text-gray-500">You need an active partner session to manage your stays and rafting packages.</p>
              <Button onClick={() => setActiveTab('login')} className="bg-brand-teal text-white rounded-xl px-6">
                Go to Partner Login
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Partner Business Card Header */}
              <div className="bg-gradient-to-r from-brand-teal to-brand-dark p-6 sm:p-8 rounded-3xl text-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-lg">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider text-brand-orange">
                      {activeVendor.businessCategory} Supplier
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      activeVendor.status === 'verified' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {activeVendor.status === 'verified' ? '🟢 Verified Active Partner' : '🟡 Account In Review'}
                    </span>
                    <span className="text-xs bg-white/15 px-2.5 py-0.5 rounded-full">
                      Advance Deposit: {activeVendor.advancePercentage || 20}%
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold">{activeVendor.businessName}</h3>
                  <p className="text-white/80 text-xs sm:text-sm">
                    {activeVendor.ownerName} · 📞 {activeVendor.phone} · 📍 {activeVendor.city} · Platform Commission: <strong>{activeVendor.commissionPct || 15}%</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    onClick={() => openAddActivityModal()}
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-brand-orange/20"
                  >
                    <Plus className="w-4 h-4" /> Create Activity / Package
                  </Button>
                  <Button
                    onClick={() => window.open(`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Divine Travels Team, I am ${activeVendor.ownerName} from ${activeVendor.businessName}. Regarding my vendor portal...`)}`, '_blank')}
                    variant="outline"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-10 px-4 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp Support
                  </Button>
                  <Button
                    onClick={() => setActiveVendor(null)}
                    variant="ghost"
                    className="text-white/60 hover:text-white text-xs h-10 px-3 rounded-xl"
                    title="Sign Out of Dashboard"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Multi-Item Activities / Packages Grid */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-serif text-xl font-bold text-gray-900">
                      My Listed Activities, Packages &amp; Stays ({activeVendor.items?.length || 0})
                    </h4>
                    <p className="text-xs text-gray-500">
                      Manage 3-tier pricing (MRP vs Selling vs B2B), inclusions, exclusions, and batch time slots.
                    </p>
                  </div>

                  <Button
                    onClick={() => openAddActivityModal()}
                    size="sm"
                    className="bg-brand-teal hover:bg-brand-teal/90 text-white font-bold text-xs rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add New Activity
                  </Button>
                </div>

                {(!activeVendor.items || activeVendor.items.length === 0) ? (
                  <div className="bg-white p-12 text-center text-gray-500 rounded-3xl border border-gray-200 space-y-3">
                    <Package className="w-12 h-12 text-gray-300 mx-auto" />
                    <h5 className="font-bold text-base text-gray-800">No Activities or Packages Listed Yet</h5>
                    <p className="text-xs text-gray-400 max-w-md mx-auto">
                      Click the button below to add your first camp room category, rafting stretch, or adventure activity with time slots and pricing!
                    </p>
                    <Button
                      onClick={() => openAddActivityModal()}
                      className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs rounded-xl px-5 h-9"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Create First Listing
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {activeVendor.items.map((item: any) => {
                      const catObj = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[0]
                      const Icon = catObj.icon
                      const slots = Array.isArray(item.timeSlots) ? item.timeSlots : []

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-slate-100 text-gray-700">
                                <Icon className="w-3 h-3 text-brand-teal" /> {item.category}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                item.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {item.status === 'active' ? '🟢 Active' : '⏸️ Paused'}
                              </span>
                            </div>

                            <h5 className="font-bold text-sm text-gray-900 line-clamp-2">{item.title}</h5>

                            {/* 3-Tier Pricing Card */}
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-200/80 grid grid-cols-3 gap-1 text-center text-xs">
                              <div>
                                <span className="text-[10px] text-gray-400 block line-through">MRP</span>
                                <span className="text-xs text-gray-500 font-semibold">₹{item.mrpPrice?.toLocaleString() || '—'}</span>
                              </div>
                              <div className="border-x border-gray-200">
                                <span className="text-[10px] text-gray-500 font-bold block">Selling</span>
                                <span className="text-xs font-bold text-gray-900">₹{item.sellingPrice?.toLocaleString()}</span>
                              </div>
                              <div className="bg-emerald-100/60 rounded-md py-0.5">
                                <span className="text-[10px] text-emerald-800 font-bold block uppercase">Net B2B</span>
                                <span className="text-xs font-extrabold text-emerald-700">₹{item.b2bBasePrice?.toLocaleString()}</span>
                              </div>
                            </div>

                            {/* Time slots preview */}
                            {slots.length > 0 && (
                              <div className="text-xs text-gray-600 space-y-1">
                                <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-brand-teal" /> {slots.length} Batch Time Slots:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {slots.map((s: any, idx: number) => (
                                    <span key={idx} className="text-[10px] bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded font-mono font-semibold">
                                      {s.startTime}-{s.endTime} ({s.capacity}pax)
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Inclusions summary */}
                            {item.inclusions && Array.isArray(item.inclusions) && item.inclusions.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {item.inclusions.slice(0, 2).map((inc: string) => (
                                  <span key={inc} className="text-[10px] bg-slate-100 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5 text-emerald-600" /> {inc}
                                  </span>
                                ))}
                                {item.inclusions.length > 2 && (
                                  <span className="text-[10px] text-gray-400 font-medium">+{item.inclusions.length - 2} more</span>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                            <span className="text-[10px] text-gray-400 font-mono">{item.id}</span>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditActivityModal(item)}
                                className="h-7 px-2 text-xs rounded-lg flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3 text-gray-600" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteItem(item.id, item.title)}
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT ACTIVITY (OkGhumo Full Experience)                   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-brand-teal to-brand-dark p-6 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">{editingItem ? 'Edit Activity / Stay' : 'Create Your Activity & Time Slots'}</h3>
                  <p className="text-xs text-white/80 mt-0.5">Under {activeVendor?.businessName}</p>
                </div>
                <button onClick={() => setShowItemModal(false)} className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
                {/* 1. Category & Title */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-gray-800 block mb-1">Category *</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => {
                        setItemCategory(e.target.value)
                        const cat = CATEGORIES.find((c) => c.id === e.target.value)
                        if (cat) {
                          setItemInclusions(cat.popularInclusions || [])
                          setItemExclusions(cat.popularExclusions || [])
                          setItemEligibility(cat.defaultEligibility || '')
                          setItemAmenities(cat.popularAmenities || [])
                        }
                      }}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold bg-white"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-bold text-gray-800 block mb-1">Activity / Listing Title *</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 111m Bungee Jump / 16KM Shivpuri Rafting / Luxury AC Swiss Tent"
                      value={itemTitle}
                      onChange={(e) => setItemTitle(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold"
                    />
                  </div>
                </div>

                {/* 2. OkGhumo 3-Tier Pricing Structure */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> 3-Tier Pricing &amp; Commission
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">Automatic Margin Calculation</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="font-semibold text-gray-600 block mb-1">MRP (₹)</label>
                      <input
                        type="number"
                        placeholder="1500"
                        value={itemMrpPrice}
                        onChange={(e) => setItemMrpPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-800 block mb-1">Selling Price (₹)</label>
                      <input
                        type="number"
                        placeholder="1200"
                        value={itemSellingPrice}
                        onChange={(e) => setItemSellingPrice(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-emerald-900 block mb-1">B2B Net Rate (₹) *</label>
                      <input
                        required
                        type="number"
                        placeholder="1000"
                        value={itemB2bPrice}
                        onChange={(e) => {
                          const val = e.target.value
                          setItemB2bPrice(val)
                          if (val && !itemSellingPrice) setItemSellingPrice(String(Math.round(Number(val) * 1.2)))
                          if (val && !itemMrpPrice) setItemMrpPrice(String(Math.round(Number(val) * 1.5)))
                        }}
                        className="w-full border border-emerald-400 rounded-xl px-3 py-2 font-extrabold text-emerald-800 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-600 block mb-1">Advance Deposit (%)</label>
                      <input
                        type="number"
                        placeholder="20"
                        value={itemAdvancePct}
                        onChange={(e) => setItemAdvancePct(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Time Slots Batch Builder */}
                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-600" /> Time Slots &amp; Batch Capacities
                    </span>
                    <button
                      type="button"
                      onClick={addTimeSlotRow}
                      className="text-xs font-bold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Slot
                    </button>
                  </div>

                  <div className="space-y-2">
                    {itemTimeSlots.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-blue-200">
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 block">Start Time</label>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(idx, 'startTime', e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono font-bold"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] text-gray-400 block">End Time</label>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(idx, 'endTime', e.target.value)}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-mono font-bold"
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-[10px] text-gray-400 block">Capacity (Pax)</label>
                          <input
                            type="number"
                            min="1"
                            value={slot.capacity}
                            onChange={(e) => updateTimeSlot(idx, 'capacity', Number(e.target.value))}
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs font-bold"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTimeSlotRow(idx)}
                          className="w-7 h-7 mt-3 text-red-500 hover:bg-red-50 rounded-lg flex items-center justify-center font-bold"
                          title="Remove Slot"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Pick-up & Spot Locations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Pick-up Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Tapovan Office / Hotel Pickup"
                      value={itemPickupLocation}
                      onChange={(e) => setItemPickupLocation(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Spot / Activity Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Marine Drive / Shivpuri Jump Point"
                      value={itemSpotLocation}
                      onChange={(e) => setItemSpotLocation(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                {/* 5. Inclusions & Exclusions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Inclusions (What&apos;s Included)</label>
                    <textarea
                      rows={3}
                      placeholder="Enter inclusions line by line..."
                      value={itemInclusions.join('\n')}
                      onChange={(e) => setItemInclusions(e.target.value.split('\n').filter(Boolean))}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-sans"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Exclusions (What&apos;s NOT Included)</label>
                    <textarea
                      rows={3}
                      placeholder="Enter exclusions line by line..."
                      value={itemExclusions.join('\n')}
                      onChange={(e) => setItemExclusions(e.target.value.split('\n').filter(Boolean))}
                      className="w-full border border-gray-200 rounded-xl p-2.5 text-xs font-sans"
                    />
                  </div>
                </div>

                {/* 6. Eligibility & Safety Guidelines */}
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Eligibility &amp; Safety Guidelines</label>
                  <input
                    type="text"
                    placeholder="e.g. Age: 14 to 60 Yrs. Weight: 35kg to 110kg. Not allowed for heart patients."
                    value={itemEligibility}
                    onChange={(e) => setItemEligibility(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                {/* 7. Description */}
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Description &amp; Highlights</label>
                  <textarea
                    rows={2}
                    placeholder="Provide a compelling overview of this activity/room package..."
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-2.5 text-xs"
                  />
                </div>

                {/* Submit / Cancel Buttons */}
                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowItemModal(false)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={itemSaving}
                    className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl"
                  >
                    {itemSaving ? 'Saving Activity...' : editingItem ? 'Update Activity' : 'Save & Publish Activity'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQs */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900">
              Partner Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'How does 3-Tier Pricing (MRP vs Selling vs B2B) work?',
                a: 'You enter your agreed Net B2B Rate (the exact amount credited to your bank account). Our system automatically calculates the website selling price and MRP with platform commission and discounts.',
              },
              {
                q: 'Can I define custom batch time slots for Rafting or Bungee?',
                a: 'Yes! You can create multiple daily time slots (e.g. 06:00 AM, 10:00 AM, 02:00 PM) and set individual pax capacities per batch.',
              },
              {
                q: 'What documents are required for vendor verification?',
                a: 'You can upload your GST Registration Certificate, Company PAN Card, and Tourism Operating License during onboarding.',
              },
              {
                q: 'When do I get my payout for completed bookings?',
                a: 'Payouts are transferred directly to your registered UPI ID or Bank Account immediately after the customer completes their stay or tour without deductions.',
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
