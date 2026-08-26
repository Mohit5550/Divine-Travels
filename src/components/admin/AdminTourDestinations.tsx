'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface TourHighlight {
  icon: string
  label: string
}

interface Program {
  id: number
  title: string
  description?: string
  highlights?: TourHighlight[]
  img: string
  itinerary: string[]
  price?: string
  actualPrice?: number
  discountedPrice?: number
}

interface DayConfig {
  label: string
  title: string
  maxSelect: number
}

interface TourDestinationData {
  id: string
  slug: string
  name: string
  type: string
  config: {
    heroImage: string
    heroTitle: string
    heroSubtitle: string
    heroTag: string
    sectionTitle: string
    sectionSubtitle: string
  }
  programs: Program[]
  dayConfigs: DayConfig[]
  active: boolean
}

const emptyDest = {
  slug: '',
  name: '',
  type: 'day-based',
  config: { heroImage: '', heroTitle: '', heroSubtitle: '', heroTag: '', sectionTitle: '', sectionSubtitle: '' },
  programs: [] as Program[],
  dayConfigs: [] as DayConfig[],
}

export function AdminTourDestinations() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<typeof emptyDest>({ ...emptyDest })

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['admin-tour-destinations'],
    queryFn: async () => {
      const res = await fetch('/api/admin/tour-destinations', {
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json() as Promise<TourDestinationData[]>
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const isEdit = !!editingId
      const url = isEdit ? `/api/admin/tour-destinations/${editingId}` : '/api/admin/tour-destinations'
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour-destinations'] })
      setShowForm(false)
      setEditingId(null)
      setForm({ ...emptyDest })
      toast.success('Tour destination saved')
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/tour-destinations/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) throw new Error('Failed to delete')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour-destinations'] })
      toast.success('Tour destination deactivated')
    },
    onError: () => toast.error('Failed to delete'),
  })

  const openEdit = (dest: TourDestinationData) => {
    setForm({
      slug: dest.slug,
      name: dest.name,
      type: dest.type,
      config: { ...dest.config },
      programs: dest.programs.map((p) => ({ ...p, highlights: p.highlights ? [...p.highlights] : [], itinerary: [...p.itinerary] })),
      dayConfigs: dest.dayConfigs.map((d) => ({ ...d })),
    })
    setEditingId(dest.id)
    setShowForm(true)
  }

  const openCreate = () => {
    setForm({ ...emptyDest })
    setEditingId(null)
    setShowForm(true)
  }

  const addProgram = () => {
    const maxId = form.programs.reduce((max, p) => Math.max(max, p.id), 0)
    setForm({ ...form, programs: [...form.programs, { id: maxId + 1, title: '', img: '', itinerary: [''] }] })
  }

  const updateProgram = (idx: number, field: keyof Program, value: string | number | string[]) => {
    const programs = [...form.programs]
    programs[idx] = { ...programs[idx], [field]: value }
    setForm({ ...form, programs })
  }

  const removeProgram = (idx: number) => {
    setForm({ ...form, programs: form.programs.filter((_, i) => i !== idx) })
  }

  const addItineraryItem = (progIdx: number) => {
    const programs = [...form.programs]
    programs[progIdx] = { ...programs[progIdx], itinerary: [...programs[progIdx].itinerary, ''] }
    setForm({ ...form, programs })
  }

  const updateItineraryItem = (progIdx: number, itIdx: number, value: string) => {
    const programs = [...form.programs]
    programs[progIdx].itinerary[itIdx] = value
    setForm({ ...form, programs })
  }

  const removeItineraryItem = (progIdx: number, itIdx: number) => {
    const programs = [...form.programs]
    programs[progIdx] = { ...programs[progIdx], itinerary: programs[progIdx].itinerary.filter((_, i) => i !== itIdx) }
    setForm({ ...form, programs })
  }

  const addDayConfig = () => {
    setForm({ ...form, dayConfigs: [...form.dayConfigs, { label: '', title: '', maxSelect: 1 }] })
  }

  const updateDayConfig = (idx: number, field: keyof DayConfig, value: string | number) => {
    const dayConfigs = [...form.dayConfigs]
    dayConfigs[idx] = { ...dayConfigs[idx], [field]: value }
    setForm({ ...form, dayConfigs })
  }

  const removeDayConfig = (idx: number) => {
    setForm({ ...form, dayConfigs: form.dayConfigs.filter((_, i) => i !== idx) })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Tour Destinations</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage tour programs, images, and content</p>
        </div>
        <Button onClick={openCreate} className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl">
          <Plus className="w-4 h-4 mr-1.5" /> Add Destination
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse"><div className="h-4 bg-muted rounded w-2/3 mb-3" /><div className="h-4 bg-muted rounded w-1/2" /></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest) => (
            <motion.div key={dest.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`bg-white rounded-xl overflow-hidden shadow-sm border ${dest.active ? 'border-border' : 'border-red-200 opacity-60'}`}>
              <div className="relative h-32 overflow-hidden">
                <img src={dest.config.heroImage || 'https://placehold.co/400x200?text=No+Image'} alt={dest.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white font-bold text-sm">{dest.name}</h3>
                  <p className="text-white/60 text-xs">{dest.type} &middot; {dest.programs.length} programs</p>
                </div>
                {!dest.active && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">Inactive</span>}
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">/{dest.slug}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(dest)} className="w-7 h-7 rounded-lg bg-brand-cream text-muted-foreground hover:bg-brand-orange/10 hover:text-brand-orange flex items-center justify-center transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm('Deactivate this destination?')) deleteMutation.mutate(dest.id) }} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit/Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-3xl mx-4 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-brand-dark to-brand-navy px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Destination' : 'Add Destination'}</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"><X className="w-4 h-4" /></button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Slug</label>
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30" placeholder="rishikesh" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30" placeholder="Rishikesh" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30">
                    <option value="day-based">Day-Based</option>
                    <option value="single-select">Single Select</option>
                  </select>
                </div>
              </div>

              {/* Hero Config */}
              <div className="border border-border rounded-xl p-4">
                <h3 className="font-semibold text-brand-dark text-sm mb-3">Hero Section</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Hero Image URL</label>
                    <input value={form.config.heroImage} onChange={(e) => setForm({ ...form, config: { ...form.config, heroImage: e.target.value } })} className="w-full px-3 py-2 border border-border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Hero Title</label>
                    <input value={form.config.heroTitle} onChange={(e) => setForm({ ...form, config: { ...form.config, heroTitle: e.target.value } })} className="w-full px-3 py-2 border border-border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Hero Tag</label>
                    <input value={form.config.heroTag} onChange={(e) => setForm({ ...form, config: { ...form.config, heroTag: e.target.value } })} className="w-full px-3 py-2 border border-border rounded-xl text-sm" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Hero Subtitle</label>
                    <input value={form.config.heroSubtitle} onChange={(e) => setForm({ ...form, config: { ...form.config, heroSubtitle: e.target.value } })} className="w-full px-3 py-2 border border-border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Section Title</label>
                    <input value={form.config.sectionTitle} onChange={(e) => setForm({ ...form, config: { ...form.config, sectionTitle: e.target.value } })} className="w-full px-3 py-2 border border-border rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Section Subtitle</label>
                    <input value={form.config.sectionSubtitle || ''} onChange={(e) => setForm({ ...form, config: { ...form.config, sectionSubtitle: e.target.value } })} className="w-full px-3 py-2 border border-border rounded-xl text-sm" />
                  </div>
                </div>
              </div>

              {/* Day Configs */}
              {form.type === 'day-based' && (
                <div className="border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-brand-dark text-sm">Day Configurations</h3>
                    <button onClick={addDayConfig} className="text-xs font-semibold text-brand-orange hover:underline">+ Add Day</button>
                  </div>
                  {form.dayConfigs.length === 0 && <p className="text-xs text-muted-foreground">No day configs. Click "Add Day" to create one.</p>}
                  <div className="space-y-3">
                    {form.dayConfigs.map((dc, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-brand-cream rounded-lg p-3">
                        <input value={dc.label} onChange={(e) => updateDayConfig(idx, 'label', e.target.value)} className="flex-1 px-3 py-2 border border-border rounded-lg text-xs" placeholder="Day 1" />
                        <input value={dc.title} onChange={(e) => updateDayConfig(idx, 'title', e.target.value)} className="flex-[2] px-3 py-2 border border-border rounded-lg text-xs" placeholder="Section 1: Day 1 (Select 1)" />
                        <input type="number" value={dc.maxSelect} onChange={(e) => updateDayConfig(idx, 'maxSelect', parseInt(e.target.value) || 1)} className="w-16 px-2 py-2 border border-border rounded-lg text-xs text-center" min={1} />
                        <button onClick={() => removeDayConfig(idx)} className="w-6 h-6 rounded bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Programs */}
              <div className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-brand-dark text-sm">Programs / Tours ({form.programs.length})</h3>
                  <button onClick={addProgram} className="text-xs font-semibold text-brand-orange hover:underline">+ Add Program</button>
                </div>
                <div className="space-y-4">
                  {form.programs.map((prog, idx) => (
                    <div key={prog.id} className="bg-brand-cream rounded-xl p-4 border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-muted-foreground">Program #{prog.id}</span>
                        <button onClick={() => removeProgram(idx)} className="w-6 h-6 rounded bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"><X className="w-3 h-3" /></button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-muted-foreground mb-0.5">Title</label>
                          <input value={prog.title} onChange={(e) => updateProgram(idx, 'title', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-xs" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-0.5">Image URL</label>
                          <input value={prog.img} onChange={(e) => updateProgram(idx, 'img', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-xs" />
                        </div>
                      </div>
                      {form.type === 'single-select' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-semibold text-muted-foreground mb-0.5">Description</label>
                            <input value={prog.description || ''} onChange={(e) => updateProgram(idx, 'description', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-xs" placeholder="Brief description of this package..." />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-muted-foreground mb-0.5">Price</label>
                            <input value={prog.price || ''} onChange={(e) => updateProgram(idx, 'price', e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-xs" placeholder="₹12,000" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-0.5">Actual Price (₹)</label>
                              <input type="number" value={prog.actualPrice || 0} onChange={(e) => updateProgram(idx, 'actualPrice', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-border rounded-lg text-xs" />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-0.5">Disc. Price (₹)</label>
                              <input type="number" value={prog.discountedPrice || 0} onChange={(e) => updateProgram(idx, 'discountedPrice', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-border rounded-lg text-xs" />
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-muted-foreground">Itinerary Items</label>
                          <button onClick={() => addItineraryItem(idx)} className="text-[10px] font-semibold text-brand-orange hover:underline">+ Add Item</button>
                        </div>
                        <div className="space-y-1.5">
                          {prog.itinerary.map((item, itIdx) => (
                            <div key={itIdx} className="flex items-center gap-1.5">
                              <input value={item} onChange={(e) => updateItineraryItem(idx, itIdx, e.target.value)} className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs" placeholder="Itinerary item..." />
                              <button onClick={() => removeItineraryItem(idx, itIdx)} className="w-5 h-5 rounded bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center"><X className="w-2.5 h-2.5" /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-border/50 px-6 py-4 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button onClick={() => saveMutation.mutate()} className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl" disabled={saveMutation.isPending}>
                <Save className="w-4 h-4 mr-1.5" /> {saveMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
