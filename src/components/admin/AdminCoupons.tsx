'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pagination } from '@/components/ui/Pagination'
import { useAppStore } from '@/lib/store'
import { Plus, Pencil, Trash2, X, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

const emptyForm = {
  code: '',
  description: '',
  discountPct: '',
  maxDiscount: '',
  minAmount: '',
  maxUses: '',
  expiresAt: '',
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
      const res = await fetch(`/api/admin/coupons?page=${page}&limit=20`, { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return { data: [], totalPages: 1 }
      return res.json()
    },
  })

  const coupons = Array.isArray(couponsResponse) ? couponsResponse : (couponsResponse?.data || [])
  const totalPages = Array.isArray(couponsResponse) ? 1 : (couponsResponse?.totalPages || 1)

  const openEdit = (c: Record<string, unknown>) => {
    setEditingId(c.id as string)
    setForm({
      code: c.code as string,
      description: (c.description as string) || '',
      discountPct: String(c.discountPct as number),
      maxDiscount: c.maxDiscount ? String(c.maxDiscount) : '',
      minAmount: c.minAmount ? String(c.minAmount) : '',
      maxUses: c.maxUses ? String(c.maxUses) : '',
      expiresAt: c.expiresAt ? (c.expiresAt as string).split('T')[0] : '',
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
      const url = editingId ? '/api/admin/coupons' : '/api/admin/coupons'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify(editingId ? { ...form, id: editingId, discountPct: Number(form.discountPct) } : { ...form, discountPct: Number(form.discountPct) }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed'); return }
      toast.success(editingId ? 'Coupon updated!' : 'Coupon created!')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE', headers: { 'x-user-id': user?.id || '' } })
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Coupon Codes</h2>
          <p className="text-sm text-muted-foreground mt-1">{coupons.length} coupon{(coupons as unknown[]).length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(true) }} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Coupon
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-semibold text-lg text-brand-dark">{editingId ? 'Edit Coupon' : 'New Coupon'}</h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" required />
                </div>
                <div>
                  <Label htmlFor="desc">Description</Label>
                  <Input id="desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="20% off on summer bookings" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="disc">Discount % *</Label>
                    <Input id="disc" type="number" value={form.discountPct} onChange={(e) => setForm({ ...form, discountPct: e.target.value })} required min={1} max={100} />
                  </div>
                  <div>
                    <Label htmlFor="maxDisc">Max Discount (₹)</Label>
                    <Input id="maxDisc" type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAmt">Min Order (₹)</Label>
                    <Input id="minAmt" type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="maxUses">Max Uses</Label>
                    <Input id="maxUses" type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="exp">Expiry Date</Label>
                  <Input id="exp" type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white flex-1">
                    {saving ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No coupons yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Discount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Used</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Expires</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(coupons as Array<Record<string, unknown>>).map((c) => {
                  const isExpired = c.expiresAt && new Date(c.expiresAt as string) < new Date()
                  const isMaxed = c.maxUses && (c as { _count: { bookings: number } })._count?.bookings >= (c.maxUses as number)
                  const active = (c.active as boolean) && !isExpired && !isMaxed
                  return (
                    <tr key={c.id as string} className="border-b border-border/50 hover:bg-brand-cream/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-dark">{c.code as string}</span>
                          <button onClick={() => copyCode(c.code as string, c.id as string)} className="text-muted-foreground hover:text-brand-dark">
                            {copiedId === c.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{c.description as string}</td>
                      <td className="py-3 px-4 font-medium">{String(c.discountPct)}%{c.maxDiscount ? ` (max ₹${Number(c.maxDiscount).toLocaleString()})` : ''}</td>
                      <td className="py-3 px-4">{(c as { _count: { bookings: number } })._count?.bookings || 0}{c.maxUses ? ` / ${String(c.maxUses)}` : ''}</td>
                      <td className="py-3 px-4 text-xs">{c.expiresAt ? new Date(c.expiresAt as string).toLocaleDateString() : '—'}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {active ? 'Active' : isExpired ? 'Expired' : isMaxed ? 'Maxed' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(c.id as string)}><Trash2 className="w-4 h-4" /></Button>
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
        <div className="mt-4 border-t border-border p-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
