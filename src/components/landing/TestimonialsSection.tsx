'use client'

import { useRef, useEffect, useState } from 'react'
import { Star, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const GoogleLogo = () => (
  <svg viewBox="0 0 48 48" className="w-5 h-5">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
  </svg>
)

interface Review {
  name: string
  date: string
  rating: number
  text: string
  packageName?: string
}

const SLIDE_DURATION = 5000

export function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetch('/api/reviews/recent')
      .then((r) => r.json())
      .then((data) => { setReviews(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const totalSlides = reviews.length > 0 ? Math.ceil(reviews.length / 3) : 1

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scrollToSlide = (index: number) => {
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.children[0]?.clientWidth || 0
      scrollRef.current.scrollTo({ left: index * (slideWidth + 16), behavior: 'smooth' })
      setActiveSlide(index)
    }
  }

  const handleScroll = () => {
    updateScrollButtons()
    if (scrollRef.current) {
      const slideWidth = scrollRef.current.children[0]?.clientWidth || 1
      const newIndex = Math.round(scrollRef.current.scrollLeft / (slideWidth + 16))
      setActiveSlide(Math.max(0, Math.min(newIndex, totalSlides - 1)))
    }
  }

  useEffect(() => {
    if (!isPaused && reviews.length > 0) {
      intervalRef.current = setInterval(() => {
        const next = (activeSlide + 1) % totalSlides
        scrollToSlide(next)
      }, SLIDE_DURATION)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [activeSlide, isPaused, reviews.length, totalSlides])

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`} />
      ))}
    </div>
  )

  const chunked: Review[][] = []
  if (reviews.length > 0) {
    for (let i = 0; i < reviews.length; i += 3) {
      chunked.push(reviews.slice(i, i + 3))
    }
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  return (
    <section className="py-16 sm:py-20 bg-brand-cream overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-brand-orange text-sm font-semibold tracking-widest uppercase">Testimonials</span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-dark mt-2 mb-3">What Our Travelers Say</h2>
          <div className="w-16 h-1 bg-brand-orange mx-auto" />
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to share your experience!</p>
        ) : (
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar scroll-smooth snap-x snap-mandatory"
          >
            {chunked.map((slide, slideIdx) => (
              <div key={slideIdx} className="shrink-0 w-full snap-start grid grid-cols-1 md:grid-cols-3 gap-4">
                {slide.map((review, idx) => (
                  <motion.div
                    key={`${review.name}-${slideIdx}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-sm font-bold text-brand-orange">
                          {getInitials(review.name)}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-brand-dark">{review.name}</p>
                          <p className="text-[11px] text-muted-foreground">{timeAgo(review.date)}</p>
                        </div>
                      </div>
                      <GoogleLogo />
                    </div>

                    {renderStars(review.rating)}

                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      &ldquo;{review.text}&rdquo;
                    </p>

                    <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                      <GoogleLogo />
                      <span className="text-[10px] text-muted-foreground">Google Review</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => scrollToSlide(Math.max(0, activeSlide - 1))}
              className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all disabled:opacity-30"
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {chunked.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToSlide(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeSlide ? 'bg-brand-orange w-6 h-2.5' : 'bg-gray-300 w-2.5 h-2.5 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => scrollToSlide(Math.min(totalSlides - 1, activeSlide + 1))}
              className="w-9 h-9 rounded-full bg-white shadow-sm border border-gray-200 flex items-center justify-center hover:bg-brand-orange hover:text-white hover:border-brand-orange transition-all disabled:opacity-30"
              disabled={!canScrollRight}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex justify-center mt-6">
          <a
            href="https://maps.app.goo.gl/bo98aH7VHrJWuAUQ7"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-brand-orange text-brand-orange rounded-full hover:bg-brand-orange hover:text-white transition-all font-semibold text-sm shadow-sm"
          >
            <GoogleLogo />
            Write a Google Review
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Based on reviews from Google and other platforms
        </p>
      </div>
    </section>
  )
}
