'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Search } from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { toDirectImageUrl } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content?: string
  featuredImage: string | null
  tags: string
  publishedAt: string
  author: string
  category: { id: string; name: string; slug: string } | null
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  _count: { blogs: number }
}

export function BlogArchive() {
  const { navigate } = useAppStore()
  const [activeCategory, setActiveCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams()
  if (activeCategory) params.set('category', activeCategory)
  params.set('page', String(page))
  params.set('limit', '9')

  const { data, isLoading } = useQuery({
    queryKey: ['blogs', activeCategory, page],
    queryFn: async () => {
      const res = await fetch(`/api/blogs?${params.toString()}`)
      if (!res.ok) return { blogs: [], total: 0, totalPages: 0 }
      return res.json()
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const res = await fetch('/api/blogs/categories')
      if (!res.ok) return []
      return res.json() as Promise<BlogCategory[]>
    },
  })

  const blogs: BlogPost[] = data?.blogs || []
  const totalPages = data?.totalPages || 0

  const filtered = searchQuery
    ? blogs.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()))
    : blogs

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <button onClick={() => navigate('landing')} className="flex items-center gap-1 text-sm text-brand-orange hover:underline mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <h1 className="font-sans text-4xl sm:text-5xl font-light tracking-tight text-gray-700 mb-3">Our Blog</h1>
            <p className="text-muted-foreground max-w-2xl">Travel stories, guides, and tips from the heart of Uttarakhand. Discover the divine beauty of India with us.</p>
          </motion.div>

          {/* Search + Categories */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search articles..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-brand-orange" />
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { setActiveCategory(''); setPage(1) }} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!activeCategory ? 'bg-brand-orange text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-orange'}`}>All</button>
              {categories.map(cat => (
                <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setPage(1) }} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat.id ? 'bg-brand-orange text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-orange'}`}>{cat.name}</button>
              ))}
            </div>
          </div>

          {/* Blog Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No articles found</p>
              <p className="text-sm text-gray-400 mt-1">Try a different search or category</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate('blog-single', null, post.slug)}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                  >
                    <div className="h-48 overflow-hidden">
                      {post.featuredImage ? (
                        <img src={toDirectImageUrl(post.featuredImage)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-brand-teal/20 flex items-center justify-center">
                          <span className="text-4xl font-serif text-brand-orange/40">{post.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        {post.category && (
                          <span className="text-xs font-medium bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded-full">{post.category.name}</span>
                        )}
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <h3 className="font-sans text-[17px] font-normal tracking-wide text-gray-800 mb-2 group-hover:text-brand-orange transition-colors line-clamp-2 leading-snug">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '').slice(0, 150) : '')}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <User className="w-3 h-3" /> {post.author}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm disabled:opacity-50 hover:border-brand-orange">Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-sm font-medium ${p === page ? 'bg-brand-orange text-white' : 'bg-white border border-gray-200 hover:border-brand-orange'}`}>{p}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm disabled:opacity-50 hover:border-brand-orange">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
