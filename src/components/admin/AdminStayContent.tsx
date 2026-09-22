'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Save, Loader2, Plus, Trash2, GripVertical, Star,
  Hotel, Tent, Image, ChevronDown, ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

interface PricingTier {
  label: string
  sublabel: string
  price: string
  unit: string
  highlighted: boolean
}

interface StaySectionData {
  id: string
  section: string
  name: string
  description: string
  tag: string | null
  rating: number
  images: string[]
  features: string[]
  pricings: PricingTier[]
  active: boolean
}

const EMPTY_SECTION: StaySectionData = {
  id: '',
  section: '',
  name: '',
  description: '',
  tag: '',
  rating: 0,
  images: [],
  features: [],
  pricings: [],
  active: true,
}

const SECTIONS = ['hotel', 'camping']

export function AdminStayContent() {
  const { user } = useAppStore()
  const [activeSection, setActiveSection] = useState<'hotel' | 'camping'>('hotel')
  const [hotel, setHotel] = useState<StaySectionData>({ ...EMPTY_SECTION, section: 'hotel' })
  const [camping, setCamping] = useState<StaySectionData>({ ...EMPTY_SECTION, section: 'camping' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const current = activeSection === 'hotel' ? hotel : camping
  const setCurrent = useCallback(
    (updater: StaySectionData | ((prev: StaySectionData) => StaySectionData)) => {
      if (activeSection === 'hotel') {
        setHotel(typeof updater === 'function' ? updater(hotel) : updater)
      } else {
        setCamping(typeof updater === 'function' ? updater(camping) : updater)
      }
    },
    [activeSection, hotel, camping],
  )

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stay-content', {
        headers: { ...getAuthHeaders() },
      })
      const data = await res.json()
      if (res.ok && data.records) {
        const h = data.records.find((r: StaySectionData) => r.section === 'hotel')
        const c = data.records.find((r: StaySectionData) => r.section === 'camping')
        if (h) setHotel(h)
        if (c) setCamping(c)
      }
    } catch {
      toast.error('Failed to load stay content')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchData()
  }, [fetchData, user?.id])

  const updateField = (field: keyof StaySectionData, value: unknown) => {
    setCurrent((prev) => ({ ...prev, [field]: value }))
  }

  const addImage = () => {
    setCurrent((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }

  const updateImage = (index: number, value: string) => {
    setCurrent((prev) => {
      const images = [...prev.images]
      images[index] = value
      return { ...prev, images }
    })
  }

  const removeImage = (index: number) => {
    setCurrent((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addFeature = () => {
    setCurrent((prev) => ({ ...prev, features: [...prev.features, ''] }))
  }

  const updateFeature = (index: number, value: string) => {
    setCurrent((prev) => {
      const features = [...prev.features]
      features[index] = value
      return { ...prev, features }
    })
  }

  const removeFeature = (index: number) => {
    setCurrent((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const addPricing = () => {
    setCurrent((prev) => ({
      ...prev,
      pricings: [
        ...prev.pricings,
        { label: '', sublabel: '', price: '', unit: '/pp', highlighted: false },
      ],
    }))
  }

  const updatePricing = (index: number, field: keyof PricingTier, value: unknown) => {
    setCurrent((prev) => {
      const pricings = [...prev.pricings]
      pricings[index] = { ...pricings[index], [field]: value }
      return { ...prev, pricings }
    })
  }

  const removePricing = (index: number) => {
    setCurrent((prev) => ({
      ...prev,
      pricings: prev.pricings.filter((_, i) => i !== index),
    }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/stay-content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), },
        body: JSON.stringify(current),
      })
      if (res.ok) {
        toast.success(`${activeSection === 'hotel' ? 'Hotel' : 'Camping'} content saved`)
        await fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Save failed')
      }
    } catch {
      toast.error('Network error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-dark">Hotel & Camping Content</h2>
          <p className="text-sm text-muted-foreground">
            Manage the Stay section — names, images, pricing, and features
          </p>
        </div>
        <Button
          onClick={save}
          disabled={saving}
          className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full h-10 px-6"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save {activeSection === 'hotel' ? 'Hotel' : 'Camping'}
        </Button>
      </div>

      {/* Section switcher */}
      <div className="flex gap-2">
        {SECTIONS.map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec as 'hotel' | 'camping')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              activeSection === sec
                ? 'bg-brand-dark text-white shadow-lg'
                : 'bg-white text-muted-foreground border border-border/50 hover:border-brand-dark/20'
            }`}
          >
            {sec === 'hotel' ? <Hotel className="w-4 h-4" /> : <Tent className="w-4 h-4" />}
            {sec === 'hotel' ? 'Hotel' : 'Camping'}
          </button>
        ))}
      </div>

      <motion.div
        key={activeSection}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Basic info */}
        <div className="bg-white rounded-xl p-5 border border-border/50 space-y-4">
          <h3 className="font-semibold text-brand-dark text-sm">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Name</label>
              <Input
                value={current.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Hotel Holy Ganga"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Badge / Tag</label>
              <Input
                value={current.tag || ''}
                onChange={(e) => updateField('tag', e.target.value)}
                placeholder="Riverside Camping"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Description</label>
            <textarea
              value={current.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm min-h-[60px] resize-y focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
              placeholder="Short description..."
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-brand-gold" />
              <span className="text-sm text-muted-foreground">Rating:</span>
              <select
                value={current.rating}
                onChange={(e) => updateField('rating', parseFloat(e.target.value))}
                className="rounded-lg border border-border/50 bg-background px-2 py-1 text-sm"
              >
                {[0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((v) => (
                  <option key={v} value={v}>{v === 0 ? 'None' : v}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl p-5 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-brand-dark text-sm flex items-center gap-2">
              <Image className="w-4 h-4" /> Images <span className="text-xs text-muted-foreground">(Google Drive links)</span>
            </h3>
            <Button onClick={addImage} size="sm" className="h-8 rounded-full text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Image
            </Button>
          </div>

          {/* Preview strip */}
          {current.images.filter((url) => url.trim()).length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {current.images.map((url, i) =>
                url.trim() ? (
                  <div key={i} className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-border/50">
                    <img loading="lazy" decoding="async"
                      src={url}
                      alt={`Image ${i + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://drive.google.com/thumbnail?id=${url.split('id=').pop()?.split('&')[0] || url.split('/').pop()}&sz=w200`
                      }}
                    />
                  </div>
                ) : null,
              )}
            </div>
          )}

          <div className="space-y-2">
            {current.images.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                <Input
                  value={url}
                  onChange={(e) => updateImage(i, e.target.value)}
                  placeholder={`Paste Google Drive image link ${i + 1}`}
                  className="text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeImage(i)}
                  className="text-red-400 hover:text-red-600 h-8 w-8 p-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Features / Amenities */}
        <div className="bg-white rounded-xl p-5 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-brand-dark text-sm">Features / Amenities</h3>
            <Button onClick={addFeature} size="sm" className="h-8 rounded-full text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {current.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 bg-brand-cream rounded-full pl-3 pr-1 py-1 border border-border/50">
                <input
                  value={feature}
                  onChange={(e) => updateFeature(i, e.target.value)}
                  className="bg-transparent text-sm w-24 outline-none"
                  placeholder="e.g. Free WiFi"
                />
                <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600 p-0.5">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Pricings */}
        <div className="bg-white rounded-xl p-5 border border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-brand-dark text-sm">Pricing Tiers</h3>
            <Button onClick={addPricing} size="sm" className="h-8 rounded-full text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Tier
            </Button>
          </div>
          <div className="space-y-3">
            {current.pricings.map((tier, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border transition-all ${
                  tier.highlighted
                    ? 'border-brand-orange/30 bg-brand-orange/5 ring-1 ring-brand-orange/20'
                    : 'border-border/50 bg-brand-cream/50'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Label</label>
                    <Input
                      value={tier.label}
                      onChange={(e) => updatePricing(i, 'label', e.target.value)}
                      placeholder="Double Sharing"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Sub-label</label>
                    <Input
                      value={tier.sublabel}
                      onChange={(e) => updatePricing(i, 'sublabel', e.target.value)}
                      placeholder="2 persons per tent"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Price</label>
                    <Input
                      value={tier.price}
                      onChange={(e) => updatePricing(i, 'price', e.target.value)}
                      placeholder="1800"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-muted-foreground mb-1">Unit</label>
                    <Input
                      value={tier.unit}
                      onChange={(e) => updatePricing(i, 'unit', e.target.value)}
                      placeholder="/pp"
                      className="text-sm"
                    />
                  </div>
                  <div className="flex items-end gap-2 pb-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tier.highlighted}
                        onChange={(e) => updatePricing(i, 'highlighted', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange/30"
                      />
                      <span className="text-xs text-muted-foreground">Highlight</span>
                    </label>
                    <button
                      onClick={() => removePricing(i)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
