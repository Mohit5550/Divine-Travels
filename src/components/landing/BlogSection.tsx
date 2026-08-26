'use client'

import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Calendar, ArrowRight, BookOpen, Sparkles } from 'lucide-react'
import { toDirectImageUrl } from '@/lib/utils'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  featuredImage: string | null
  publishedAt: string
  author: string
  category: { id: string; name: string } | null
}

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
}

export function BlogSection() {
  const { navigate } = useAppStore()

  const { data } = useQuery({
    queryKey: ['landing-blogs'],
    queryFn: async () => {
      const res = await fetch('/api/blogs?limit=4')
      if (!res.ok) return { blogs: [] }
      return res.json()
    },
    refetchInterval: 60000,
  })

  const blogs: BlogPost[] = data?.blogs || []

  if (blogs.length === 0) return null

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-brand-cream/50 to-white" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 right-1/4 w-72 h-72 bg-brand-orange/15 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div {...fadeIn} className="text-center mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 text-brand-orange text-sm font-semibold tracking-widest uppercase bg-brand-orange/5 px-5 py-1.5 rounded-full border border-brand-orange/10 mb-4">
            <BookOpen className="w-3.5 h-3.5" /> Travel Stories
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl text-brand-dark mt-2">
            From Our <span className="text-brand-orange">Blog</span>
          </h2>
          <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
            Tips, guides, and stories from the mountains to inspire your next adventure
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {blogs.map((post, index) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate('blog-single', null, post.slug)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
            >
               <div className="h-32 sm:h-40 overflow-hidden">
                {post.featuredImage ? (
                  <img
                    src={toDirectImageUrl(post.featuredImage)}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 to-brand-teal/20 flex items-center justify-center">
                    <span className="text-3xl font-serif text-brand-orange/30">{post.title.charAt(0)}</span>
                  </div>
                )}
              </div>
               <div className="p-3 sm:p-4">
                <div className="flex items-center gap-2 mb-2">
                  {post.category && (
                    <span className="text-[10px] font-semibold bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {post.category.name}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(post.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <h3 className="font-serif text-sm font-bold text-brand-dark group-hover:text-brand-orange transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-1 text-brand-orange text-xs font-semibold mt-3 group-hover:gap-2 transition-all">
                  Read more <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div {...fadeIn} className="text-center mt-10">
          <button
            onClick={() => navigate('blog-archive')}
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-orange/90 transition-colors"
          >
            View All Posts <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
