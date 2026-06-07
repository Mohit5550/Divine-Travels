'use client'

import { motion } from 'framer-motion'
import { Phone, Instagram, Youtube, Facebook, Linkedin } from 'lucide-react'

interface SocialLink {
  platform: 'instagram' | 'youtube' | 'facebook' | 'linkedin'
  href: string
}

const adventureCards = [
  {
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
    label: 'Paragliding',
    rotate: -10,
    zIndex: 1,
  },
  {
    image: 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=600&q=80',
    label: 'Rafting',
    rotate: -5,
    zIndex: 2,
  },
  {
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
    label: 'Trekking',
    rotate: 0,
    zIndex: 3,
  },
  {
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=600&q=80',
    label: 'Zipline',
    rotate: 5,
    zIndex: 2,
  },
  {
    image: 'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=600&q=80',
    label: 'Adventure',
    rotate: 10,
    zIndex: 1,
  },
]

// TODO: Replace these placeholder social links with your real URLs
const socialLinks: SocialLink[] = [
  { platform: 'instagram', href: 'https://instagram.com/' },
  { platform: 'youtube', href: 'https://youtube.com/' },
  { platform: 'facebook', href: 'https://facebook.com/' },
  { platform: 'linkedin', href: 'https://linkedin.com/' },
]

const platformColors: Record<SocialLink['platform'], string> = {
  instagram: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
  youtube: 'bg-red-600',
  facebook: 'bg-blue-600',
  linkedin: 'bg-sky-700',
}

const PlatformIcon = ({ platform }: { platform: SocialLink['platform'] }) => {
  const iconProps = { className: 'w-5 h-5 text-white', strokeWidth: 2 }
  switch (platform) {
    case 'instagram': return <Instagram {...iconProps} />
    case 'youtube': return <Youtube {...iconProps} />
    case 'facebook': return <Facebook {...iconProps} />
    case 'linkedin': return <Linkedin {...iconProps} />
  }
}

export function SocialCTASection() {
  return (
    <section className="py-14 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark">
            Find Your Next <span className="font-bold">Great Adventure</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Experience India&apos;s most exciting outdoor adventures.
          </p>
        </motion.div>

        <div className="relative flex items-end justify-center gap-2 sm:gap-3 mb-10 sm:mb-12 min-h-[260px] sm:min-h-[320px]">
          {adventureCards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 60, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: card.rotate }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6, ease: 'easeOut' }}
              className="relative w-32 sm:w-44 md:w-52 h-44 sm:h-56 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 sm:border-4 border-white"
              style={{ zIndex: card.zIndex }}
            >
              <img
                src={card.image}
                alt={card.label}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-red-400/40 via-orange-400/30 to-red-500/60" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 max-w-3xl mx-auto bg-white rounded-2xl shadow-md border border-gray-100 px-6 sm:px-10 py-5 sm:py-6"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <a
              href="https://wa.me/916396919007"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors shadow-md shrink-0"
              aria-label="WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-5 h-5 sm:w-6 sm:h-6"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </a>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Don&apos;t wait any longer, Contact us!</p>
              <a
                href="tel:+916396919007"
                className="text-base sm:text-xl md:text-2xl font-bold text-brand-dark hover:text-brand-orange transition-colors"
              >
                +91 63969 19007
              </a>
            </div>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-200" />

          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">
              Be part of our Social Media Journey!
            </p>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${platformColors[link.platform]} hover:scale-110 transition-transform flex items-center justify-center shadow-md`}
                >
                  <PlatformIcon platform={link.platform} />
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
