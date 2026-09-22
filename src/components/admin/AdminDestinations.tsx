'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pagination } from '@/components/ui/Pagination'
import { useAppStore } from '@/lib/store'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { getAuthHeaders } from '@/lib/auth-client'

interface Destination {
  slug?: string
  id: string
  name: string
  tagline: string
  description: string
  state: string
  category: string
  price: number
  rating: number
  reviewCount: number
  image: string
  badge: string | null
  badgeColor: string | null
  tags: string
  featured: boolean
  active: boolean
}

const emptyForm = {
  name: '',
  tagline: '',
  description: '',
  state: '',
  category: '',
  price: '',
  rating: '',
  image: '',
  badge: '',
  badgeColor: '',
  tags: '',
  featured: false,
}

export function AdminDestinations() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [page, setPage] = useState(1)

  const { data: destinationsResponse, isLoading } = useQuery({
    queryKey: ['admin-destinations', page],
    queryFn: async () => {
      const res = await fetch(`/api/destinations?page=${page}&limit=20`)
      return res.json()
    },
  })

  const destinations: Destination[] = Array.isArray(destinationsResponse) ? destinationsResponse : (destinationsResponse?.data || [])
  const totalPages = Array.isArray(destinationsResponse) ? 1 : (destinationsResponse?.totalPages || 1)

  const openEdit = (dest: Destination) => {
    setEditingId(dest.id)
    setForm({
      name: dest.name,
      tagline: dest.tagline,
      description: dest.description,
      state: dest.state,
      category: dest.category,
      price: String(dest.price),
      rating: String(dest.rating),
      image: dest.image,
      badge: dest.badge || '',
      badgeColor: dest.badgeColor || '',
      tags: dest.tags,
      featured: dest.featured,
    })
    setShowForm(true)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingId ? `/api/destinations/${editingId}` : '/api/destinations'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          rating: Number(form.rating),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save destination')
        return
      }

      toast.success(editingId ? 'Destination updated!' : 'Destination created!')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin-destinations'] })
    } catch {
      toast.error('Failed to save destination')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this destination?')) return

    try {
      const res = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
        headers: { ...getAuthHeaders() },
      })

      if (!res.ok) {
        toast.error('Failed to delete destination')
        return
      }

      toast.success('Destination deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-destinations'] })
    } catch {
      toast.error('Failed to delete destination')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Manage Destinations</h2>
        <Button
          onClick={openCreate}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Destination
        </Button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-semibold text-lg text-brand-dark">
                  {editingId ? 'Edit Destination' : 'New Destination'}
                </h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline *</Label>
                    <Input id="tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="adventure spiritual trekking" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (INR) *</Label>
                    <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input id="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">Image URL *</Label>
                  <Input id="image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} required />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="badge">Badge</Label>
                    <Input id="badge" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Trending" />
                  </div>
                  <div>
                    <Label htmlFor="badgeColor">Badge Color</Label>
                    <Input id="badgeColor" value={form.badgeColor} onChange={(e) => setForm({ ...form, badgeColor: e.target.value })} placeholder="orange, green, blue" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Rafting,Yoga,Trekking" />
                </div>

                <div className="flex items-center gap-3">
                  <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
                  <Label>Featured Destination</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white flex-1">
                    {saving ? 'Saving...' : editingId ? 'Update Destination' : 'Create Destination'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">State</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations.map((dest) => (
                  <tr key={dest.id} className="border-b border-border/50 hover:bg-brand-cream/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={dest.image} alt={dest.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-brand-dark">{dest.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{dest.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{dest.state}</td>
                    <td className="py-3 px-4 font-medium">₹{dest.price.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                        {dest.rating}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        dest.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {dest.active ? 'Active' : 'Inactive'}
                      </span>
                      {dest.featured && (
                        <span className="ml-1 text-xs px-2 py-1 rounded-full bg-brand-orange/10 text-brand-orange">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(dest)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(dest.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
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
