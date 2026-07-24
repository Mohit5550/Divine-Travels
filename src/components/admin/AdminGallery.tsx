'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pagination } from '@/components/ui/Pagination'
import { useAppStore } from '@/lib/store'
import { Plus, Star, Trash2, X, Camera, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  url: string
  title: string
  alt: string
  category: string
  featured: boolean
  order: number
  active: boolean
}

const MAX_FEATURED = 5

export function AdminGallery() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ url: '', title: '', alt: '', category: '', featured: false, active: true })
  const [saving, setSaving] = useState(false)

  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-gallery', user?.id, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/gallery?page=${page}&limit=20`, { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return { data: [], totalPages: 1 }
      return res.json()
    },
  })

  const images: GalleryImage[] = Array.isArray(data) ? data : (data?.data || [])
  const totalPages = Array.isArray(data) ? 1 : (data?.totalPages || 1)

  const featuredCount = images.filter((i) => i.featured).length
  const activeCount = images.filter((i) => i.active).length

  const openAdd = () => {
    setEditingId(null)
    setForm({ url: '', title: '', alt: '', category: '', featured: false, active: true })
    setShowForm(true)
  }

  const openEdit = (img: GalleryImage) => {
    setEditingId(img.id)
    setForm({ url: img.url, title: img.title, alt: img.alt, category: img.category, featured: img.featured, active: img.active })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.url) { toast.error('Image URL is required'); return }
    if (!form.title) { toast.error('Title is required'); return }
    if (form.featured && !editingId) {
      const currentFeatured = images.filter((i) => i.featured).length
      if (currentFeatured >= MAX_FEATURED) {
        toast.error(`Maximum ${MAX_FEATURED} featured images allowed. Unfeature another image first.`)
        return
      }
    }
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/gallery/${editingId}` : '/api/admin/gallery'
      const method = editingId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Failed to save')
        return
      }
      toast.success(editingId ? 'Image updated!' : 'Image added!')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleToggleFeatured = async (img: GalleryImage) => {
    const newFeatured = !img.featured
    if (newFeatured && featuredCount >= MAX_FEATURED) {
      toast.error(`Maximum ${MAX_FEATURED} featured images allowed. Unfeature another image first.`)
      return
    }
    try {
      const res = await fetch(`/api/admin/gallery/${img.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ ...img, featured: newFeatured }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast.error(err.error || 'Failed to update')
        return
      }
      toast.success(newFeatured ? 'Marked as featured' : 'Removed from featured')
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
    } catch { toast.error('Failed to update') }
  }

  const handleToggleActive = async (img: GalleryImage) => {
    try {
      const res = await fetch(`/api/admin/gallery/${img.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ ...img, active: !img.active }),
      })
      if (!res.ok) { toast.error('Failed to update'); return }
      toast.success(img.active ? 'Hidden from gallery' : 'Visible in gallery')
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image permanently?')) return
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE', headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) { toast.error('Failed to delete'); return }
      toast.success('Image deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
    } catch { toast.error('Failed to delete') }
  }

  const categories = [...new Set(images.map((i) => i.category).filter(Boolean))]
  const [filterCat, setFilterCat] = useState('')
  const filtered = filterCat ? images.filter((i) => i.category === filterCat) : images

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Gallery</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {images.length} {images.length === 1 ? 'image' : 'images'} · {featuredCount}/{MAX_FEATURED} featured · {activeCount} active
          </p>
        </div>
        <Button onClick={openAdd} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Image
        </Button>
      </div>

      {categories.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button variant={filterCat === '' ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat('')} className={filterCat === '' ? 'bg-brand-orange text-white' : ''}>All</Button>
          {categories.map((cat) => (
            <Button key={cat} variant={filterCat === cat ? 'default' : 'outline'} size="sm" onClick={() => setFilterCat(cat)} className={filterCat === cat ? 'bg-brand-orange text-white' : ''}>{cat}</Button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
          >
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-semibold text-lg text-brand-dark flex items-center gap-2">
                  <Camera className="w-5 h-5 text-brand-orange" />
                  {editingId ? 'Edit Image' : 'Add Image'}
                </h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="gurl">Image URL *</Label>
                  <Input id="gurl" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="/gallery/img-17.jpg or https://..." />
                </div>
                {form.url && (
                  <div className="rounded-lg overflow-hidden h-40 border bg-muted">
                    <img src={form.url} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
                <div>
                  <Label htmlFor="gtitle">Title *</Label>
                  <Input id="gtitle" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Mountain Trekking Adventure" />
                </div>
                <div>
                  <Label htmlFor="galt">Alt Text</Label>
                  <Input id="galt" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} placeholder="Description for accessibility" />
                </div>
                <div>
                  <Label htmlFor="gcat">Category</Label>
                  <Input id="gcat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Trekking, Camping, Adventure, Stay..." />
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                    />
                    Featured ({featuredCount}/{MAX_FEATURED})
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-brand-dark cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange"
                    />
                    Active
                  </label>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white flex-1">
                    {saving ? 'Saving...' : (editingId ? 'Save Changes' : 'Add to Gallery')}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No images found</p>
          <p className="text-xs mt-1">Click "Add Image" to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((img) => (
            <div key={img.id} className={cn('bg-white rounded-xl shadow-sm overflow-hidden group', !img.active && 'opacity-50')}>
              <div className="aspect-square bg-muted relative">
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Error' }} />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {img.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-brand-orange text-white text-[10px] font-bold shadow-md flex items-center gap-1 w-fit">
                      <Star className="w-3 h-3 fill-white" /> Featured
                    </span>
                  )}
                  {!img.active && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-700 text-white text-[10px] font-bold shadow-md w-fit">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleFeatured(img)}
                    title={img.featured ? 'Unfeature' : 'Mark as featured'}
                    className={cn(
                      'w-8 h-8 rounded-lg shadow flex items-center justify-center',
                      img.featured ? 'bg-brand-orange text-white' : 'bg-white/90 text-brand-dark hover:bg-white'
                    )}
                  >
                    <Star className={cn('w-4 h-4', img.featured && 'fill-white')} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(img)}
                    title={img.active ? 'Hide' : 'Show'}
                    className="w-8 h-8 rounded-lg bg-white/90 shadow flex items-center justify-center hover:bg-white text-brand-dark"
                  >
                    {img.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-semibold text-brand-dark truncate">{img.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{img.url}</p>
                {img.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-cream text-muted-foreground mt-1 inline-block">{img.category}</span>}
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                  <button onClick={() => openEdit(img)} className="text-[11px] text-brand-teal hover:underline font-medium">Edit</button>
                  <button onClick={() => handleDelete(img.id)} className="text-[11px] text-red-500 hover:underline font-medium flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="mt-4 border-t border-border p-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
