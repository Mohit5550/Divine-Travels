'use client'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pagination } from '@/components/ui/Pagination'
import { useAppStore } from '@/lib/store'
import { Plus, Trash2, Copy, Check, X, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export function AdminMedia() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [alt, setAlt] = useState('')
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)

  const [page, setPage] = useState(1)

  const { data: mediaResponse, isLoading } = useQuery({
    queryKey: ['admin-media', user?.id, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/media?page=${page}&limit=20`, { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return { data: [], totalPages: 1 }
      return res.json()
    },
  })

  const media = Array.isArray(mediaResponse) ? mediaResponse : (mediaResponse?.data || [])
  const totalPages = Array.isArray(mediaResponse) ? 1 : (mediaResponse?.totalPages || 1)

  const handleAdd = async () => {
    if (!url) { toast.error('URL is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ url, label, alt, category }),
      })
      if (!res.ok) { toast.error('Failed to add'); return }
      toast.success('Media added!')
      setUrl(''); setLabel(''); setAlt(''); setCategory('')
      setShowForm(false)
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
    } catch { toast.error('Failed to add') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this media?')) return
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: 'DELETE', headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) { toast.error('Failed to delete'); return }
      toast.success('Media removed')
      queryClient.invalidateQueries({ queryKey: ['admin-media'] })
    } catch { toast.error('Failed to delete') }
  }

  const [copiedId, setCopiedId] = useState<string | null>(null)
  const copyUrl = async (u: string, id: string) => {
    await navigator.clipboard.writeText(u)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const categories = [...new Set((media as Array<Record<string, unknown>>).map((m) => m.category).filter(Boolean))] as string[]
  const [filterCat, setFilterCat] = useState('')

  const filtered = filterCat ? (media as Array<Record<string, unknown>>).filter((m) => m.category === filterCat) : (media as Array<Record<string, unknown>>)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Media Library</h2>
          <p className="text-sm text-muted-foreground mt-1">{(media as unknown[]).length} item{(media as unknown[]).length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
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
                <h3 className="font-semibold text-lg text-brand-dark">Add Media</h3>
                <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <Label htmlFor="url">Image URL *</Label>
                  <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                </div>
                {url && (
                  <div className="rounded-lg overflow-hidden h-32 border">
                    <img src={url} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                )}
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Rishikesh rafting" />
                </div>
                <div>
                  <Label htmlFor="alt">Alt Text</Label>
                  <Input id="alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Description for accessibility" />
                </div>
                <div>
                  <Label htmlFor="cat">Category</Label>
                  <Input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="rafting, trekking, etc." />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleAdd} disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white flex-1">
                    {saving ? 'Adding...' : 'Add to Library'}
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
        <div className="p-8 text-center text-muted-foreground">No media found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(filtered as Array<Record<string, unknown>>).map((item) => (
            <div key={item.id as string} className="bg-white rounded-xl shadow-sm overflow-hidden group">
              <div className="aspect-square bg-muted relative">
                <img src={item.url as string} alt={(item.alt as string) || ''} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e2e8f0/94a3b8?text=Error' }} />
                <button
                  onClick={() => copyUrl(item.url as string, item.id as string)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-white/90 shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                >
                  {copiedId === item.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-brand-dark truncate">{(item.label as string) || 'Untitled'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.url as string}</p>
                {!!item.category && <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-cream text-muted-foreground mt-1 inline-block">{String(item.category)}</span>}
                <button onClick={() => handleDelete(item.id as string)} className="text-[10px] text-red-500 hover:underline mt-1 block">Remove</button>
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
