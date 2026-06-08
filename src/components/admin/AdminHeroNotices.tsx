'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Loader2, GripVertical, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface HeroNoticeItem {
  id: string
  image: string | null
  heading: string
  description: string | null
  order: number
  active: boolean
}

const emptyForm = { image: '', heading: '', description: '', order: 0 }

export function AdminHeroNotices() {
  const [notices, setNotices] = useState<HeroNoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<HeroNoticeItem | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/hero-notices')
      if (res.ok) setNotices(await res.json())
    } catch { toast.error('Failed to fetch') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNotices() }, [])

  const save = async () => {
    if (!form.heading.trim()) { toast.error('Heading required'); return }
    setSaving(true)
    try {
      const url = editing ? `/api/hero-notices/${editing.id}` : '/api/hero-notices'
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editing ? 'Updated' : 'Created')
        setShowForm(false); setEditing(null); setForm(emptyForm); fetchNotices()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed')
      }
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this notice?')) return
    try {
      const res = await fetch(`/api/hero-notices/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Deleted'); fetchNotices() }
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-brand-orange" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl text-brand-dark">Hero Notice Slides</h2>
        <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white" onClick={() => { setForm(emptyForm); setEditing(null); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-1" /> Add Slide
        </Button>
      </div>
      <p className="text-sm text-gray-500">3 slides max. These appear as a floating bar on the right side of the hero section.</p>

      {notices.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">No slides yet. Add one to get started.</div>
      ) : (
        <div className="space-y-3">
          {notices.map((notice, i) => (
            <motion.div key={notice.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition">
              <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <span className="text-xs font-bold text-brand-orange w-5">{i + 1}</span>
              {notice.image ? (
                <img src={notice.image} alt="" className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Image className="w-5 h-5 text-gray-300" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-brand-dark text-sm truncate">{notice.heading}</p>
                {notice.description && <p className="text-xs text-gray-400 truncate">{notice.description}</p>}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => { setEditing(notice); setForm({ image: notice.image || '', heading: notice.heading, description: notice.description || '', order: notice.order }); setShowForm(true) }}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500" onClick={() => del(notice.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{editing ? 'Edit Slide' : 'Add Slide'}</h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Image URL</label>
                  <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    placeholder="https://example.com/image.jpg" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Heading *</label>
                  <input value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    placeholder="e.g. Travel Mart 2026" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange"
                    rows={2} placeholder="Short description..." />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange" />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white" onClick={save} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
