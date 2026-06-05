'use client'

import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Plus, Pencil, Trash2, X, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface PackageData {
  id: string
  name: string
  slug: string
  tagline: string
  subtitle: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  images: string
  category: string
  distance: string
  duration: string
  rapidsLevel: string
  rapidsDescription: string
  targetDemo: string
  timings: string
  highlights: string
  inclusions: string
  exclusions: string
  eligibility: string
  location: string
  cancellationPolicy: string
  faqs: string
  badge: string | null
  badgeColor: string
  gradient: string
  featured: boolean
  active: boolean
  rating: number
  reviewCount: number
}

const emptyForm = {
  name: '',
  slug: '',
  tagline: '',
  subtitle: '',
  description: '',
  price: '',
  originalPrice: '',
  image: '',
  images: '',
  category: 'rafting',
  distance: '',
  duration: '',
  rapidsLevel: '',
  rapidsDescription: '',
  targetDemo: '',
  timings: '',
  highlights: '',
  inclusions: '',
  exclusions: '',
  eligibility: '',
  location: '',
  cancellationPolicy: '',
  faqs: '',
  badge: '',
  badgeColor: 'bg-brand-orange',
  gradient: 'from-brand-orange/80 to-amber-600/80',
  featured: false,
  active: true,
}

const categoryLabels: Record<string, string> = {
  'rafting': 'Rafting',
  'bike-rental': 'Bike Rental',
  'taxi-booking': 'Taxi Booking',
  'trekking': 'Trekking',
  'adventure': 'Adventure Activities',
  'domestic-tours': 'Domestic Tours',
  'spiritual-tours': 'Spiritual Tours',
  'international-tours': 'International Tours',
  'stay-hotel': 'Hotel Packages',
  'stay-camping': 'Camping Packages',
}

export function AdminPackages({ categoryFilter }: { categoryFilter?: string }) {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'content'>('basic')

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: async () => {
      const res = await fetch('/api/packages', {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json() as Promise<PackageData[]>
    },
  })

  const filteredPackages = useMemo(() => {
    if (!categoryFilter) return packages
    return packages.filter((p) => p.category === categoryFilter)
  }, [packages, categoryFilter])

  const categoryName = categoryFilter ? (categoryLabels[categoryFilter] || categoryFilter) : 'All'

  const openEdit = (pkg: PackageData) => {
    setEditingId(pkg.id)
    setForm({
      name: pkg.name,
      slug: pkg.slug,
      tagline: pkg.tagline,
      subtitle: pkg.subtitle,
      description: pkg.description,
      price: String(pkg.price),
      originalPrice: String(pkg.originalPrice || ''),
      image: pkg.image,
      images: pkg.images,
      category: pkg.category,
      distance: pkg.distance,
      duration: pkg.duration,
      rapidsLevel: pkg.rapidsLevel,
      rapidsDescription: pkg.rapidsDescription,
      targetDemo: pkg.targetDemo,
      timings: pkg.timings,
      highlights: pkg.highlights,
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      eligibility: pkg.eligibility,
      location: pkg.location,
      cancellationPolicy: pkg.cancellationPolicy,
      faqs: pkg.faqs,
      badge: pkg.badge || '',
      badgeColor: pkg.badgeColor,
      gradient: pkg.gradient,
      featured: pkg.featured,
      active: pkg.active,
    })
    setActiveTab('basic')
    setShowForm(true)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, category: categoryFilter || 'rafting' })
    setActiveTab('basic')
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingId ? `/api/packages/${editingId}` : '/api/packages'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to save package')
        return
      }

      toast.success(editingId ? 'Package updated!' : 'Package created!')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] })
    } catch {
      toast.error('Failed to save package')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package? It will be deactivated.')) return

    try {
      const res = await fetch(`/api/packages/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' },
      })

      if (!res.ok) {
        toast.error('Failed to delete package')
        return
      }

      toast.success('Package deactivated')
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] })
    } catch {
      toast.error('Failed to delete package')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">
            {categoryFilter ? (
              <><span className="text-brand-orange">{categoryName}</span> Packages</>
            ) : 'All Packages'}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''}
            {categoryFilter ? ` in ${categoryName}` : ''}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-brand-orange hover:bg-brand-orange/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add {categoryFilter ? categoryName : 'Package'}
        </Button>
      </div>

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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-semibold text-lg text-brand-dark">
                  {editingId ? `Edit ${categoryName} Package` : `New ${categoryName} Package`}
                </h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex border-b border-border px-6">
                {(['basic', 'details', 'content'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-brand-orange text-brand-orange'
                        : 'border-transparent text-muted-foreground hover:text-brand-dark'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {activeTab === 'basic' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Name *</Label>
                        <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Package name" required />
                      </div>
                      <div>
                        <Label htmlFor="slug">Slug *</Label>
                        <Input id="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="package-slug" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="tagline">Tagline</Label>
                        <Input id="tagline" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Short catchy description" />
                      </div>
                      <div>
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input id="subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} placeholder="Beginner / Advanced" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">About / Description *</Label>
                      <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Full description..." required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Discounted Price (INR) *</Label>
                        <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                      </div>
                      <div>
                        <Label htmlFor="originalPrice">Original Price (INR)</Label>
                        <Input id="originalPrice" type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="Higher MRP for strikethrough" />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="rafting" />
                      </div>
                      <Label htmlFor="image">Main Image URL *</Label>
                      <Input id="image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." required />
                      {form.image && (
                        <div className="mt-2 rounded-lg overflow-hidden w-32 h-20 border">
                          <img src={form.image} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="images">Gallery Images (JSON array)</Label>
                      <Textarea id="images" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} rows={2} placeholder='["url1", "url2", "url3"]' />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="badge">Badge Text</Label>
                        <Input id="badge" value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Family Friendly" />
                      </div>
                      <div>
                        <Label htmlFor="badgeColor">Badge Color Class</Label>
                        <Input id="badgeColor" value={form.badgeColor} onChange={(e) => setForm({ ...form, badgeColor: e.target.value })} placeholder="bg-emerald-500" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="gradient">Gradient Class</Label>
                      <Input id="gradient" value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} placeholder="from-emerald-500/80 to-teal-600/80" />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} />
                        <Label>Featured</Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch checked={form.active} onCheckedChange={(checked) => setForm({ ...form, active: checked })} />
                        <Label>Active</Label>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'details' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="distance">Distance / Altitude</Label>
                        <Input id="distance" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} placeholder="9km route / 12,000 ft" />
                      </div>
                      <div>
                        <Label htmlFor="duration">Duration</Label>
                        <Input id="duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="2 Hours / 6 Days" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rapidsLevel">Difficulty / Level</Label>
                        <Input id="rapidsLevel" value={form.rapidsLevel} onChange={(e) => setForm({ ...form, rapidsLevel: e.target.value })} placeholder="Grade I & II" />
                      </div>
                      <div>
                        <Label htmlFor="rapidsDescription">Short Description</Label>
                        <Input id="rapidsDescription" value={form.rapidsDescription} onChange={(e) => setForm({ ...form, rapidsDescription: e.target.value })} placeholder="Easy waves — perfect introduction" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="targetDemo">Target Audience</Label>
                      <Input id="targetDemo" value={form.targetDemo} onChange={(e) => setForm({ ...form, targetDemo: e.target.value })} placeholder="Families, beginners, groups" />
                    </div>
                    <div>
                      <Label htmlFor="timings">Timings / Season</Label>
                      <Input id="timings" value={form.timings} onChange={(e) => setForm({ ...form, timings: e.target.value })} placeholder="07:00 AM to 04:00 PM / Oct-June" />
                    </div>
                    <div>
                      <Label htmlFor="eligibility">Eligibility Requirements</Label>
                      <Textarea id="eligibility" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} rows={3} placeholder="Age, fitness, medical requirements..." />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Textarea id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} rows={3} placeholder="Address, directions, pickup points..." />
                    </div>
                    <div>
                      <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                      <Textarea id="cancellationPolicy" value={form.cancellationPolicy} onChange={(e) => setForm({ ...form, cancellationPolicy: e.target.value })} rows={3} placeholder="Refund rules and conditions..." />
                    </div>
                  </>
                )}

                {activeTab === 'content' && (
                  <>
                    <div>
                      <Label htmlFor="highlights">Highlights (JSON array of strings)</Label>
                      <Textarea id="highlights" value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} rows={5} placeholder='["Highlight 1", "Highlight 2"]' />
                      <p className="text-xs text-muted-foreground mt-1">Enter as JSON array of strings</p>
                    </div>
                    <div>
                      <Label htmlFor="inclusions">Inclusions (JSON array of strings)</Label>
                      <Textarea id="inclusions" value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} rows={5} placeholder='["Inclusion 1", "Inclusion 2"]' />
                    </div>
                    <div>
                      <Label htmlFor="exclusions">Exclusions (JSON array of strings)</Label>
                      <Textarea id="exclusions" value={form.exclusions} onChange={(e) => setForm({ ...form, exclusions: e.target.value })} rows={5} placeholder='["Exclusion 1", "Exclusion 2"]' />
                    </div>
                    <div>
                      <Label htmlFor="faqs">FAQs (JSON array of objects)</Label>
                      <Textarea id="faqs" value={form.faqs} onChange={(e) => setForm({ ...form, faqs: e.target.value })} rows={5} placeholder='[{"question": "Q?", "answer": "A!"}]' />
                      <p className="text-xs text-muted-foreground mt-1">Enter as JSON array with question/answer objects</p>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                  <Button type="submit" disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white flex-1">
                    {saving ? 'Saving...' : editingId ? 'Update Package' : 'Create Package'}
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filteredPackages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No packages found{categoryFilter ? ` for ${categoryName}` : ''}.
            <br />
            <Button onClick={openCreate} variant="outline" className="mt-3">
              <Plus className="w-4 h-4 mr-2" />
              Add your first {categoryFilter ? categoryName : 'package'}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Package</th>
                  {!categoryFilter && <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>}
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="border-b border-border/50 hover:bg-brand-cream/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={pkg.image} alt={pkg.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium text-brand-dark">{pkg.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{pkg.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    {!categoryFilter && <td className="py-3 px-4 capitalize">{pkg.category}</td>}
                    <td className="py-3 px-4 font-medium">₹{pkg.price.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                        {pkg.rating} ({pkg.reviewCount})
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          pkg.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {pkg.active ? 'Active' : 'Inactive'}
                        </span>
                        {pkg.featured && (
                          <span className="text-xs px-2 py-1 rounded-full bg-brand-orange/10 text-brand-orange">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(pkg)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(pkg.id)}>
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
    </div>
  )
}
