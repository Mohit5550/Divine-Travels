'use client'

import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { CheckCircle, ArrowRight, Calendar, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BookingSuccess() {
  const { navigate, user, selectedDestinationId } = useAppStore()

  return (
    <div className="min-h-screen bg-brand-cream pt-20 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-600" />
        </motion.div>

        <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-2">Booking Confirmed!</h2>
        <p className="text-muted-foreground mb-6">
          Your trip has been booked successfully. You&apos;ll receive a confirmation email shortly.
        </p>

        <div className="bg-brand-cream rounded-lg p-4 mb-6 text-left space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-brand-orange" />
            <span className="text-muted-foreground">Booking Reference:</span>
            <span className="font-mono font-medium text-brand-dark">
              DT{Date.now().toString().slice(-8)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-brand-orange" />
            <span className="text-muted-foreground">Traveler:</span>
            <span className="font-medium text-brand-dark">{user?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-brand-orange" />
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium text-amber-600">Pending Confirmation</span>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-700">
          Your booking is pending confirmation. Our team will confirm it within 24 hours.
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate('user-dashboard')}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            View My Bookings <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('landing')}
          >
            Continue Exploring
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
