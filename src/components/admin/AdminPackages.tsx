'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pagination } from '@/components/ui/Pagination'
import { useAppStore } from '@/lib/store'
import { Plus, Pencil, Trash2, X, Star, Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { toDirectImageUrl } from '@/lib/utils'

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
  pickupLocationUrl: string
  locationUrls: string
  cancellationPolicy: string
  faqs: string
  badge: string | null
  badgeColor: string
  gradient: string
  featured: boolean
  active: boolean
  rating: number
  reviewCount: number
  routeLength: string
  maxAltitude: string
  baseCamp: string
  pickupPoint: string
  suitableFor: string
  experience: string
  fitness: string
  bestSeason: string
  gstRate: number
  itinerary: string
  thingsToCarry: string
  howToReach: string
  importantInfo: string
  fixedDepartures: string
  propertyType: string
  amenities: string
  roomTypes: string
  mealPlans: string
}

interface ItineraryDay {
  day: number
  title: string
  startTime: string
  endTime: string
  altitude: string
  altitudeGain: string
  distance: string
  hours: string
  description: string
}

interface FixedDeparture {
  date: string
  status: 'available' | 'few-seats' | 'sold-out'
  notes: string
}

interface PricingTier {
  minPax: number
  maxPax: number
  pricePerPerson: number
}

interface RoomType {
  name: string
  price: number
  plan: string
  guests: number
  maxAdults: number
  maxChildren: number
  baseOccupancy: number
  extraAdultPrice: number
  extraChildPrice: number
  bed: string
  size: string
  pricingTiers?: PricingTier[]
}

interface MealPlan {
  name: string
  description: string
  price: number
}

interface LocationUrl {
  caption: string
  url: string
}

interface Amenity {
  icon: string
  name: string
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
  pickupLocationUrl: '',
  locationUrls: '',
  cancellationPolicy: '',
  faqs: '',
  badge: '',
  badgeColor: 'bg-brand-orange',
  gradient: 'from-brand-orange/80 to-amber-600/80',
  featured: false,
  active: true,
  routeLength: '',
  maxAltitude: '',
  baseCamp: '',
  pickupPoint: '',
  suitableFor: '',
  experience: '',
  fitness: '',
  bestSeason: '',
  gstRate: '5',
  itinerary: '',
  thingsToCarry: '',
  howToReach: '',
  importantInfo: '',
  fixedDepartures: '',
  propertyType: '',
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
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'content' | 'dates' | 'hotel'>('basic')

  // Visual builder state
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([])
  const [fixedDepartures, setFixedDepartures] = useState<FixedDeparture[]>([])
  const [thingsToCarryItems, setThingsToCarryItems] = useState<string[]>([])
  const [howToReachItems, setHowToReachItems] = useState<string[]>([])
  const [highlightsItems, setHighlightsItems] = useState<string[]>([])
  const [inclusionsItems, setInclusionsItems] = useState<string[]>([])
  const [exclusionsItems, setExclusionsItems] = useState<string[]>([])
  const [faqsItems, setFaqsItems] = useState<{ question: string; answer: string }[]>([])
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [amenityItems, setAmenityItems] = useState<Amenity[]>([])
  const [roomTypeItems, setRoomTypeItems] = useState<RoomType[]>([])
  const [mealPlanItems, setMealPlanItems] = useState<MealPlan[]>([])
  const [locationItems, setLocationItems] = useState<LocationUrl[]>([])

  const [page, setPage] = useState(1)

  const { data: packagesResponse, isLoading } = useQuery({
    queryKey: ['admin-packages', page, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (categoryFilter) params.set('category', categoryFilter)
      const res = await fetch(`/api/packages?${params}`, {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json()
    },
  })

  const packages: PackageData[] = Array.isArray(packagesResponse) ? packagesResponse : (packagesResponse?.data || [])
  const totalPages = Array.isArray(packagesResponse) ? 1 : (packagesResponse?.totalPages || 1)

  const filteredPackages = packages

  const categoryName = categoryFilter ? (categoryLabels[categoryFilter] || categoryFilter) : 'All'

  useEffect(() => {
    if (form.category !== 'stay-hotel' && form.category !== 'stay-camping' && activeTab === 'hotel') setActiveTab('basic')
  }, [form.category, activeTab])

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
      pickupLocationUrl: pkg.pickupLocationUrl || '',
      locationUrls: pkg.locationUrls || '[]',
      cancellationPolicy: pkg.cancellationPolicy,
      faqs: pkg.faqs,
      badge: pkg.badge || '',
      badgeColor: pkg.badgeColor,
      gradient: pkg.gradient,
      featured: pkg.featured,
      active: pkg.active,
      routeLength: pkg.routeLength || '',
      maxAltitude: pkg.maxAltitude || '',
      baseCamp: pkg.baseCamp || '',
      pickupPoint: pkg.pickupPoint || '',
      suitableFor: pkg.suitableFor || '',
      experience: pkg.experience || '',
      fitness: pkg.fitness || '',
      bestSeason: pkg.bestSeason || '',
      gstRate: String(pkg.gstRate ?? 5),
      itinerary: pkg.itinerary || '',
      thingsToCarry: pkg.thingsToCarry || '',
      howToReach: pkg.howToReach || '',
      importantInfo: pkg.importantInfo || '',
      fixedDepartures: pkg.fixedDepartures || '',
      propertyType: pkg.propertyType || '',
    })

    // Parse JSON for visual editors
    try { setItineraryDays(JSON.parse(pkg.itinerary || '[]')) } catch { setItineraryDays([]) }
    try { setFixedDepartures(JSON.parse(pkg.fixedDepartures || '[]')) } catch { setFixedDepartures([]) }
    try { setThingsToCarryItems(JSON.parse(pkg.thingsToCarry || '[]')) } catch { setThingsToCarryItems([]) }
    try { setHowToReachItems(JSON.parse(pkg.howToReach || '[]')) } catch { setHowToReachItems([]) }
    try { setHighlightsItems(JSON.parse(pkg.highlights || '[]')) } catch { setHighlightsItems([]) }
    try { setInclusionsItems(JSON.parse(pkg.inclusions || '[]')) } catch { setInclusionsItems([]) }
    try { setExclusionsItems(JSON.parse(pkg.exclusions || '[]')) } catch { setExclusionsItems([]) }
    try { setFaqsItems(JSON.parse(pkg.faqs || '[]')) } catch { setFaqsItems([]) }
    try { setGalleryImages(JSON.parse(pkg.images || '[]')) } catch { setGalleryImages([]) }
    try { setAmenityItems(JSON.parse(pkg.amenities || '[]')) } catch { setAmenityItems([]) }
    try { setRoomTypeItems(JSON.parse(pkg.roomTypes || '[]')) } catch { setRoomTypeItems([]) }
    try { setMealPlanItems(JSON.parse(pkg.mealPlans || '[]')) } catch { setMealPlanItems([]) }
    try {
      const parsed = JSON.parse(pkg.locationUrls || '[]')
      if (Array.isArray(parsed)) {
        setLocationItems(parsed)
      } else {
        setLocationItems([])
      }
    } catch { setLocationItems([]) }

    setActiveTab('basic')
    setShowForm(true)
  }

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, category: categoryFilter || 'rafting' })
    setItineraryDays([])
    setFixedDepartures([])
    setThingsToCarryItems([])
    setHowToReachItems([])
    setHighlightsItems([])
    setInclusionsItems([])
    setExclusionsItems([])
    setFaqsItems([])
    setGalleryImages([])
    setAmenityItems([])
    setRoomTypeItems([])
    setMealPlanItems([])
    setLocationItems([])
    setActiveTab('basic')
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingId ? `/api/packages/${editingId}` : '/api/packages'
      const method = editingId ? 'PUT' : 'POST'

      const payload = {
        name: form.name,
        slug: form.slug,
        tagline: form.tagline,
        subtitle: form.subtitle,
        description: form.description,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        image: form.image,
        images: JSON.stringify(galleryImages.filter(Boolean)),
        category: form.category,
        distance: form.distance,
        duration: form.duration,
        rapidsLevel: form.rapidsLevel,
        rapidsDescription: form.rapidsDescription,
        targetDemo: form.targetDemo,
        timings: form.timings,
        highlights: JSON.stringify(highlightsItems),
        inclusions: JSON.stringify(inclusionsItems),
        exclusions: JSON.stringify(exclusionsItems),
        eligibility: form.eligibility,
        location: form.location,
        pickupLocationUrl: form.pickupLocationUrl,
        locationUrls: JSON.stringify(locationItems),
        cancellationPolicy: form.cancellationPolicy,
        faqs: JSON.stringify(faqsItems),
        badge: form.badge || null,
        badgeColor: form.badgeColor,
        gradient: form.gradient,
        featured: form.featured,
        active: form.active,
        routeLength: form.routeLength,
        maxAltitude: form.maxAltitude,
        baseCamp: form.baseCamp,
        pickupPoint: form.pickupPoint,
        suitableFor: form.suitableFor,
        experience: form.experience,
        fitness: form.fitness,
        bestSeason: form.bestSeason,
        gstRate: Number(form.gstRate),
        itinerary: JSON.stringify(itineraryDays),
        thingsToCarry: JSON.stringify(thingsToCarryItems),
        howToReach: JSON.stringify(howToReachItems),
        importantInfo: form.importantInfo,
        fixedDepartures: JSON.stringify(fixedDepartures),
        propertyType: form.propertyType || '',
        amenities: JSON.stringify(amenityItems),
        roomTypes: JSON.stringify(roomTypeItems),
        mealPlans: JSON.stringify(mealPlanItems),
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify(payload),
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

  // Visual builder helpers
  const addItineraryDay = () => {
    setItineraryDays([...itineraryDays, {
      day: itineraryDays.length + 1,
      title: '',
      startTime: '',
      endTime: '',
      altitude: '',
      altitudeGain: '',
      distance: '',
      hours: '',
      description: '',
    }])
  }
  const updateItineraryDay = (idx: number, field: keyof ItineraryDay, value: string) => {
    setItineraryDays(itineraryDays.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }
  const removeItineraryDay = (idx: number) => {
    setItineraryDays(itineraryDays.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day: i + 1 })))
  }

  const addFixedDeparture = () => {
    setFixedDepartures([...fixedDepartures, { date: '', status: 'available', notes: '' }])
  }
  const updateFixedDeparture = (idx: number, field: keyof FixedDeparture, value: string) => {
    setFixedDepartures(fixedDepartures.map((d, i) => i === idx ? { ...d, [field]: value } : d))
  }
  const removeFixedDeparture = (idx: number) => {
    setFixedDepartures(fixedDepartures.filter((_, i) => i !== idx))
  }

  const addSimpleItem = (
    items: string[],
    setItems: (items: string[]) => void,
  ) => {
    setItems([...items, ''])
  }
  const updateSimpleItem = (
    items: string[],
    setItems: (items: string[]) => void,
    idx: number,
    value: string,
  ) => {
    setItems(items.map((v, i) => i === idx ? value : v))
  }
  const removeSimpleItem = (
    items: string[],
    setItems: (items: string[]) => void,
    idx: number,
  ) => {
    setItems(items.filter((_, i) => i !== idx))
  }

  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, items: string[], setItems: (items: string[]) => void, idx: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (idx === items.length - 1) {
        setItems([...items, ''])
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>('.item-builder-input')
          inputs[inputs.length - 1]?.focus()
        }, 0)
      }
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10 rounded-t-2xl">
                <h3 className="font-semibold text-lg text-brand-dark">
                  {editingId ? `Edit ${categoryName} Package` : `New ${categoryName} Package`}
                </h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex border-b border-border px-6 overflow-x-auto">
                {([
                  { id: 'basic', label: 'Basic' },
                  { id: 'specs', label: 'Specs' },
                  { id: 'content', label: 'Content' },
                  { id: 'hotel', label: 'Hotel Details' },
                  { id: 'dates', label: 'Dates & Info' },
                ] as const)
                  .filter((tab) => tab.id !== 'hotel' || form.category === 'stay-hotel' || form.category === 'stay-camping')
                  .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-brand-orange text-brand-orange'
                        : 'border-transparent text-muted-foreground hover:text-brand-dark'
                    }`}
                  >
                    {tab.label}
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
                        <Label htmlFor="gstRate">GST Rate (%)</Label>
                        <Input id="gstRate" type="number" value={form.gstRate} onChange={(e) => setForm({ ...form, gstRate: e.target.value })} placeholder="5" />
                      </div>
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="rafting" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="image">Featured Image URL *</Label>
                      <Input id="image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://... or Google Drive link" required />
                      {form.image && (
                        <div className="mt-2 rounded-lg overflow-hidden w-full max-w-xs h-32 border">
                          <img src={toDirectImageUrl(form.image)} alt="featured preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Gallery Images (up to 5)</Label>
                      <div className="space-y-2 mt-1">
                        {galleryImages.map((url, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="flex-1">
                              <Input
                                value={url}
                                onChange={(e) => {
                                  const updated = [...galleryImages]
                                  updated[idx] = e.target.value
                                  setGalleryImages(updated)
                                }}
                                placeholder={`Gallery image ${idx + 1} URL`}
                              />
                              {url && (
                                <div className="mt-1 rounded-md overflow-hidden w-full max-w-[120px] h-16 border">
                                  <img src={toDirectImageUrl(url)} alt={`gallery ${idx + 1}`} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setGalleryImages(galleryImages.filter((_, i) => i !== idx))}
                              className="mt-1 p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {galleryImages.length < 5 && (
                          <button
                            type="button"
                            onClick={() => setGalleryImages([...galleryImages, ''])}
                            className="flex items-center gap-1.5 text-sm text-brand-orange hover:underline font-medium"
                          >
                            <Plus className="w-4 h-4" /> Add Image
                          </button>
                        )}
                      </div>
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

                {activeTab === 'specs' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="distance">Distance (e.g. 9 km)</Label>
                        <Input id="distance" value={form.distance} onChange={(e) => setForm({ ...form, distance: e.target.value })} placeholder="9 km" />
                      </div>
                      {form.category !== 'rafting' && (
                        <>
                          <div>
                            <Label htmlFor="routeLength">Route Length (e.g. 43 KM)</Label>
                            <Input id="routeLength" value={form.routeLength} onChange={(e) => setForm({ ...form, routeLength: e.target.value })} placeholder="43 KM" />
                          </div>
                          <div>
                            <Label htmlFor="maxAltitude">Max Altitude (e.g. 11,800 FT)</Label>
                            <Input id="maxAltitude" value={form.maxAltitude} onChange={(e) => setForm({ ...form, maxAltitude: e.target.value })} placeholder="11,800 FT" />
                          </div>
                        </>
                      )}
                      <div>
                        <Label htmlFor="duration">Duration (e.g. 6N/7D)</Label>
                        <Input id="duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="6N/7D" />
                      </div>
                      {form.category !== 'rafting' && (
                        <div>
                          <Label htmlFor="baseCamp">Base Camp (e.g. Sankari)</Label>
                          <Input id="baseCamp" value={form.baseCamp} onChange={(e) => setForm({ ...form, baseCamp: e.target.value })} placeholder="Sankari" />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="pickupPoint">{form.category === 'rafting' ? 'Rafting Starting Point' : 'Pickup Point (e.g. Dehradun)'}</Label>
                        <Input id="pickupPoint" value={form.pickupPoint} onChange={(e) => setForm({ ...form, pickupPoint: e.target.value })} placeholder={form.category === 'rafting' ? 'e.g. Shivpuri, Marine Drive' : 'Dehradun'} />
                      </div>
                      <div>
                        <Label htmlFor="rapidsLevel">Difficulty / Grade</Label>
                        <Input id="rapidsLevel" value={form.rapidsLevel} onChange={(e) => setForm({ ...form, rapidsLevel: e.target.value })} placeholder="Easy to Moderate" />
                      </div>
                      <div>
                        <Label htmlFor="rapidsDescription">Difficulty Description</Label>
                        <Input id="rapidsDescription" value={form.rapidsDescription} onChange={(e) => setForm({ ...form, rapidsDescription: e.target.value })} placeholder="Suitable for first-timers" />
                      </div>
                      <div>
                        <Label htmlFor="bestSeason">Best Season</Label>
                        <Input id="bestSeason" value={form.bestSeason} onChange={(e) => setForm({ ...form, bestSeason: e.target.value })} placeholder="Apr-Jun, Sep-Nov" />
                      </div>
                      <div>
                        <Label htmlFor="timings">Timings</Label>
                        <Input id="timings" value={form.timings} onChange={(e) => setForm({ ...form, timings: e.target.value })} placeholder="07:00 AM to 04:00 PM" />
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <h4 className="font-semibold text-brand-dark mb-3">Mandatory Guidelines</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="suitableFor">Suitable For</Label>
                          <Input id="suitableFor" value={form.suitableFor} onChange={(e) => setForm({ ...form, suitableFor: e.target.value })} placeholder="10+ Years" />
                        </div>
                        <div>
                          <Label htmlFor="experience">Experience Required</Label>
                          <Input id="experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="First timer can apply" />
                        </div>
                        <div>
                          <Label htmlFor="fitness">Fitness Required</Label>
                          <Input id="fitness" value={form.fitness} onChange={(e) => setForm({ ...form, fitness: e.target.value })} placeholder="Cover 5 km in 30 min" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="targetDemo">Target Audience</Label>
                      <Input id="targetDemo" value={form.targetDemo} onChange={(e) => setForm({ ...form, targetDemo: e.target.value })} placeholder="Families, beginners, groups" />
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
                      <div className="flex items-center justify-between mb-2">
                        <Label>Map Locations (Google Maps)</Label>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setLocationItems([...locationItems, { caption: '', url: '' }])}
                        >
                          <PlusIcon className="w-3 h-3 mr-1" /> Add Location
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">Add Google Maps URLs with labels (e.g. Pickup Location, Drop-off Point)</p>
                      {locationItems.length === 0 && (
                        <p className="text-sm text-muted-foreground italic">No locations added yet. Click "Add Location" to begin.</p>
                      )}
                      {locationItems.map((loc, idx) => (
                        <div key={idx} className="flex items-start gap-2 mb-3 p-3 bg-brand-cream/50 rounded-lg border border-border/50">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={loc.caption}
                              onChange={(e) => {
                                const updated = [...locationItems]
                                updated[idx] = { ...updated[idx], caption: e.target.value }
                                setLocationItems(updated)
                              }}
                              placeholder="Caption (e.g. Pickup Location, Drop-off Point)"
                            />
                            <Input
                              value={loc.url}
                              onChange={(e) => {
                                const updated = [...locationItems]
                                updated[idx] = { ...updated[idx], url: e.target.value }
                                setLocationItems(updated)
                              }}
                              placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/..."
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive shrink-0 mt-1"
                            onClick={() => setLocationItems(locationItems.filter((_, i) => i !== idx))}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
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
                      <div className="flex items-center justify-between mb-2">
                        <Label>Highlights</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => addSimpleItem(highlightsItems, setHighlightsItems)}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {highlightsItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input value={item} onChange={(e) => updateSimpleItem(highlightsItems, setHighlightsItems, idx, e.target.value)} placeholder={`Highlight ${idx + 1}`} className="item-builder-input" onKeyDown={(e) => handleItemKeyDown(e, highlightsItems, setHighlightsItems, idx)} />
                            <Button type="button" size="icon" variant="ghost" onClick={() => removeSimpleItem(highlightsItems, setHighlightsItems, idx)}>
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {highlightsItems.length === 0 && <p className="text-xs text-muted-foreground">No highlights. Click Add to create.</p>}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Inclusions</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => addSimpleItem(inclusionsItems, setInclusionsItems)}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {inclusionsItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input value={item} onChange={(e) => updateSimpleItem(inclusionsItems, setInclusionsItems, idx, e.target.value)} placeholder={`Inclusion ${idx + 1}`} className="item-builder-input" onKeyDown={(e) => handleItemKeyDown(e, inclusionsItems, setInclusionsItems, idx)} />
                            <Button type="button" size="icon" variant="ghost" onClick={() => removeSimpleItem(inclusionsItems, setInclusionsItems, idx)}>
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {inclusionsItems.length === 0 && <p className="text-xs text-muted-foreground">No inclusions. Click Add to create.</p>}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Exclusions</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => addSimpleItem(exclusionsItems, setExclusionsItems)}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {exclusionsItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input value={item} onChange={(e) => updateSimpleItem(exclusionsItems, setExclusionsItems, idx, e.target.value)} placeholder={`Exclusion ${idx + 1}`} className="item-builder-input" onKeyDown={(e) => handleItemKeyDown(e, exclusionsItems, setExclusionsItems, idx)} />
                            <Button type="button" size="icon" variant="ghost" onClick={() => removeSimpleItem(exclusionsItems, setExclusionsItems, idx)}>
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {exclusionsItems.length === 0 && <p className="text-xs text-muted-foreground">No exclusions. Click Add to create.</p>}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>FAQs</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => setFaqsItems([...faqsItems, { question: '', answer: '' }])}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add FAQ
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {faqsItems.map((item, idx) => (
                          <div key={idx} className="border border-border rounded-xl p-3 space-y-2">
                            <Input value={item.question} onChange={(e) => setFaqsItems(faqsItems.map((f, i) => i === idx ? { ...f, question: e.target.value } : f))} placeholder="Question" />
                            <Textarea value={item.answer} onChange={(e) => setFaqsItems(faqsItems.map((f, i) => i === idx ? { ...f, answer: e.target.value } : f))} rows={2} placeholder="Answer" />
                            <div className="flex justify-end">
                              <Button type="button" size="sm" variant="ghost" onClick={() => setFaqsItems(faqsItems.filter((_, i) => i !== idx))}>
                                <TrashIcon className="w-4 h-4 text-red-500 mr-1" /> Remove
                              </Button>
                            </div>
                          </div>
                        ))}
                        {faqsItems.length === 0 && <p className="text-xs text-muted-foreground">No FAQs. Click Add FAQ to create.</p>}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'hotel' && (
                  <>
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <select
                        id="propertyType"
                        value={form.propertyType}
                        onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Select property type</option>
                        <option value="hotel">Hotel</option>
                        <option value="resort">Resort</option>
                        <option value="camping">Camping</option>
                        <option value="homestay">Homestay</option>
                        <option value="villa">Villa</option>
                        <option value="guesthouse">Guest House</option>
                      </select>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Amenities</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => setAmenityItems([...amenityItems, { icon: 'wifi', name: '' }])}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Icon options: wifi, parking, gym, pool, spa, restaurant, bar, roomservice, traveldesk, conference, bonfire</p>
                      <div className="space-y-2">
                        {amenityItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <select
                              value={item.icon}
                              onChange={(e) => setAmenityItems(amenityItems.map((a, i) => i === idx ? { ...a, icon: e.target.value } : a))}
                              className="w-28 h-10 px-2 rounded-md border border-input bg-background text-sm"
                            >
                              <option value="wifi">WiFi</option>
                              <option value="parking">Parking</option>
                              <option value="gym">Gym</option>
                              <option value="pool">Pool</option>
                              <option value="spa">Spa</option>
                              <option value="restaurant">Restaurant</option>
                              <option value="bar">Bar</option>
                              <option value="roomservice">Room Service</option>
                              <option value="traveldesk">Travel Desk</option>
                              <option value="conference">Conference</option>
                              <option value="bonfire">Bonfire</option>
                              <option value="other">Other</option>
                            </select>
                            <Input
                              value={item.name}
                              onChange={(e) => setAmenityItems(amenityItems.map((a, i) => i === idx ? { ...a, name: e.target.value } : a))}
                              placeholder="Amenity name"
                              className="flex-1"
                            />
                            <Button type="button" size="icon" variant="ghost" onClick={() => setAmenityItems(amenityItems.filter((_, i) => i !== idx))}>
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {amenityItems.length === 0 && <p className="text-xs text-muted-foreground">No amenities. Click Add to create.</p>}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Room Types</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => setRoomTypeItems([...roomTypeItems, { name: '', price: 0, plan: 'room only', guests: 2, baseOccupancy: 2, maxAdults: 2, maxChildren: 1, extraAdultPrice: 0, extraChildPrice: 0, bed: '', size: '', pricingTiers: [] }])}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add Room
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {roomTypeItems.map((item, idx) => (
                          <div key={idx} className="border border-border rounded-xl p-3 space-y-2 bg-brand-cream/30">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-brand-orange">Room {idx + 1}</span>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setRoomTypeItems(roomTypeItems.filter((_, i) => i !== idx))}>
                                <TrashIcon className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input value={item.name} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, name: e.target.value } : r))} placeholder="Room name (e.g. Deluxe Room)" />
                              <Input type="number" value={item.price || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, price: Number(e.target.value) } : r))} placeholder="Price per night (₹)" />
                              <select
                                value={item.plan}
                                onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, plan: e.target.value } : r))}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                              >
                                <option value="room only">Room Only</option>
                                <option value="breakfast included">Breakfast Included</option>
                                <option value="half board">Half Board (B+D)</option>
                                <option value="full board">Full Board (B+L+D)</option>
                                <option value="all inclusive">All Inclusive</option>
                              </select>
                              <Input type="number" value={item.guests || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, guests: Number(e.target.value) } : r))} placeholder="Max guests (capacity)" />
                              <Input type="number" value={item.maxAdults || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, maxAdults: Number(e.target.value) } : r))} placeholder="Max adults / room" />
                              <Input type="number" value={item.maxChildren || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, maxChildren: Number(e.target.value) } : r))} placeholder="Max children / room" />
                              <Input type="number" value={item.baseOccupancy || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, baseOccupancy: Number(e.target.value) } : r))} placeholder="Base occupancy (incl. pax, e.g. 2)" />
                              <Input type="number" value={item.extraAdultPrice || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, extraAdultPrice: Number(e.target.value) } : r))} placeholder="Extra adult / night (₹)" />
                              <Input type="number" value={item.extraChildPrice || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, extraChildPrice: Number(e.target.value) } : r))} placeholder="Extra child / night (₹)" />
                              <Input value={item.bed} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, bed: e.target.value } : r))} placeholder="Bed type (e.g. 1 King Bed)" />
                              <Input value={item.size} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, size: e.target.value } : r))} placeholder="Room size (e.g. 280 sq ft)" />
                            </div>
                            {form.category === 'stay-camping' && (
                              <div className="border-t border-border pt-2 mt-2">
                                <div className="flex items-center justify-between mb-1.5">
                                  <Label className="text-xs font-semibold text-brand-orange">Group-size Pricing Tiers (per person / night)</Label>
                                  <Button type="button" size="sm" variant="outline" onClick={() => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, pricingTiers: [...(r.pricingTiers || []), { minPax: 2, maxPax: 2, pricePerPerson: 0 }] } : r))}>
                                    <PlusIcon className="w-3 h-3 mr-1" /> Add Tier
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {(item.pricingTiers || []).map((tier: any, tIdx: number) => (
                                    <div key={tIdx} className="flex items-end gap-2">
                                      <div className="flex-1">
                                        <Label className="text-[10px] text-muted-foreground">Min Pax</Label>
                                        <Input type="number" value={tier.minPax || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, pricingTiers: (r.pricingTiers || []).map((t: any, j: number) => j === tIdx ? { ...t, minPax: Number(e.target.value) } : t) } : r))} />
                                      </div>
                                      <div className="flex-1">
                                        <Label className="text-[10px] text-muted-foreground">Max Pax</Label>
                                        <Input type="number" value={tier.maxPax || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, pricingTiers: (r.pricingTiers || []).map((t: any, j: number) => j === tIdx ? { ...t, maxPax: Number(e.target.value) } : t) } : r))} />
                                      </div>
                                      <div className="flex-1">
                                        <Label className="text-[10px] text-muted-foreground">₹ / pax / night</Label>
                                        <Input type="number" value={tier.pricePerPerson || ''} onChange={(e) => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, pricingTiers: (r.pricingTiers || []).map((t: any, j: number) => j === tIdx ? { ...t, pricePerPerson: Number(e.target.value) } : t) } : r))} />
                                      </div>
                                      <Button type="button" size="sm" variant="ghost" onClick={() => setRoomTypeItems(roomTypeItems.map((r, i) => i === idx ? { ...r, pricingTiers: (r.pricingTiers || []).filter((_: any, j: number) => j !== tIdx) } : r))}>
                                        <TrashIcon className="w-4 h-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                  {(item.pricingTiers || []).length === 0 && <p className="text-[11px] text-muted-foreground">No tiers — a flat ₹{item.price}/night per person will apply.</p>}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        {roomTypeItems.length === 0 && <p className="text-xs text-muted-foreground">No room types. Click Add Room to create.</p>}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Meal Plans</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => setMealPlanItems([...mealPlanItems, { name: '', description: '', price: 0 }])}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add Meal Plan
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {mealPlanItems.map((item, idx) => (
                          <div key={idx} className="border border-border rounded-xl p-3 space-y-2 bg-brand-cream/30">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-brand-orange">Plan {idx + 1}</span>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setMealPlanItems(mealPlanItems.filter((_, i) => i !== idx))}>
                                <TrashIcon className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <Input value={item.name} onChange={(e) => setMealPlanItems(mealPlanItems.map((m, i) => i === idx ? { ...m, name: e.target.value } : m))} placeholder="Plan name (e.g. Breakfast Only)" />
                              <Input type="number" value={item.price || ''} onChange={(e) => setMealPlanItems(mealPlanItems.map((m, i) => i === idx ? { ...m, price: Number(e.target.value) } : m))} placeholder="Price per person (₹)" />
                            </div>
                            <Textarea value={item.description} onChange={(e) => setMealPlanItems(mealPlanItems.map((m, i) => i === idx ? { ...m, description: e.target.value } : m))} rows={2} placeholder="Description (e.g. Veg thali, buffet, live counters)" />
                          </div>
                        ))}
                        {mealPlanItems.length === 0 && <p className="text-xs text-muted-foreground">No meal plans. Click Add Meal Plan to create.</p>}
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'dates' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Fixed Departure Dates</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addFixedDeparture}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add Date
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {fixedDepartures.map((dep, idx) => (
                          <div key={idx} className="border border-border rounded-xl p-3 space-y-2 bg-brand-cream/30">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-brand-orange">Departure {idx + 1}</span>
                              <Button type="button" size="sm" variant="ghost" onClick={() => removeFixedDeparture(idx)}>
                                <TrashIcon className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <Label className="text-xs">Date</Label>
                                <Input type="date" value={dep.date} onChange={(e) => updateFixedDeparture(idx, 'date', e.target.value)} />
                              </div>
                              <div>
                                <Label className="text-xs">Status</Label>
                                <select
                                  value={dep.status}
                                  onChange={(e) => updateFixedDeparture(idx, 'status', e.target.value)}
                                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                  <option value="available">Available</option>
                                  <option value="few-seats">Few Seats</option>
                                  <option value="sold-out">Sold Out</option>
                                </select>
                              </div>
                            </div>
                            <Input value={dep.notes} onChange={(e) => updateFixedDeparture(idx, 'notes', e.target.value)} placeholder="Notes (optional, e.g. 'Full moon trek', 'Christmas special')" />
                          </div>
                        ))}
                        {fixedDepartures.length === 0 && <p className="text-xs text-muted-foreground">No departure dates. Click Add Date to schedule batches.</p>}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Itinerary (Day-by-Day)</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addItineraryDay}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add Day
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {itineraryDays.map((day, idx) => (
                          <div key={idx} className="border border-border rounded-xl p-3 space-y-2 bg-brand-cream/30">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-brand-orange">Day {day.day}</span>
                              <Button type="button" size="sm" variant="ghost" onClick={() => removeItineraryDay(idx)}>
                                <TrashIcon className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                            <Input value={day.title} onChange={(e) => updateItineraryDay(idx, 'title', e.target.value)} placeholder="Day title (e.g. Dehradun to Sankri)" />
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <Input value={day.startTime} onChange={(e) => updateItineraryDay(idx, 'startTime', e.target.value)} placeholder="Start time" />
                              <Input value={day.endTime} onChange={(e) => updateItineraryDay(idx, 'endTime', e.target.value)} placeholder="End time" />
                              <Input value={day.altitude} onChange={(e) => updateItineraryDay(idx, 'altitude', e.target.value)} placeholder="Altitude (e.g. 6400 ft)" />
                              <Input value={day.altitudeGain} onChange={(e) => updateItineraryDay(idx, 'altitudeGain', e.target.value)} placeholder="Gain/Loss (e.g. 4300 ft)" />
                              <Input value={day.distance} onChange={(e) => updateItineraryDay(idx, 'distance', e.target.value)} placeholder="Distance (e.g. 220 km)" />
                              <Input value={day.hours} onChange={(e) => updateItineraryDay(idx, 'hours', e.target.value)} placeholder="Hours (e.g. 10 hrs)" />
                            </div>
                            <Textarea value={day.description} onChange={(e) => updateItineraryDay(idx, 'description', e.target.value)} rows={3} placeholder="Day description / activities..." />
                          </div>
                        ))}
                        {itineraryDays.length === 0 && <p className="text-xs text-muted-foreground">No itinerary days. Click Add Day to create day-wise plan.</p>}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <Label>Things To Carry</Label>
                        <Button type="button" size="sm" variant="outline" onClick={() => addSimpleItem(thingsToCarryItems, setThingsToCarryItems)}>
                          <PlusIcon className="w-3 h-3 mr-1" /> Add
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">Add one item per line. E.g. "Backpack with rain cover", "Trekking shoes (waterproof)", etc.</p>
                      <div className="space-y-2">
                        {thingsToCarryItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input value={item} onChange={(e) => updateSimpleItem(thingsToCarryItems, setThingsToCarryItems, idx, e.target.value)} placeholder={`Item ${idx + 1}`} className="item-builder-input" onKeyDown={(e) => handleItemKeyDown(e, thingsToCarryItems, setThingsToCarryItems, idx)} />
                            <Button type="button" size="icon" variant="ghost" onClick={() => removeSimpleItem(thingsToCarryItems, setThingsToCarryItems, idx)}>
                              <TrashIcon className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                        {thingsToCarryItems.length === 0 && <p className="text-xs text-muted-foreground">No items. Click Add to create.</p>}
                      </div>
                    </div>

                    {form.category !== 'taxi-booking' && (
                      <div className="border-t border-border pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label>How To Reach</Label>
                          <Button type="button" size="sm" variant="outline" onClick={() => addSimpleItem(howToReachItems, setHowToReachItems)}>
                            <PlusIcon className="w-3 h-3 mr-1" /> Add
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">Add transport options. E.g. "BUS: AC Volvo from Delhi ISBT Kashmere Gate, 6-8 hr journey", "TRAIN: 12017 Dehradun Shatabdi from New Delhi, 6 hr 10 min"</p>
                        <div className="space-y-2">
                          {howToReachItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <Input value={item} onChange={(e) => updateSimpleItem(howToReachItems, setHowToReachItems, idx, e.target.value)} placeholder={`Transport option ${idx + 1}`} className="item-builder-input" onKeyDown={(e) => handleItemKeyDown(e, howToReachItems, setHowToReachItems, idx)} />
                              <Button type="button" size="icon" variant="ghost" onClick={() => removeSimpleItem(howToReachItems, setHowToReachItems, idx)}>
                                <TrashIcon className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                          {howToReachItems.length === 0 && <p className="text-xs text-muted-foreground">No transport options. Click Add to create.</p>}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border pt-4">
                      <Label htmlFor="importantInfo">Important Information (Waivers, Safety, Disclaimers)</Label>
                      <Textarea id="importantInfo" value={form.importantInfo} onChange={(e) => setForm({ ...form, importantInfo: e.target.value })} rows={6} placeholder="Personal confirmation statement, parent/guardian approval, medical liability waiver, etc." />
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
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Max Alt.</th>
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
                    <td className="py-3 px-4 text-muted-foreground">{pkg.maxAltitude || '—'}</td>
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
      {totalPages > 1 && (
        <div className="mt-4 border-t border-border p-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
