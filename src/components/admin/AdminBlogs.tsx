'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Plus, Pencil, Trash2, X, Check, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { BlogEditor } from './BlogEditor'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { toDirectImageUrl } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage: string | null
  tags: string
  categoryId: string | null
  author: string
  published: boolean
  publishedAt: string | null
  createdAt: string
  category: { id: string; name: string; slug: string } | null
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  _count: { blogs: number }
}

type SubTab = 'posts' | 'categories'

const emptyPost = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featuredImage: '',
  tags: '',
  categoryId: '',
  author: 'Divine Travels',
  published: false,
}

export function AdminBlogs() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [subTab, setSubTab] = useState<SubTab>('posts')
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyPost)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Category modal
  const [showCatModal, setShowCatModal] = useState(false)
  const [editCat, setEditCat] = useState<BlogCategory | null>(null)
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '' })
  const [catSaving, setCatSaving] = useState(false)

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-blogs', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/blogs', { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return { blogs: [], total: 0, page: 1, totalPages: 0 }
      return res.json()
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-blog-categories', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/blogs/categories', { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return []
      return res.json() as Promise<BlogCategory[]>
    },
  })

  const posts: BlogPost[] = postsData?.blogs || []

  const filteredPosts = posts.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const resetForm = () => {
    setForm(emptyPost)
    setEditingPost(null)
    setShowForm(false)
  }

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      featuredImage: post.featuredImage || '',
      tags: post.tags ? (() => { try { return JSON.parse(post.tags).join(', ') } catch { return post.tags } })() : '',
      categoryId: post.categoryId || '',
      author: post.author || 'Divine Travels',
      published: post.published,
    })
    setEditingPost(post)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.slug || !form.content) {
      toast.error('Title, slug, and content are required')
      return
    }
    setSaving(true)
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    const payload = {
      ...form,
      tags,
      categoryId: form.categoryId || null,
      featuredImage: form.featuredImage || null,
    }

    try {
      const url = editingPost
        ? `/api/admin/blogs/${editingPost.id}`
        : '/api/admin/blogs'
      const method = editingPost ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'x-user-id': user?.id || '', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }
      toast.success(editingPost ? 'Post updated' : 'Post created')
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
      resetForm()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Post deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
    } catch {
      toast.error('Failed to delete')
    }
  }

  const togglePublished = async (post: BlogPost) => {
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}`, {
        method: 'PUT',
        headers: { 'x-user-id': user?.id || '', 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      })
      if (!res.ok) throw new Error('Failed to update')
      toast.success(post.published ? 'Unpublished' : 'Published')
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
    } catch {
      toast.error('Failed to update')
    }
  }

  // Category handlers
  const openCatForm = (cat?: BlogCategory) => {
    if (cat) {
      setCatForm({ name: cat.name, slug: cat.slug, description: cat.description || '' })
      setEditCat(cat)
    } else {
      setCatForm({ name: '', slug: '', description: '' })
      setEditCat(null)
    }
    setShowCatModal(true)
  }

  const handleCatSave = async () => {
    if (!catForm.name || !catForm.slug) {
      toast.error('Name and slug required')
      return
    }
    setCatSaving(true)
    try {
      const url = '/api/admin/blogs/categories'
      const method = editCat ? 'PUT' : 'POST'
      const body = editCat ? { id: editCat.id, ...catForm } : catForm
      const res = await fetch(url, {
        method,
        headers: { 'x-user-id': user?.id || '', 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save category')
      }
      toast.success(editCat ? 'Category updated' : 'Category created')
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] })
      setShowCatModal(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setCatSaving(false)
    }
  }

  const handleCatDelete = async (id: string) => {
    if (!confirm('Delete this category? Posts in this category will be uncategorized.')) return
    try {
      const res = await fetch(`/api/admin/blogs/categories?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) throw new Error('Failed to delete')
      toast.success('Category deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-blog-categories'] })
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Blog</h2>
          <p className="text-sm text-gray-500 mt-1">{posts.length} posts, {categories.length} categories</p>
        </div>
        {subTab === 'posts' && !showForm && (
          <Button onClick={() => { resetForm(); setShowForm(true) }} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
            <Plus className="w-4 h-4 mr-1" /> New Post
          </Button>
        )}
        {subTab === 'categories' && (
          <Button onClick={() => openCatForm()} className="bg-brand-teal hover:bg-brand-teal/90 text-white">
            <Plus className="w-4 h-4 mr-1" /> New Category
          </Button>
        )}
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm border border-gray-200 w-fit">
        <button onClick={() => setSubTab('posts')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${subTab === 'posts' ? 'bg-brand-orange text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Posts</button>
        <button onClick={() => setSubTab('categories')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${subTab === 'categories' ? 'bg-brand-orange text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Categories</button>
      </div>

      {subTab === 'posts' && (
        <>
          {showForm ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg text-brand-dark">{editingPost ? 'Edit Post' : 'New Post'}</h3>
                <button onClick={resetForm} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value, slug: editingPost ? form.slug : generateSlug(e.target.value) })} placeholder="Post title" />
                </div>
                <div>
                  <Label>Slug *</Label>
                  <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="post-slug" />
                </div>
              </div>
              <div className="mb-4">
                <Label>Excerpt</Label>
                <Textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief description for listing" rows={2} />
              </div>
              <div className="mb-4">
                <Label>Content *</Label>
                <BlogEditor
                  value={form.content}
                  onChange={(value) => setForm({ ...form, content: value })}
                  placeholder="Start writing your blog post..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label>Featured Image URL</Label>
                  <Input value={form.featuredImage} onChange={e => setForm({ ...form, featuredImage: e.target.value })} placeholder="https://..." />
                  {form.featuredImage && <img src={form.featuredImage} alt="" className="mt-2 h-20 w-auto rounded object-cover" />}
                </div>
                <div>
                  <Label>Category</Label>
                  <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm">
                    <option value="">Uncategorized</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="rishikesh, rafting, adventure" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Author</Label>
                  <Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={form.published} onCheckedChange={v => setForm({ ...form, published: v })} />
                  <Label className="mb-0">Published</Label>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <Button onClick={handleSave} disabled={saving} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                  {saving ? 'Saving...' : (editingPost ? 'Update Post' : 'Create Post')}
                </Button>
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </motion.div>
          ) : (
            <div className="mb-4">
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search posts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-brand-orange" />
              </div>
            </div>
          )}

          {!showForm && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {postsLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading posts...</div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No posts found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-brand-cream/50 border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Author</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPosts.map(post => (
                        <tr key={post.id} className="border-b border-border hover:bg-brand-cream/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {post.featuredImage && (
                                <img src={toDirectImageUrl(post.featuredImage)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 hidden sm:block" />
                              )}
                              <div>
                                <p className="font-medium text-brand-dark truncate max-w-[200px] sm:max-w-[300px]">{post.title}</p>
                                <p className="text-[11px] text-gray-400">/{post.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 hidden md:table-cell">
                            <span className="text-xs bg-brand-cream text-brand-dark px-2 py-1 rounded">{post.category?.name || 'Uncategorized'}</span>
                          </td>
                          <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{post.author}</td>
                          <td className="py-3 px-4">
                            <button onClick={() => togglePublished(post)} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full transition-colors ${post.published ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${post.published ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                              {post.published ? 'Published' : 'Draft'}
                            </button>
                          </td>
                          <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => openEdit(post)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-500" /></button>
                              <button onClick={() => handleDelete(post.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {subTab === 'categories' && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No categories yet. Create one to organize your posts.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-brand-cream/50 border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Slug</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden sm:table-cell">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Posts</th>
                    <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(cat => (
                    <tr key={cat.id} className="border-b border-border hover:bg-brand-cream/30 transition-colors">
                      <td className="py-3 px-4 font-medium text-brand-dark">{cat.name}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">/{cat.slug}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs hidden sm:table-cell max-w-[200px] truncate">{cat.description || '-'}</td>
                      <td className="py-3 px-4"><span className="text-xs bg-brand-cream text-brand-dark px-2 py-1 rounded">{cat._count.blogs}</span></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openCatForm(cat)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="w-4 h-4 text-gray-500" /></button>
                          <button onClick={() => handleCatDelete(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <AnimatePresence>
            {showCatModal && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCatModal(false)}>
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg text-brand-dark">{editCat ? 'Edit Category' : 'New Category'}</h3>
                    <button onClick={() => setShowCatModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Name *</Label>
                      <Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value, slug: editCat ? catForm.slug : generateSlug(e.target.value) })} placeholder="Travel Tips" />
                    </div>
                    <div>
                      <Label>Slug *</Label>
                      <Input value={catForm.slug} onChange={e => setCatForm({ ...catForm, slug: e.target.value })} placeholder="travel-tips" />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="Category description" rows={2} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleCatSave} disabled={catSaving} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                        {catSaving ? 'Saving...' : (editCat ? 'Update' : 'Create')}
                      </Button>
                      <Button variant="outline" onClick={() => setShowCatModal(false)}>Cancel</Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
