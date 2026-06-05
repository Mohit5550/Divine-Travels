'use client'

import { Tent } from 'lucide-react'
import { StayPackageView } from './StayPackageView'

export function CampingPackages() {
  return (
    <StayPackageView
      category="stay-camping"
      heroImage="https://drive.google.com/thumbnail?id=1sWB7FLPZRrwHE_Nq6oeonm5DMzpW6s7X&sz=w1600"
      heroTitle="Riverside <span class='text-brand-orange'>Camping</span>"
      heroSubtitle="Bonfire, river views, starry nights — an unforgettable outdoor experience"
      badge="Camping"
      badgeIcon={<Tent className="w-4 h-4 text-brand-orange" />}
      sectionTitle="Camping Packages"
      sectionSubtitle="Choose from our riverside camping experiences for an unforgettable outdoor adventure"
      bookDescription="Experience the thrill of riverside camping with Divine Travels! Set up your tent by the Ganges, enjoy a bonfire under the stars, and wake up to the sound of flowing river water. We offer safe, clean, and comfortable camping experiences with all essential amenities included."
      stats={[
        { label: 'Sites', value: '4+' },
        { label: 'Capacity', value: '50+' },
        { label: 'Rating', value: '4.7' },
      ]}
      inclusions={[
        'Spacious tents with comfortable bedding',
        'Bonfire with music in the evening',
        'Complimentary dinner and breakfast',
        'Clean washroom and changing facilities',
        'River view seating area',
        '24/7 camp staff and security',
        'Free parking for guests',
      ]}
      inclusionsTitle="What's Included in Your Camping Experience?"
      faqs={[
        { question: 'Is camping safe for families with children?', answer: 'Yes, our campsites are completely safe for families with children. We have trained staff available 24/7, and the campsites are located in secure, well-maintained areas away from direct river currents.' },
        { question: 'What facilities are available at the campsite?', answer: 'Our campsites include clean washrooms, changing rooms, a bonfire pit, river view seating, and a dining area. We provide tents with mattresses, sleeping bags, pillows, and blankets.' },
        { question: 'What food is provided during camping?', answer: 'We provide complimentary dinner and breakfast. Dinner typically includes vegetarian BBQ, Indian bread, rice, dal, and sabzi. Breakfast includes tea, coffee, parathas, and fruits. Special dietary requirements can be accommodated with prior notice.' },
        { question: 'What should I bring for camping?', answer: 'We recommend bringing comfortable clothes, a light jacket (evenings can get cool), mosquito repellent, personal toiletries, and a water bottle. We provide all camping gear including tents, bedding, and utensils.' },
        { question: 'Can I cancel my camping booking?', answer: 'Yes, free cancellation is available up to 48 hours before the camping date. Cancellations made within 48 hours may incur a 50% charge. In case of bad weather, we offer rescheduling or a full refund.' },
      ]}
    />
  )
}
