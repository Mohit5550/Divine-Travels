'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Handshake } from 'lucide-react'

interface Partner {
  id: string
  name: string
  image: string
}

const partners: Partner[] = [
  {
    id: 'travel-high',
    name: 'Travel High',
    image: 'https://lh3.googleusercontent.com/d/13rSbPEg6cqtAHAoWEOBQNzyuv1xpKZp8',
  },
  {
    id: 'gmvn',
    name: 'GMVN - Garhwal Mandal Vikas Nigam',
    image: 'https://lh3.googleusercontent.com/d/1QcfsK3rtNDx0At7XOfVDvvTrNYqGRMAO',
  },
  {
    id: 'uttarakhand-tourism',
    name: 'Uttarakhand Tourism',
    image: 'https://lh3.googleusercontent.com/d/1wipcxI9LQBfH30gE84C8WJFGpXs8BPsn',
  },
  {
    id: 'thrill-factory',
    name: 'The Shivpuri Thrill Factory',
    image: 'https://lh3.googleusercontent.com/d/1UXEFDAk9tEvqi0cpHRfY8WXxUDWgMqrR',
  },
  {
    id: 'maulik-mansion',
    name: 'Maulik Mansion',
    image: 'https://lh3.googleusercontent.com/d/17lw8UqDCAREliVowzw7fw7a96QvXxRUx',
  },
  {
    id: 'trekking-compass',
    name: 'Trekking Compass',
    image: '/partners/partner-new.png',
  },
]

const fallbackImage = (name: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect width="100%" height="100%" fill="#ffffff"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#E8740C" text-anchor="middle" dominant-baseline="middle">${name}</text></svg>`,
  )}`

export function PartnersSection() {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const handleImgError = (id: string) => setImgErrors((prev) => ({ ...prev, [id]: true }))

  const handleImgErrorOnce = (id: string) => () => handleImgError(id)

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/20 rounded-full px-4 py-1.5 mb-3">
            <Handshake className="w-4 h-4 text-brand-orange" />
            <span className="text-brand-orange text-xs font-bold tracking-wider uppercase">
              Trusted Network
            </span>
          </div>
          <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl text-brand-dark tracking-tight">
            Our Official{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #E8740C 0%, #0D9488 100%)' }}
            >
              Tourism & Adventure Partners
            </span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            Partnered with leading government tourism boards, certified operators, and luxury resorts across Uttarakhand.
          </p>
        </motion.div>
      </div>

      <div className="relative overflow-hidden partners-marquee-wrapper">
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        <div className="partners-marquee py-2">
          <div className="partners-marquee-track">
            {[...partners, ...partners].map((partner, idx) => (
              <div
                key={`${partner.id}-${idx}`}
                className="shrink-0 w-44 sm:w-56 md:w-60 h-24 sm:h-28 md:h-32 bg-white border border-gray-100 rounded-2xl flex items-center justify-center p-4 sm:p-5 mx-2.5 sm:mx-3.5 shadow-2xs hover:shadow-md hover:border-brand-orange/30 transition-all duration-300"
              >
                <img
                  src={imgErrors[partner.id] ? fallbackImage(partner.name) : partner.image}
                  alt={partner.name}
                  title={partner.name}
                  onError={handleImgErrorOnce(partner.id)}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain pointer-events-none transition-transform duration-300 hover:scale-105"
                  draggable={false}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .partners-marquee {
            width: 100%;
            overflow: hidden;
            -webkit-mask-image: linear-gradient(to right, transparent 0, black 5%, black 95%, transparent 100%);
            mask-image: linear-gradient(to right, transparent 0, black 5%, black 95%, transparent 100%);
          }
          .partners-marquee-track {
            display: flex;
            width: max-content;
            animation: partners-scroll 30s linear infinite;
            will-change: transform;
          }
          .partners-marquee:hover .partners-marquee-track {
            animation-play-state: paused;
          }
          @keyframes partners-scroll {
            0%   { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-50%, 0, 0); }
          }
        `}</style>
      </div>
    </section>
  )
}
