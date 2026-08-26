'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Instagram, Youtube, CheckCircle2, XCircle, Clock, Search,
  Filter, Tag, MessageCircle, ExternalLink, Trash2, Edit3, Save,
  Check, RefreshCw, UserCheck, Phone, Mail, Award, DollarSign, Calendar,
  ChevronRight, ChevronDown, X, AlertCircle, Zap, Gift, Flame, Users,
  Receipt, ArrowUpRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BookingRecord {
  id: string
  customerName: string
  customerPhone: string
  packageName: string
  totalPrice: number
  discount: number
  status: string
  bookedAt: string
}

interface TrackingData {
  usedCount: number
  completedCount?: number
  pendingCount?: number
  completedSales?: number
  pendingSales?: number
  totalSales?: number
  payableCommission?: number
  pendingCommission?: number
  commissionEarned?: number
  bookings: BookingRecord[]
}

interface CollaborationItem {
  id: string
  name: string
  email: string
  phone: string
  instagram: string | null
  youtube: string | null
  followersCount: string
  niche: string
  collaborationType: 'barter' | 'affiliate' | 'paid' | string
  selectedFreeActivity: string | null
  expectedBudget: string | null
  proposedCoupon: string | null
  deliverables: string | null
  travelDates: string | null
  message: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  assignedCoupon: string | null
  commissionPct: number | null
  adminNotes: string | null
  createdAt: string
  updatedAt: string
  tracking?: TrackingData
}

interface Stats {
  total: number
  pending: number
  approved: number
  barter: number
  affiliate: number
  paid?: number
}

export function AdminCollaborations() {
  const [collaborations, setCollaborations] = useState<CollaborationItem[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, barter: 0, affiliate: 0, paid: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedBookings, setExpandedBookings] = useState<Record<string, boolean>>({})

  // Edit modal state
  const [selectedItem, setSelectedItem] = useState<CollaborationItem | null>(null)
  const [editCoupon, setEditCoupon] = useState('')
  const [editCommission, setEditCommission] = useState(10)
  const [editFreeActivity, setEditFreeActivity] = useState('')
  const [editBudget, setEditBudget] = useState('')
  const [editStatus, setEditStatus] = useState<string>('pending')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchCollaborations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (typeFilter !== 'all') params.set('type', typeFilter)

      const res = await fetch(`/api/admin/collaborations?${params.toString()}`)
      const data = await res.json()
      if (data.success) {
        setCollaborations(data.applications || [])
        setStats(data.stats || { total: 0, pending: 0, approved: 0, barter: 0, affiliate: 0, paid: 0 })
      }
    } catch {
      toast.error('Failed to load collaborations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCollaborations()
  }, [statusFilter, typeFilter])

  const toggleBookings = (id: string) => {
    setExpandedBookings((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleOpenEdit = (item: CollaborationItem) => {
    setSelectedItem(item)
    const defaultCode = (
      item.assignedCoupon ||
      item.proposedCoupon ||
      item.name.split(' ')[0] + '10'
    ).toUpperCase().replace(/[^A-Z0-9]/g, '')

    setEditCoupon(defaultCode)
    setEditCommission(item.commissionPct || 10)
    setEditFreeActivity(item.selectedFreeActivity || "🪂 India's Highest Bungee Jump (Rishikesh - 83m/113m)")
    setEditBudget(item.expectedBudget || '')
    setEditStatus(item.status)
    setEditNotes(item.adminNotes || '')
  }

  const handleSaveEdit = async () => {
    if (!selectedItem) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/collaborations/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: editStatus,
          assignedCoupon: editCoupon.trim().toUpperCase() || null,
          commissionPct: editCommission,
          selectedFreeActivity: editFreeActivity.trim() || null,
          expectedBudget: editBudget.trim() || null,
          adminNotes: editNotes.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')

      toast.success('Collaboration updated successfully')
      setSelectedItem(null)
      fetchCollaborations()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete application from "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/collaborations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Application deleted')
        fetchCollaborations()
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const openWhatsApp = (item: CollaborationItem) => {
    const cleanPhone = item.phone.replace(/[^0-9]/g, '')
    const targetPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone
    
    let detailText = ''
    if (item.collaborationType === 'barter' && item.selectedFreeActivity) {
      detailText = `regarding your complimentary "${item.selectedFreeActivity}" request`
    } else if (item.collaborationType === 'affiliate') {
      detailText = `regarding your 10% creator affiliate promo code (${item.assignedCoupon || item.proposedCoupon || 'custom code'})`
    } else if (item.collaborationType === 'paid') {
      detailText = `regarding your paid sponsorship proposal (${item.expectedBudget || 'sponsorship'})`
    } else {
      detailText = `regarding your ${item.niche} collaboration request`
    }

    const text = encodeURIComponent(
      `Hi ${item.name}, greetings from Divine Travels Rishikesh! We received your creator collaboration application ${detailText}. We loved your profile and would like to discuss next steps with you!`
    )
    window.open(`https://wa.me/${targetPhone}?text=${text}`, '_blank')
  }

  const filteredItems = collaborations.filter((item) => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    return (
      item.name.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.phone.includes(q) ||
      (item.instagram && item.instagram.toLowerCase().includes(q)) ||
      item.niche.toLowerCase().includes(q) ||
      (item.assignedCoupon && item.assignedCoupon.toLowerCase().includes(q)) ||
      (item.selectedFreeActivity && item.selectedFreeActivity.toLowerCase().includes(q))
    )
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Creator &amp; Influencer Collaborations</h1>
              <p className="text-xs text-gray-500">
                Track real-time coupon code usage, affiliate bookings, commission payouts, and free barter trips
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchCollaborations}
            variant="outline"
            size="sm"
            className="rounded-xl flex items-center gap-1.5 text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <a
            href="/collaborate"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 bg-brand-teal hover:bg-brand-teal/90 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            View Public Creator Page <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Applications</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-sm">
          <p className="text-xs text-amber-800 font-medium">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-sm">
          <p className="text-xs text-emerald-800 font-medium">Approved Creators</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-orange-200 bg-orange-50/40 shadow-sm">
          <p className="text-xs text-orange-800 font-medium">Free Barter Trips</p>
          <p className="text-2xl font-bold text-brand-orange mt-1">{stats.barter}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
          <p className="text-xs text-purple-700 font-medium">Affiliate &amp; Paid</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{stats.affiliate + (stats.paid || 0)}</p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'completed', label: 'Completed' },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-brand-orange text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Collab Type */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
          >
            <option value="all">All Models</option>
            <option value="barter">🎁 Free Barter Deals</option>
            <option value="affiliate">💰 10% Affiliates</option>
            <option value="paid">👑 Paid Sponsors</option>
          </select>

          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search creator / coupon code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-orange"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-gray-100">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-orange mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading creator applications...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-2xl border border-gray-100">
          <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-base font-semibold text-gray-800">No Creator Applications Found</p>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            When influencers apply on your website at /collaborate, their proposals and tracking stats will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const hasTracking = item.assignedCoupon && item.tracking
            const usedCount = item.tracking?.usedCount || 0
            const totalSales = item.tracking?.totalSales || 0
            const commissionEarned = item.tracking?.commissionEarned || 0
            const isBookingsExpanded = !!expandedBookings[item.id]

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  {/* Creator Info */}
                  <div className="space-y-2.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>

                      {/* Status Badge */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          item.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : item.status === 'completed'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {item.status}
                      </span>

                      {/* Collab Model Badge */}
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          item.collaborationType === 'barter'
                            ? 'bg-orange-100 text-orange-800'
                            : item.collaborationType === 'affiliate'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.collaborationType === 'barter'
                          ? '🎁 Free Barter'
                          : item.collaborationType === 'affiliate'
                          ? '💰 10% Affiliate'
                          : '👑 Paid Sponsor'}
                      </span>

                      <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
                        {item.followersCount} Followers
                      </span>
                    </div>

                    {/* Social Handles & Contacts */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {item.email}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {item.phone}
                      </span>
                      {item.instagram && (
                        <a
                          href={item.instagram.startsWith('http') ? item.instagram : `https://instagram.com/${item.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-pink-600 font-semibold hover:underline"
                        >
                          <Instagram className="w-3.5 h-3.5" /> {item.instagram}
                        </a>
                      )}
                      {item.youtube && (
                        <a
                          href={item.youtube.startsWith('http') ? item.youtube : `https://youtube.com/${item.youtube}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-red-600 font-semibold hover:underline"
                        >
                          <Youtube className="w-3.5 h-3.5" /> Channel
                        </a>
                      )}
                    </div>

                    {/* Highlights Card */}
                    <div className="bg-slate-50/90 p-3.5 rounded-xl text-xs space-y-1.5 text-gray-700 border border-gray-100">
                      {item.collaborationType === 'barter' && item.selectedFreeActivity && (
                        <div className="flex items-center gap-1.5 text-orange-900 bg-orange-50/80 p-1.5 rounded-lg font-medium border border-orange-200/60">
                          <Zap className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                          <span><strong>Requested Free Perk:</strong> {item.selectedFreeActivity}</span>
                        </div>
                      )}

                      {item.collaborationType === 'affiliate' && item.proposedCoupon && (
                        <div className="flex items-center gap-1.5 text-emerald-900 bg-emerald-50/80 p-1.5 rounded-lg font-medium border border-emerald-200/60">
                          <Tag className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span><strong>Proposed Coupon Code:</strong> {item.proposedCoupon} (10% Off &amp; 10% Comm.)</span>
                        </div>
                      )}

                      {item.collaborationType === 'paid' && item.expectedBudget && (
                        <div className="flex items-center gap-1.5 text-purple-900 bg-purple-50/80 p-1.5 rounded-lg font-medium border border-purple-200/60">
                          <Award className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                          <span><strong>Requested Sponsorship Fee:</strong> {item.expectedBudget}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-gray-600 pt-0.5">
                        <span><strong>Niche:</strong> {item.niche}</span>
                        {item.travelDates && <span><strong>Dates:</strong> {item.travelDates}</span>}
                      </div>

                      {item.deliverables && (
                        <p>
                          <strong>Deliverables:</strong> {item.deliverables}
                        </p>
                      )}
                      {item.message && (
                        <p className="italic text-gray-600 border-t border-gray-200/60 pt-1">
                          &ldquo;{item.message}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* LIVE REAL-TIME AFFILIATE CODE USAGE TRACKING BAR */}
                    {item.assignedCoupon && (
                      <div className="mt-2 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border border-amber-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 bg-brand-orange text-white font-bold px-2.5 py-1 rounded-lg shadow-2xs">
                            <Tag className="w-3.5 h-3.5" /> Code: {item.assignedCoupon}
                          </span>
                          <span className="font-semibold text-gray-800 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            Used by: <strong className="text-blue-700">{item.tracking?.usedCount || 0} People</strong>
                          </span>
                          <span className="font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-1 rounded-lg">
                            🟢 Confirmed Payable ({item.commissionPct || 10}%): ₹{(item.tracking?.payableCommission || 0).toLocaleString()} ({item.tracking?.completedCount || 0} Trips Done)
                          </span>
                          {(item.tracking?.pendingCommission || 0) > 0 && (
                            <span className="font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-lg">
                              🟡 Pending ({item.commissionPct || 10}%): ₹{(item.tracking?.pendingCommission || 0).toLocaleString()} ({item.tracking?.pendingCount || 0} Upcoming)
                            </span>
                          )}
                        </div>

                        {item.tracking?.bookings && item.tracking.bookings.length > 0 && (
                          <button
                            onClick={() => toggleBookings(item.id)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-orange hover:text-brand-orange/80 underline"
                          >
                            <span>{isBookingsExpanded ? 'Hide Bookings' : 'View Customer Bookings'}</span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isBookingsExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex lg:flex-col items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => openWhatsApp(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 h-9 rounded-xl flex items-center gap-1.5 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </Button>

                    <Button
                      onClick={() => handleOpenEdit(item)}
                      variant="outline"
                      className="font-semibold text-xs px-3.5 h-9 rounded-xl flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-gray-600" /> Manage / Coupon
                    </Button>

                    <Button
                      onClick={() => handleDelete(item.id, item.name)}
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2.5 h-9 rounded-xl"
                      title="Delete application"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* EXPANDABLE BOOKINGS LIST */}
                {isBookingsExpanded && item.tracking?.bookings && (
                  <div className="bg-slate-50 border-t border-gray-200 p-4 space-y-2">
                    <p className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="w-4 h-4 text-emerald-600" />
                      Bookings Made Using Code &ldquo;{item.assignedCoupon}&rdquo; ({item.tracking.bookings.length} recent)
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left text-gray-600">
                        <thead className="bg-gray-100 text-gray-700 font-semibold uppercase">
                          <tr>
                            <th className="px-3 py-2">Customer</th>
                            <th className="px-3 py-2">Phone</th>
                            <th className="px-3 py-2">Package / Service</th>
                            <th className="px-3 py-2">Total Amount</th>
                            <th className="px-3 py-2">Trip Status</th>
                            <th className="px-3 py-2">Commission Status</th>
                            <th className="px-3 py-2">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {item.tracking.bookings.map((b) => {
                            const isCompleted = b.status === 'completed'
                            const itemComm = isCompleted ? Math.round(((b.totalPrice || 0) * (item.commissionPct || 10)) / 100) : 0

                            return (
                              <tr key={b.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium text-gray-900">{b.customerName}</td>
                                <td className="px-3 py-2">{b.customerPhone}</td>
                                <td className="px-3 py-2">{b.packageName}</td>
                                <td className="px-3 py-2 font-bold text-gray-900">₹{b.totalPrice?.toLocaleString()}</td>
                                <td className="px-3 py-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    isCompleted
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : b.status === 'confirmed'
                                      ? 'bg-blue-100 text-blue-700'
                                      : b.status === 'pending'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {isCompleted ? '🟢 Completed' : b.status === 'confirmed' ? '🔵 Confirmed' : '🟡 Upcoming/Pending'}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  {isCompleted ? (
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                      ₹{itemComm.toLocaleString()} (Payable)
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 italic text-[11px]">
                                      Pending trip completion
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-gray-400">
                                  {new Date(b.bookedAt).toLocaleDateString()}
                                </td>
                              </tr>
                            )
                          })}
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

      {/* Edit / Manage Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Manage Creator Partnership</h3>
                  <p className="text-xs text-gray-500">{selectedItem.name} ({selectedItem.followersCount})</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Application Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white font-medium"
                  >
                    <option value="pending">🟡 Pending Review</option>
                    <option value="approved">🟢 Approved (Active Collab)</option>
                    <option value="completed">🔵 Completed (Trip / Content Done)</option>
                    <option value="rejected">🔴 Rejected</option>
                  </select>
                </div>

                {selectedItem.collaborationType === 'barter' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Free Activity / Perk Approved</label>
                    <input
                      type="text"
                      value={editFreeActivity}
                      onChange={(e) => setEditFreeActivity(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>
                )}

                {selectedItem.collaborationType === 'paid' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Agreed Sponsorship Budget</label>
                    <input
                      type="text"
                      value={editBudget}
                      onChange={(e) => setEditBudget(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Assigned Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. ROHAN10"
                      value={editCoupon}
                      onChange={(e) => setEditCoupon(e.target.value.toUpperCase())}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold uppercase focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Auto-activates 10% off in system</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Commission %</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={editCommission}
                      onChange={(e) => setEditCommission(Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Creator payout percentage</p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">Internal Admin Remarks / Notes</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Code assigned, verified on Instagram, tracking live bookings..."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  onClick={() => setSelectedItem(null)}
                  variant="outline"
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl text-xs px-5"
                >
                  {saving ? 'Saving...' : 'Save & Update'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
