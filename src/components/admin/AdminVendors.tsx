'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2, Tent, Waves, Hotel, Bike, Zap, Car, Compass, Search,
  CheckCircle2, Clock, XCircle, RefreshCw, MessageCircle, ExternalLink,
  Edit3, Trash2, Check, AlertCircle, DollarSign, Users, Award, MapPin,
  Phone, Mail, Tag, Eye, ChevronDown, Sparkles, Package, Plus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface VendorItemType {
  id: string
  vendorId: string
  category: string
  title: string
  mrpPrice?: number
  b2bBasePrice: number
  sellingPrice: number
  advancePercentage?: number
  capacity?: string | null
  amenities?: string[]
  photos?: string[]
  description?: string | null
  specifications?: Record<string, any>
  highlights?: string[] | string | null
  inclusions?: string[] | string | null
  exclusions?: string[] | string | null
  eligibility?: string | null
  pickupLocation?: string | null
  spotLocation?: string | null
  status: 'active' | 'paused' | 'inactive'
}

interface VendorItem {
  id: string
  businessName: string
  ownerName: string
  phone: string
  email: string
  city: string
  businessCategory: string
  gstNumber?: string | null
  panNumber?: string | null
  experienceYears?: string | null
  bankUpi?: string | null
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
  commissionPct: number
  adminNotes?: string | null
  listingTitle: string
  location: string
  b2bBasePrice: number
  sellingPrice: number
  capacity?: string | null
  amenities?: string[]
  photos?: string[]
  description?: string | null
  specifications?: Record<string, any>
  items?: VendorItemType[]
  createdAt: string
}

const CATEGORY_ICONS: Record<string, any> = {
  camping: Tent,
  rafting: Waves,
  hotel: Hotel,
  'bike-rental': Bike,
  adventure: Zap,
  trekking: Compass,
  taxi: Car,
}

export function AdminVendors() {
  const [vendors, setVendors] = useState<VendorItem[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    verified: 0,
    totalListings: 0,
    byCategory: { camping: 0, rafting: 0, hotel: 0, bikeRental: 0, adventure: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedVendorId, setExpandedVendorId] = useState<string | null>(null)

  // Edit / Verification modal state
  const [selectedVendor, setSelectedVendor] = useState<VendorItem | null>(null)
  const [editStatus, setEditStatus] = useState<'pending' | 'verified' | 'rejected' | 'suspended'>('pending')
  const [editCommissionPct, setEditCommissionPct] = useState(15)
  const [editB2bBasePrice, setEditB2bBasePrice] = useState(0)
  const [editSellingPrice, setEditSellingPrice] = useState(0)
  const [editNotes, setEditNotes] = useState('')
  // Extended profile fields admin can correct
  const [editBusinessName, setEditBusinessName] = useState('')
  const [editOwnerName, setEditOwnerName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editCity, setEditCity] = useState('')
  const [editListingTitle, setEditListingTitle] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editBankUpi, setEditBankUpi] = useState('')
  const [editGstNumber, setEditGstNumber] = useState('')
  const [editPanNumber, setEditPanNumber] = useState('')
  const [saving, setSaving] = useState(false)

  // Per-item edit modal state
  const [editingItem, setEditingItem] = useState<VendorItemType | null>(null)
  const [itemEditTitle, setItemEditTitle] = useState('')
  const [itemEditCategory, setItemEditCategory] = useState('camping')
  const [itemEditMrp, setItemEditMrp] = useState(0)
  const [itemEditSelling, setItemEditSelling] = useState(0)
  const [itemEditB2b, setItemEditB2b] = useState(0)
  const [itemEditAdvance, setItemEditAdvance] = useState(20)
  const [itemEditCapacity, setItemEditCapacity] = useState('')
  const [itemEditDescription, setItemEditDescription] = useState('')
  const [itemEditPickup, setItemEditPickup] = useState('')
  const [itemEditSpot, setItemEditSpot] = useState('')
  const [itemEditStatus, setItemEditStatus] = useState<'active' | 'paused' | 'inactive'>('active')
  const [itemEditHighlights, setItemEditHighlights] = useState('')
  const [itemEditInclusions, setItemEditInclusions] = useState('')
  const [itemEditExclusions, setItemEditExclusions] = useState('')
  const [itemEditEligibility, setItemEditEligibility] = useState('')
  const [itemEditAmenities, setItemEditAmenities] = useState('')
  const [itemEditPhotos, setItemEditPhotos] = useState('')
  const [savingItem, setSavingItem] = useState(false)

  const fetchVendors = async () => {
    setLoading(true)
    try {
      let url = '/api/admin/vendors?'
      if (statusFilter !== 'all') url += `status=${statusFilter}&`
      if (categoryFilter !== 'all') url += `category=${categoryFilter}&`
      if (searchQuery.trim()) url += `search=${encodeURIComponent(searchQuery.trim())}&`

      const res = await fetch(url)
      const data = await res.json()
      if (data.success) {
        setVendors(data.vendors || [])
        if (data.stats) setStats(data.stats)
      }
    } catch (err) {
      console.error('Error fetching vendors:', err)
      toast.error('Failed to load vendor partners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [statusFilter, categoryFilter])

  const handleOpenEdit = (v: VendorItem) => {
    setSelectedVendor(v)
    setEditStatus(v.status)
    setEditCommissionPct(v.commissionPct || 15)
    setEditB2bBasePrice(v.b2bBasePrice || 0)
    setEditSellingPrice(v.sellingPrice || 0)
    setEditNotes(v.adminNotes || '')
    setEditBusinessName(v.businessName || '')
    setEditOwnerName(v.ownerName || '')
    setEditPhone(v.phone || '')
    setEditEmail(v.email || '')
    setEditCity(v.city || '')
    setEditListingTitle(v.listingTitle || '')
    setEditLocation(v.location || '')
    setEditDescription(v.description || '')
    setEditBankUpi(v.bankUpi || '')
    setEditGstNumber(v.gstNumber || '')
    setEditPanNumber(v.panNumber || '')
  }

  const openItemEdit = (item: VendorItemType) => {
    setEditingItem(item)
    setItemEditTitle(item.title || '')
    setItemEditCategory(item.category || 'camping')
    setItemEditMrp(item.mrpPrice || 0)
    setItemEditSelling(item.sellingPrice || 0)
    setItemEditB2b(item.b2bBasePrice || 0)
    setItemEditAdvance(item.advancePercentage || 20)
    setItemEditCapacity(item.capacity || '')
    setItemEditDescription(item.description || '')
    setItemEditPickup(item.pickupLocation || '')
    setItemEditSpot(item.spotLocation || '')
    setItemEditStatus((item.status === 'paused' ? 'paused' : item.status === 'inactive' ? 'inactive' : 'active') as any)
    setItemEditHighlights(Array.isArray(item.highlights) ? item.highlights.join('\n') : (item.highlights || ''))
    setItemEditInclusions(Array.isArray(item.inclusions) ? item.inclusions.join('\n') : (item.inclusions || ''))
    setItemEditExclusions(Array.isArray(item.exclusions) ? item.exclusions.join('\n') : (item.exclusions || ''))
    setItemEditEligibility(item.eligibility || '')
    setItemEditAmenities(Array.isArray(item.amenities) ? item.amenities.join(', ') : (item.amenities || ''))
    setItemEditPhotos(Array.isArray(item.photos) ? item.photos.join(', ') : (item.photos || ''))
  }

  const parseList = (val: string) =>
    val.split('\n').map((s) => s.trim()).filter(Boolean)

  const parseComma = (val: string) =>
    val.split(',').map((s) => s.trim()).filter(Boolean)

  const handleSaveItemEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    setSavingItem(true)
    try {
      const res = await fetch('/api/vendors/items', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingItem.id,
          title: itemEditTitle,
          category: itemEditCategory,
          mrpPrice: Number(itemEditMrp) || 0,
          sellingPrice: Number(itemEditSelling) || 0,
          b2bBasePrice: Number(itemEditB2b) || 0,
          advancePercentage: Number(itemEditAdvance) || 20,
          capacity: itemEditCapacity || null,
          description: itemEditDescription || null,
          pickupLocation: itemEditPickup || null,
          spotLocation: itemEditSpot || null,
          status: itemEditStatus,
          highlights: parseList(itemEditHighlights),
          inclusions: parseList(itemEditInclusions),
          exclusions: parseList(itemEditExclusions),
          eligibility: itemEditEligibility || null,
          amenities: parseComma(itemEditAmenities),
          photos: parseComma(itemEditPhotos),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update item')
      toast.success('Listing item updated')
      setEditingItem(null)
      fetchVendors()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update item')
    } finally {
      setSavingItem(false)
    }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVendor) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/vendors/${selectedVendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          commissionPct: Number(editCommissionPct),
          b2bBasePrice: Number(editB2bBasePrice),
          sellingPrice: Number(editSellingPrice),
          adminNotes: editNotes,
          businessName: editBusinessName,
          ownerName: editOwnerName,
          phone: editPhone,
          email: editEmail,
          city: editCity,
          listingTitle: editListingTitle,
          location: editLocation,
          description: editDescription,
          bankUpi: editBankUpi,
          gstNumber: editGstNumber || null,
          panNumber: editPanNumber || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to update vendor')

      toast.success(`Updated status for ${selectedVendor.businessName}`)
      setSelectedVendor(null)
      fetchVendors()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vendor partner')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete vendor partner "${name}" and all its listings?`)) return
    try {
      const res = await fetch(`/api/admin/vendors/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Vendor partner deleted')
      fetchVendors()
    } catch {
      toast.error('Failed to delete vendor partner')
    }
  }

  const openWhatsApp = (v: VendorItem) => {
    const cleanPhone = v.phone.replace(/[^0-9]/g, '')
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    const text = encodeURIComponent(
      `Hi ${v.ownerName}, greetings from Divine Travels Rishikesh! We received your vendor listing application for "${v.businessName}" (${v.listingTitle}). We are reviewing your property and would like to discuss next steps with you.`
    )
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank')
  }

  const toggleExpand = (id: string) => {
    setExpandedVendorId(expandedVendorId === id ? null : id)
  }

  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      v.businessName.toLowerCase().includes(q) ||
      v.ownerName.toLowerCase().includes(q) ||
      v.phone.includes(q) ||
      v.email.toLowerCase().includes(q) ||
      v.listingTitle.toLowerCase().includes(q) ||
      v.location.toLowerCase().includes(q)
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Building2 className="w-5 h-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vendors &amp; Supply Partners</h1>
            <p className="text-xs text-gray-500">
              Manage third-party riverside camps, rafting companies, hotels, and bike fleets listing on Divine Travels
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchVendors}
            variant="outline"
            size="sm"
            className="rounded-xl flex items-center gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <a
            href="/experiences"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-brand-teal hover:bg-brand-teal/90 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Public Listings Page <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800 font-bold uppercase">🟡 Pending Review</p>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">{stats.pending}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-bold uppercase">🟢 Active Partners</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.verified}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <p className="text-xs text-gray-500 font-medium">Total Listed Inventory Items</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">
            📦 {stats.totalListings || 0} Items
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {[
              { id: 'all', label: 'All Partners' },
              { id: 'pending', label: '🟡 Pending Review' },
              { id: 'verified', label: '🟢 Verified Active' },
              { id: 'rejected', label: '🔴 Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-brand-orange text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search vendor, owner, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase mr-1">Category:</span>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'camping', label: '🏕️ Camping' },
            { id: 'rafting', label: '🌊 Rafting' },
            { id: 'hotel', label: '🏨 Hotels' },
            { id: 'bike-rental', label: '🏍️ Bikes' },
            { id: 'adventure', label: '🪂 Adventure' },
            { id: 'taxi', label: '🚕 Taxis' },
            { id: 'trekking', label: '🏔️ Trekking' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                categoryFilter === c.id
                  ? 'bg-brand-teal text-white font-bold'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors List */}
      {loading ? (
        <div className="bg-white p-12 text-center text-gray-400 rounded-2xl border border-gray-100">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-orange" />
          <p className="text-xs">Loading vendor partners...</p>
        </div>
      ) : filteredVendors.length === 0 ? (
        <div className="bg-white p-12 text-center text-gray-500 rounded-2xl border border-gray-100 space-y-2">
          <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-base text-gray-800">No Vendor Partners Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            When third-party hoteliers, camps, and rafting operators register on /partner, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVendors.map((v) => {
            const Icon = CATEGORY_ICONS[v.businessCategory] || Building2
            const isExpanded = expandedVendorId === v.id
            const itemsCount = v.items?.length || 1

            return (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Left: Vendor Profile */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-brand-teal/10 text-brand-teal">
                        <Icon className="w-3 h-3" /> {v.businessCategory}
                      </span>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        v.status === 'verified'
                          ? 'bg-emerald-100 text-emerald-700'
                          : v.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {v.status === 'verified' ? '🟢 Verified Active' : v.status === 'pending' ? '🟡 Pending Review' : '🔴 Rejected'}
                      </span>

                      <span className="text-purple-700 bg-purple-50 font-bold text-[10px] px-2 py-0.5 rounded-md border border-purple-200 flex items-center gap-1">
                        <Package className="w-3 h-3" /> {itemsCount} Listed Items / Fleet
                      </span>

                      <span className="text-gray-400 text-xs font-mono">{v.id}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">{v.businessName}</h3>

                    {/* Contact & Location Info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <span className="font-semibold text-gray-800 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-gray-400" /> {v.ownerName}
                      </span>
                      <a href={`tel:${v.phone}`} className="flex items-center gap-1 text-blue-600 font-medium hover:underline">
                        <Phone className="w-3.5 h-3.5" /> {v.phone}
                      </a>
                      <span className="flex items-center gap-1 text-gray-500">
                        <Mail className="w-3.5 h-3.5" /> {v.email}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-red-500" /> {v.city}
                      </span>
                    </div>

                    {/* Listing & Pricing Details Box */}
                    <div className="bg-slate-50 p-3.5 rounded-xl text-xs space-y-1.5 text-gray-700 border border-gray-100">
                      <p className="font-semibold text-gray-900">
                        <strong>Primary Listing:</strong> {v.listingTitle}
                      </p>
                      <p className="text-gray-600">
                        <strong>Location:</strong> {v.location} {v.capacity ? `· Capacity: ${v.capacity}` : ''}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                          Vendor Net Rate: ₹{v.b2bBasePrice?.toLocaleString()}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-bold">
                          Selling Price: ₹{v.sellingPrice?.toLocaleString()}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md font-bold">
                          Platform Commission: {v.commissionPct || 15}%
                        </span>
                        {v.bankUpi && (
                          <span className="text-gray-500 font-mono">
                            UPI: {v.bankUpi}
                          </span>
                        )}
                      </div>

                      {v.adminNotes && (
                        <p className="p-2 bg-amber-50 text-amber-900 rounded-lg border border-amber-200 text-[11px] mt-1">
                          <strong>Admin Note:</strong> {v.adminNotes}
                        </p>
                      )}
                    </div>

                    {/* Expandable Multi-Item Bar */}
                    {v.items && v.items.length > 0 && (
                      <div className="pt-1">
                        <button
                          onClick={() => toggleExpand(v.id)}
                          className="text-xs font-bold text-brand-orange hover:text-brand-orange/80 flex items-center gap-1.5"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Multi-Item Inventory' : `View All ${v.items.length} Listed Items & Fleet Rates`}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex lg:flex-col items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => openWhatsApp(v)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 h-9 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </Button>

                    <Button
                      onClick={() => handleOpenEdit(v)}
                      variant="outline"
                      className="font-semibold text-xs px-3.5 h-9 rounded-xl flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-600" /> Verify / Edit
                    </Button>

                    <Button
                      onClick={() => handleDelete(v.id, v.businessName)}
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2.5 h-9 rounded-xl"
                      title="Delete vendor"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* EXPANDABLE MULTI-ITEM TABLE */}
                {isExpanded && v.items && (
                  <div className="bg-slate-100/70 border-t border-gray-200 p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-brand-teal" />
                      All Inventory Items &amp; Fleets Under {v.businessName} ({v.items.length} Total)
                    </p>
                    <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                      <table className="w-full text-xs text-left text-gray-600">
                         <thead className="bg-slate-50 text-gray-700 font-bold uppercase text-[11px]">
                           <tr>
                             <th className="px-4 py-2.5">Category</th>
                             <th className="px-4 py-2.5">Listing Title / Name</th>
                             <th className="px-4 py-2.5">Capacity</th>
                             <th className="px-4 py-2.5">Vendor Net Rate</th>
                             <th className="px-4 py-2.5">Selling Price</th>
                             <th className="px-4 py-2.5">Status</th>
                             <th className="px-4 py-2.5 text-right">Action</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {v.items.map((item) => (
                             <tr key={item.id} className="hover:bg-slate-50">
                               <td className="px-4 py-2.5 font-bold uppercase text-brand-teal text-[10px]">
                                 {item.category}
                               </td>
                               <td className="px-4 py-2.5 font-medium text-gray-900">
                                 {item.title}
                                 {item.description && (
                                   <p className="text-[10px] text-gray-400 font-normal mt-0.5 line-clamp-1">{item.description}</p>
                                 )}
                               </td>
                               <td className="px-4 py-2.5 text-gray-500">{item.capacity || '—'}</td>
                               <td className="px-4 py-2.5 font-bold text-emerald-700">₹{item.b2bBasePrice?.toLocaleString()}</td>
                               <td className="px-4 py-2.5 font-bold text-gray-900">₹{item.sellingPrice?.toLocaleString()}</td>
                               <td className="px-4 py-2.5">
                                 <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-700">
                                   {item.status === 'active' ? '🟢 Active' : item.status === 'paused' ? '⏸️ Paused' : '⏸️ Inactive'}
                                 </span>
                               </td>
                               <td className="px-4 py-2.5 text-right">
                                 <Button
                                   type="button"
                                   variant="ghost"
                                   size="sm"
                                   onClick={() => openItemEdit(item)}
                                   className="text-brand-orange hover:text-brand-orange/80 hover:bg-brand-orange/10 h-7 px-2 text-[11px]"
                                 >
                                   <Edit3 className="w-3 h-3 mr-1" /> Edit
                                 </Button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Edit / Verify Modal */}
      <AnimatePresence>
        {selectedVendor && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="bg-gradient-to-r from-brand-teal to-brand-dark p-6 text-white">
                <h3 className="font-bold text-lg">Verify &amp; Manage Vendor Partner</h3>
                <p className="text-xs text-white/80 mt-0.5">{selectedVendor.businessName} ({selectedVendor.businessCategory})</p>
              </div>

              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
                {/* Status selector */}
                <div>
                  <label className="font-bold text-gray-800 block mb-1">Partner Verification Status *</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold bg-white"
                  >
                    <option value="pending">🟡 Pending Review (Not yet published)</option>
                    <option value="verified">🟢 Verified Partner (Active &amp; Approved)</option>
                    <option value="rejected">🔴 Rejected</option>
                    <option value="suspended">⏸️ Suspended</option>
                  </select>
                </div>

                {/* Commission % & Pricing */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Commission %</label>
                    <input
                      type="number"
                      value={editCommissionPct}
                      onChange={(e) => setEditCommissionPct(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Vendor Net Rate (₹)</label>
                    <input
                      type="number"
                      value={editB2bBasePrice}
                      onChange={(e) => setEditB2bBasePrice(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Selling Price (₹)</label>
                    <input
                      type="number"
                      value={editSellingPrice}
                      onChange={(e) => setEditSellingPrice(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold"
                    />
                  </div>
                </div>

                {/* Vendor submitted profile fields (admin can correct if wrong) */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-gray-200">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5" /> Vendor Profile Details (editable — fix if vendor entered wrong)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Business Name</label>
                      <input value={editBusinessName} onChange={(e) => setEditBusinessName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Listing Title / Tagline</label>
                      <input value={editListingTitle} onChange={(e) => setEditListingTitle(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Owner Name</label>
                      <input value={editOwnerName} onChange={(e) => setEditOwnerName(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Phone (WhatsApp)</label>
                      <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white font-mono" />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Email</label>
                      <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">City</label>
                      <input value={editCity} onChange={(e) => setEditCity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-gray-700 block mb-1">Location (as written by vendor)</label>
                      <input value={editLocation} onChange={(e) => setEditLocation(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-gray-700 block mb-1">Description</label>
                      <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Payout UPI</label>
                      <input value={editBankUpi} onChange={(e) => setEditBankUpi(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white font-mono" />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">GST / PAN</label>
                      <div className="flex gap-2">
                        <input value={editGstNumber} onChange={(e) => setEditGstNumber(e.target.value)} placeholder="GST" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white font-mono uppercase" />
                        <input value={editPanNumber} onChange={(e) => setEditPanNumber(e.target.value)} placeholder="PAN" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-white font-mono uppercase" />
                      </div>
                    </div>
                  </div>

                  {selectedVendor && (
                    <div className="text-[11px] text-gray-500 bg-white rounded-lg border border-gray-100 p-2.5 space-y-1">
                      <p className="font-bold text-gray-700 uppercase tracking-wide">Read-only submitted data</p>
                      {selectedVendor.amenities && Array.isArray(selectedVendor.amenities) && selectedVendor.amenities.length > 0 && (
                        <p><strong>Amenities:</strong> {selectedVendor.amenities.join(', ')}</p>
                      )}
                      {selectedVendor.photos && Array.isArray(selectedVendor.photos) && selectedVendor.photos.length > 0 && (
                        <p><strong>Photos:</strong> {selectedVendor.photos.length} uploaded</p>
                      )}
                      {selectedVendor.experienceYears && <p><strong>Experience:</strong> {selectedVendor.experienceYears} yrs</p>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Admin Verification Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Property verified over WhatsApp. Rate confirmed at ₹1,800 net. Photos verified."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedVendor(null)}
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl"
                  >
                    {saving ? 'Saving...' : 'Save & Update'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item edit modal — admin can correct any listing the vendor submitted */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="bg-gradient-to-r from-brand-orange to-brand-dark p-6 text-white sticky top-0">
                <h3 className="font-bold text-lg">Correct Vendor Listing</h3>
                <p className="text-xs text-white/80 mt-0.5">{editingItem.title} · {editingItem.category}</p>
              </div>

              <form onSubmit={handleSaveItemEdit} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Listing Title / Name</label>
                    <input value={itemEditTitle} onChange={(e) => setItemEditTitle(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Category</label>
                    <select value={itemEditCategory} onChange={(e) => setItemEditCategory(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                      {['camping', 'rafting', 'hotel', 'bike-rental', 'adventure', 'trekking', 'taxi'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Status</label>
                    <select value={itemEditStatus} onChange={(e) => setItemEditStatus(e.target.value as any)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white">
                      <option value="active">🟢 Active (Live)</option>
                      <option value="paused">⏸️ Paused</option>
                      <option value="inactive">⏸️ Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">MRP (₹)</label>
                    <input type="number" value={itemEditMrp} onChange={(e) => setItemEditMrp(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold bg-white" />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Selling Price (₹)</label>
                    <input type="number" value={itemEditSelling} onChange={(e) => setItemEditSelling(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold bg-white" />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Vendor Net Rate (₹)</label>
                    <input type="number" value={itemEditB2b} onChange={(e) => setItemEditB2b(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold bg-white" />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Advance %</label>
                    <input type="number" value={itemEditAdvance} onChange={(e) => setItemEditAdvance(Number(e.target.value))} className="w-full border border-gray-200 rounded-xl px-3 py-2 font-bold bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Capacity</label>
                    <input value={itemEditCapacity} onChange={(e) => setItemEditCapacity(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Description</label>
                    <textarea value={itemEditDescription} onChange={(e) => setItemEditDescription(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Pickup Location</label>
                    <input value={itemEditPickup} onChange={(e) => setItemEditPickup(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Spot / Activity Location</label>
                    <input value={itemEditSpot} onChange={(e) => setItemEditSpot(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Eligibility / Who can join</label>
                    <input value={itemEditEligibility} onChange={(e) => setItemEditEligibility(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Highlights (one per line)</label>
                    <textarea value={itemEditHighlights} onChange={(e) => setItemEditHighlights(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Inclusions (one per line)</label>
                    <textarea value={itemEditInclusions} onChange={(e) => setItemEditInclusions(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Exclusions (one per line)</label>
                    <textarea value={itemEditExclusions} onChange={(e) => setItemEditExclusions(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Amenities (comma separated)</label>
                    <input value={itemEditAmenities} onChange={(e) => setItemEditAmenities(e.target.value)} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Photo URLs (comma separated)</label>
                    <textarea value={itemEditPhotos} onChange={(e) => setItemEditPhotos(e.target.value)} rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono bg-white" />
                  </div>
                </div>

                <div className="flex gap-2 pt-3 sticky bottom-0 bg-white">
                  <Button type="button" variant="outline" onClick={() => setEditingItem(null)} className="flex-1 rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingItem} className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl">
                    {savingItem ? 'Saving...' : 'Save Corrections'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
