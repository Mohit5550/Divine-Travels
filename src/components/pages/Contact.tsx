'use client'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Phone, Mail, MapPin, Clock, Send, ArrowLeft, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function Contact() {
  const { navigate } = useAppStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) { toast.error('Please fill required fields'); return }
    setSending(true)
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message, source: 'contact-page' }),
      })
      if (!res.ok) { toast.error('Failed to send. Try again.'); return }
      toast.success('Message sent! We will get back to you soon.')
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('')
    } catch { toast.error('Failed to send message') }
    finally { setSending(false) }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <button onClick={() => navigate('landing')} className="flex items-center gap-2 text-muted-foreground hover:text-brand-orange mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl text-brand-dark mb-4">Get in Touch</h1>
          <div className="w-20 h-1 bg-brand-orange mx-auto mb-6" />
          <p className="text-lg text-muted-foreground">Have a question, need help planning, or ready to book? We are here 24/7.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <h2 className="font-serif text-2xl text-brand-dark mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Tell us about your travel plans..." required />
                </div>
                <Button type="submit" disabled={sending} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                  <Send className="w-4 h-4 mr-2" /> {sending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-brand-dark mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-orange mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-brand-dark">Phone / WhatsApp</p>
                    <a href="tel:+916396919007" className="text-sm text-muted-foreground hover:text-brand-orange">+91 63969 19007</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-orange mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-brand-dark">Email</p>
                    <a href="mailto:info@divinetravels.in" className="text-sm text-muted-foreground hover:text-brand-orange">info@divinetravels.in</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-orange mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-brand-dark">Address</p>
                    <p className="text-sm text-muted-foreground">Near Swami Narayan Ashram, Muni Ki Reti, Rishikesh - 249137</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-brand-orange mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-brand-dark">Working Hours</p>
                    <p className="text-sm text-muted-foreground">Mon - Sat: 7:00 AM - 9:00 PM</p>
                    <p className="text-sm text-muted-foreground">Sunday: 8:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <a href="https://wa.me/916396919007" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl p-4 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
