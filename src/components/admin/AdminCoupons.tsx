'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pagination } from '@/components/ui/Pagination'
import { useAppStore } from '@/lib/store'
import { Plus, Pencil, Trash2, X, Copy, Check, Tag, Users, Sparkles, Globe, Lock, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthHeaders } from '@/lib/auth-client'

const emptyForm = {
  code: '',
  description: '',
  discountPct: '',
  maxDiscount: '',
  minAmount: '',
  maxUses: '',
  expiresAt: '',
  type: 'public', // 'public' | 'influencer' | 'referral'
  isPrivate: false,
  applicableCategory: 'all',
  userEligibility: 'all', // 'all' | 'new_users_only' | 'existing_users'
  creatorName: '',
}

export function AdminCoupons() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [page, setPage] = useState(1)

  const { data: couponsResponse, isLoading } = useQuery({
    queryKey: ['admin-coupons', user?.id, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/coupons?page=${page}&limit=25`, { headers: { ...getAuthHeaders() } })
      if (!res.ok) return { data: [], totalPages: 1 }
      return res.json()
    },
  })

  const coupons = Array.isArray(couponsResponse) ? couponsResponse : (couponsResponse?.data || [])
  const totalPages = Array.isArray(couponsResponse) ? 1 : (couponsResponse?.totalPages || 1)

  const openEdit = (c: Record<string, any>) => {
    setEditingId(c.id as string)
    setForm({
      code: c.code as string,
      description: (c.description as string) || '',
      discountPct: String(c.discountPct as number),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
      minAmount: c.minAmount ? String(c.minAmount) : '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      expiresAt: c.expiresAt ? (c.expiresAt as string).split('T')[0] : '',
      type: c.type || (c.isPrivate ? 'influencer' : 'public'),
      isPrivate: !!c.isPrivate,
      applicableCategory: c.applicableCategory || 'all',
      userEligibility: c.userEligibility || 'all',
      creatorName: c.creatorName || '',
    })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code || !form.discountPct) {
      toast.error('Code and discount % are required')
      return
    }
    setSaving(true)
    try {
      const isPriv = form.type === 'influencer' || form.type === 'referral' || form.isPrivate
      const payload = {
        ...form,
        id: editingId || undefined,
        code: form.code.trim().toUpperCase(),
        discountPct: Number(form.discountPct),
        isPrivate: isPriv,
      }

      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch('/api/admin/coupons', {
        method,
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const d = await res.json()
        toast.error(d.error || 'Failed to save coupon')
        return
      }
      toast.success(editingId ? 'Coupon updated successfully!' : 'Coupon created successfully!')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    } catch {
      toast.error('Failed to save coupon')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon code?')) return
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE', headers: { ...getAuthHeaders() } })
      if (!res.ok) { toast.error('Failed to delete'); return }
      toast.success('Coupon deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    } catch { toast.error('Failed to delete') }
  }

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark font-bold">Coupon &amp; Promo Code Manager</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Create public promotional codes, private influencer/referral codes, and set category &amp; new user eligibility rules.
          </p>
        </div>
        <Button
          onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true) }}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white font-bold rounded-xl h-10 px-5 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Coupon
        </Button>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl my-8 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-lg text-brand-dark">{editingId ? 'Edit Coupon Code' : 'Create New Coupon'}</h3>
                  <p className="text-xs text-gray-500">Configure discount value, visibility, category scope, and user targeting</p>
                </div>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-500">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-4">
                {/* Coupon Type */}
                <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-2xl space-y-2">
                  <Label className="text-xs font-bold text-gray-800 block">Coupon Type &amp; Visibility *</Label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-orange/20 bg-white"
                  >
                    <option value="public">🌐 Public Promo Code (Visible in User Dashboard &amp; Deals)</option>
                    <option value="influencer">👤 Influencer / Creator Affiliate (Private / Hidden from general dashboard)</option>
                    <option value="referral">🎁 Referral Code (Private / Hidden, for new user first login/booking)</option>
                  </select>
                  <p className="text-[11px] text-gray-500">
                    {form.type === 'public'
                      ? '✅ Will appear in all users’ "My Coupons" dashboard tab.'
                      : '🔒 Will NOT appear in user dashboards. Users must manually enter this code during checkout.'}
                  </p>
                </div>

                {/* Code & Creator Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="code" className="text-xs font-semibold">Coupon Code *</Label>
                    <Input
                      id="code"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="DIVINE10 / ROHAN10"
                      required
                      className="font-mono font-bold uppercase rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="creator" className="text-xs font-semibold">Creator / Campaign Name (Optional)</Label>
                    <Input
                      id="creator"
                      value={form.creatorName}
                      onChange={(e) => setForm({ ...form, creatorName: e.target.value })}
                      placeholder="e.g. Rohan Sharma / Monsoon Deal"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="desc" className="text-xs font-semibold">Description</Label>
                  <Input
                    id="desc"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="10% discount on river rafting and camping bookings"
                    className="rounded-xl"
                  />
                </div>

                {/* User Eligibility & Category Scope */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">User Eligibility *</Label>
                    <select
                      value={form.userEligibility}
                      onChange={(e) => setForm({ ...form, userEligibility: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white font-medium"
                    >
                      <option value="all">👥 All Users (New &amp; Existing)</option>
                      <option value="new_users_only">✨ New Users Only (First-time Booking)</option>
                      <option value="existing_users">🔁 Existing Users (Repeat Booking)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Applicable Category *</Label>
                    <select
                      value={form.applicableCategory}
                      onChange={(e) => setForm({ ...form, applicableCategory: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white font-medium"
                    >
                      <option value="all">🌟 All Packages &amp; Services</option>
                      <option value="rafting">🌊 River Rafting Only</option>
                      <option value="stay-camping">🏕️ Riverside Camping Only</option>
                      <option value="trekking">🏔️ Trekking Packages Only</option>
                      <option value="adventure">🪂 Adventure Activities Only</option>
                      <option value="stay-hotel">🏨 Hotels &amp; Resorts Only</option>
                      <option value="bike-rental">🏍️ Bike Rentals Only</option>
                      <option value="taxi-booking">🚕 Taxi Bookings Only</option>
                      <option value="domestic-tours">🗺️ Domestic Tours Only</option>
                      <option value="spiritual-tours">🛕 Spiritual Tours Only</option>
                    </select>
                  </div>
                </div>

                {/* Discount % and Max Cap */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disc" className="text-xs font-semibold">Discount % *</Label>
                    <Input
                      id="disc"
                      type="number"
                      value={form.discountPct}
                      onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
                      required
                      min={1}
                      max={100}
                      className="rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDisc" className="text-xs font-semibold">Max Discount Cap (₹)</Label>
                    <Input
                      id="maxDisc"
                      type="number"
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                      placeholder="e.g. 1000"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                {/* Min Amount, Max Uses & Expiry */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="minAmt" className="text-xs font-semibold">Min Order (₹)</Label>
                    <Input
                      id="minAmt"
                      type="number"
                      value={form.minAmount}
                      onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                      placeholder="999"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxUses" className="text-xs font-semibold">Max Uses Limit</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      value={form.maxUses}
                      onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                      placeholder="500"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="exp" className="text-xs font-semibold">Expiry Date</Label>
                    <Input
                      id="exp"
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                      className="rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white flex-1 rounded-xl font-bold">
                    {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading coupon codes...</div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">No coupons found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100 text-gray-700 font-bold uppercase text-[11px]">
                  <th className="text-left py-3.5 px-4">Code</th>
                  <th className="text-left py-3.5 px-4">Type &amp; Visibility</th>
                  <th className="text-left py-3.5 px-4">Eligibility &amp; Category</th>
                  <th className="text-left py-3.5 px-4">Discount</th>
                  <th className="text-left py-3.5 px-4">Used / Max</th>
                  <th className="text-left py-3.5 px-4">Status</th>
                  <th className="text-right py-3.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map((c: any) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date()
                  const isMaxed = c.maxUses && (c._count?.bookings >= c.maxUses || c.usedCount >= c.maxUses)
                  const active = c.active && !isExpired && !isMaxed

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-900 text-sm bg-gray-100 px-2 py-0.5 rounded-md">
                            {c.code}
                          </span>
                          <button
                            onClick={() => copyCode(c.code, c.id)}
                            className="text-gray-400 hover:text-brand-orange p-1 rounded"
                            title="Copy code"
                          >
                            {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {c.description && <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full w-max uppercase ${
                            c.type === 'influencer'
                              ? 'bg-purple-100 text-purple-700'
                              : c.type === 'referral'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {c.type === 'influencer' ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                            {c.type === 'influencer' ? 'Influencer (Private)' : c.type === 'referral' ? 'Referral (Private)' : 'Public Promo'}
                          </span>
                          {c.creatorName && (
                            <span className="text-[11px] text-gray-600 font-medium">Creator: {c.creatorName}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5 text-xs text-gray-700">
                          <span className="font-medium">
                            {c.userEligibility === 'new_users_only'
                              ? '✨ New Users (1st Booking)'
                              : c.userEligibility === 'existing_users'
                              ? '🔁 Existing Users'
                              : '👥 All Users'}
                          </span>
                          <span className="text-[11px] text-gray-500 capitalize">
                            Category: {c.applicableCategory || 'All'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-gray-900">
                        {c.discountPct}% OFF
                        {c.maxDiscount ? <span className="block text-[11px] font-normal text-gray-500">Max ₹{c.maxDiscount.toLocaleString()}</span> : null}
                      </td>

                      <td className="py-3 px-4 text-xs font-medium">
                        {c.usedCount || c._count?.bookings || 0} {c.maxUses ? `/ ${c.maxUses}` : 'uses'}
                        {c.minAmount ? <span className="block text-[10px] text-gray-400">Min. ₹{c.minAmount}</span> : null}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {active ? 'Active' : isExpired ? 'Expired' : isMaxed ? 'Maxed' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)} className="h-8 w-8 p-0 rounded-lg">
                            <Pencil className="w-3.5 h-3.5 text-gray-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(c.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 border-t border-border p-4 bg-white rounded-2xl">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
