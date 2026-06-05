'use client'

import { Hotel } from 'lucide-react'
import { StayPackageView } from './StayPackageView'

export function HotelPackages() {
  return (
    <StayPackageView
      category="stay-hotel"
      heroImage="https://drive.google.com/thumbnail?id=1WfJVW2z0lW0P4_m9cvpS31fQ4cHqlTo0&sz=w1600"
      heroTitle="Hotels & <span class='text-brand-orange'>Resorts</span>"
      heroSubtitle="Comfortable riverside stays with premium amenities and breathtaking views"
      badge="Stay Hotels"
      badgeIcon={<Hotel className="w-4 h-4 text-brand-orange" />}
      sectionTitle="Hotel & Resort Packages"
      sectionSubtitle="Choose from our handpicked hotels and resorts for a comfortable and memorable stay"
      bookDescription="Experience the best hospitality with Divine Travels! We offer carefully selected hotels and resorts in Rishikesh with stunning river views, modern amenities, and exceptional service. Whether you're looking for a budget-friendly room or a luxury resort, we have the perfect accommodation for you."
      stats={[
        { label: 'Properties', value: '5+' },
        { label: 'Locations', value: 'Rishikesh' },
        { label: 'Rating', value: '4.5' },
      ]}
      inclusions={[
        'Complimentary breakfast included',
        'Free WiFi in all rooms',
        'Air conditioning or heating available',
        '24/7 front desk and room service',
        'Free parking for guests',
        'River view rooms available',
        'Laundry and housekeeping services',
      ]}
      inclusionsTitle="What's Included in Your Hotel Stay?"
      faqs={[
        { question: 'What is the check-in and check-out time?', answer: 'Standard check-in time is 12:00 PM and check-out is 11:00 AM. Early check-in and late check-out are subject to availability and may incur additional charges.' },
        { question: 'Is breakfast included in the room price?', answer: 'Yes, complimentary breakfast is included in all our hotel packages. We offer both Indian and Continental breakfast options.' },
        { question: 'Can I cancel or modify my booking?', answer: 'Yes, free cancellation is available up to 24 hours before check-in. Cancellations made after that may incur a fee. Please check the specific cancellation policy of your booked property.' },
        { question: 'Do you provide airport or railway station pickup?', answer: 'Yes, we offer paid pickup and drop services from Dehradun Airport, Haridwar Railway Station, and Rishikesh Bus Stand. This can be arranged at the time of booking.' },
        { question: 'Are there any extra charges for additional guests?', answer: 'Extra guest charges may apply depending on the room type and property policy. Please mention the exact number of guests at the time of booking to avoid any inconvenience.' },
      ]}
    />
  )
}
