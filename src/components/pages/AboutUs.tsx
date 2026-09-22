'use client'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Compass, Shield, Heart, Users, Mountain, Leaf, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AboutUs() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-muted-foreground hover:text-brand-orange mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center mx-auto mb-6">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-dark mb-4">About Divine Travels</h1>
          <div className="w-20 h-1 bg-brand-orange mx-auto mb-6" />
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your trusted companion for exploring the sacred landscapes, spiritual heritage, and adventurous spirit of India.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl text-brand-dark">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
              Founded in the spiritual heart of Rishikesh, Divine Travels was born from a simple belief — that travel has the power to transform. What started as a small rafting guide service on the Ganges has grown into a full-service travel company offering everything from white-water adventures to sacred pilgrimages.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we serve thousands of travelers each year, curating experiences across eight service categories. Our team of 50+ passionate travel experts, guides, and support staff work tirelessly to ensure every journey is safe, seamless, and unforgettable.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img loading="lazy" decoding="async" src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&h=600&fit=crop" alt="Himalayan landscape" className="w-full h-80 object-cover" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Mountain, title: 'Adventure', desc: 'From white-water rafting to bungee jumping, we bring you face-to-face with the thrill of the Himalayas.' },
            { icon: Heart, title: 'Spirituality', desc: 'Sacred pilgrimages to Char Dham, Jyotirlingas, and ancient temples, guided with reverence and care.' },
            { icon: Leaf, title: 'Nature', desc: 'Explore pristine valleys, alpine meadows, and the untouched beauty of India\'s natural wonders.' },
            { icon: Users, title: 'Community', desc: 'We believe in responsible tourism that empowers local communities and preserves cultural heritage.' },
            { icon: Shield, title: 'Safety First', desc: 'Every activity follows international safety standards. Your well-being is our top priority.' },
            { icon: Compass, title: 'Expert Guides', desc: 'Our certified guides bring years of experience, local knowledge, and genuine hospitality.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-brand-orange/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-brand-orange" />
              </div>
              <h3 className="font-semibold text-brand-dark mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-brand-dark rounded-2xl p-8 sm:p-12 text-center text-white">
          <h2 className="font-serif text-3xl mb-4">Ready for Your Next Adventure?</h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">Whether you seek spiritual peace or adrenaline thrills, we are here to craft your perfect journey.</p>
          <Button onClick={() => navigate('landing')} className="bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-6 text-lg">
            Explore Our Services
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
