'use client'

import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Clock, Tag, Share2 } from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { toDirectImageUrl } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featuredImage: string | null
  tags: string
  author: string
  published: boolean
  publishedAt: string
  createdAt: string
  category: { id: string; name: string; slug: string } | null
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  _count: { blogs: number }
}

export function BlogSingle() {
  const { navigate, goBack, selectedPackageId: slug } = useAppStore()

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      if (!slug) return null
      const res = await fetch(`/api/blogs/${slug}`)
      if (!res.ok) return null
      return res.json() as Promise<BlogPost>
    },
    enabled: !!slug,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const res = await fetch('/api/blogs/categories')
      if (!res.ok) return []
      return res.json() as Promise<BlogCategory[]>
    },
  })

  const { data: recentPosts = [] } = useQuery({
    queryKey: ['blog-recent'],
    queryFn: async () => {
      const res = await fetch('/api/blogs?limit=5')
      if (!res.ok) return []
      const data = await res.json()
      return (data.blogs || []).filter((b: BlogPost) => b.slug !== slug).slice(0, 4)
    },
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
        <div className="pt-24 sm:pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-64 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
        <div className="pt-24 sm:pt-28 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
            <h2 className="font-serif text-2xl text-brand-dark mb-3">Article not found</h2>
            <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist or has been removed.</p>
            <button onClick={() => goBack('blog-archive')} className="text-brand-orange hover:underline">← Back to Blog</button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const tags: string[] = (() => {
    try { return JSON.parse(post.tags) } catch { return [] }
  })()

  const readingTime = Math.max(1, Math.ceil(post.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200))

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Hero */}
      <div className="relative h-56 sm:h-72 md:h-96 overflow-hidden">
        {post.featuredImage ? (
          <img src={toDirectImageUrl(post.featuredImage)} alt={post.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-orange to-brand-teal" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 lg:p-10">
              <button onClick={() => goBack('blog-archive')} className="flex items-center gap-1 text-sm text-brand-orange hover:underline mb-6">
                <ArrowLeft className="w-4 h-4" /> Back to Blog
              </button>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {post.category && (
                  <span className="text-xs font-medium bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full">{post.category.name}</span>
                )}
                <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{readingTime} min read</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl text-brand-dark mb-4">{post.title}</h1>

              <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
                <User className="w-4 h-4" /> {post.author}
              </div>

              <div className="prose prose-lg max-w-none prose-headings:text-brand-dark prose-a:text-brand-orange prose-img:rounded-xl" dangerouslySetInnerHTML={{ __html: post.content }} />

              {/* Tags */}
              {tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {tags.map((tag, index) => (
                      <span key={`${tag}-${index}`} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Share2 className="w-4 h-4" /> Share this article
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { if (typeof window !== 'undefined') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank') }} className="px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-200">Facebook</button>
                  <button onClick={() => { if (typeof window !== 'undefined') window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank') }} className="px-3 py-1.5 bg-sky-100 text-sky-600 rounded-lg text-xs font-medium hover:bg-sky-200">Twitter</button>
                  <button onClick={() => { if (typeof window !== 'undefined') window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`, '_blank') }} className="px-3 py-1.5 bg-green-100 text-green-600 rounded-lg text-xs font-medium hover:bg-green-200">WhatsApp</button>
                </div>
              </div>
            </div>
          </motion.article>

          {/* Sidebar */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-28 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => navigate('blog-archive', null, cat.id)} className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-brand-orange transition-colors py-1">
                      <span>{cat.name}</span>
                      <span className="text-xs bg-brand-cream px-2 py-0.5 rounded">{cat._count.blogs}</span>
                    </button>
                  ))}
                  {categories.length === 0 && <p className="text-sm text-gray-400">No categories</p>}
                </div>
              </div>

              {/* Recent Posts */}
              {recentPosts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="font-serif text-lg font-bold text-brand-dark mb-4">Recent Posts</h3>
                  <div className="space-y-4">
                    {recentPosts.map((rp: BlogPost) => (
                      <button key={rp.id} onClick={() => navigate('blog-single', null, rp.slug)} className="flex items-start gap-3 text-left group">
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
                          {rp.featuredImage ? (
                            <img src={toDirectImageUrl(rp.featuredImage)} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-brand-teal/20 flex items-center justify-center text-brand-orange/40 font-bold text-sm">{rp.title.charAt(0)}</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-brand-dark group-hover:text-brand-orange transition-colors line-clamp-2">{rp.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(rp.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  )
}
