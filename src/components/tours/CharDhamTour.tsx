'use client'

import { useState, useEffect } from 'react'
import { SingleSelectTour } from './SingleSelectTour'

const defaultTourData = [
  {
    title: 'Do Dham (Kedarnath + Badrinath)',
    description: 'Experience two of the most sacred Char Dham shrines nestled high in the Garhwal Himalayas.',
    highlights: [
      { icon: '🚁', label: '3 Night / 4 Days' },
      { icon: '📍', label: 'Dehradun to Dehradun' },
      { icon: '⛰️', label: 'Helicopter + Road' },
      { icon: '⭐', label: 'Premium Hotels & Camps' },
      { icon: '🍽️', label: 'Daily Breakfast & Dinner' },
      { icon: '👥', label: 'Group Size: 12-15' }
    ],
    img: 'https://cdn.s3waas.gov.in/s33416a75f4cea9109507cacd8e2f2aefc/uploads/bfi_thumb/2018032771-olzs8a06n0m3qfz8i53k7y3e45k6w4a1s0d55n3a09.jpg',
    itinerary: [
      'Day 1: Dehradun to Guptkashi (Drive 7-8 hrs). Overnight stay.',
      'Day 2: Guptkashi to Kedarnath (Helicopter). Darshan & return. Overnight stay.',
      'Day 3: Guptkashi to Badrinath (Drive 8-9 hrs). Evening Aarti. Overnight stay.',
      'Day 4: Badrinath to Dehradun (Drive 8-9 hrs). Trip ends.'
    ],
    price: '₹50,000',
    actualPrice: 49999,
    discountedPrice: 44999,
  },
  {
    title: 'Do Dham with Valley of Flowers',
    description: 'Combine the sacred journey with the mesmerizing, UNESCO-recognized Valley of Flowers.',
    highlights: [
      { icon: '🌸', label: '5 Night / 6 Days' },
      { icon: '📍', label: 'Dehradun to Dehradun' },
      { icon: '🚗', label: 'Innova/Similar' },
      { icon: '⛰️', label: 'Char Dham Temples' },
      { icon: '🏞️', label: 'Valley of Flowers Trek' },
      { icon: '⭐', label: 'Premium Hotels & Camps' },
      { icon: '🍽️', label: 'Daily Breakfast & Dinner' },
      { icon: '👥', label: 'Group Size: 12-15' }
    ],
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
    itinerary: [
      'Day 1: Dehradun to Joshimath (Drive 10-11 hrs). Overnight stay.',
      'Day 2: Joshimath to Badrinath. Darshan & return. Overnight stay.',
      'Day 3: Drive to Govind Ghat. Trek to Ghangaria. Overnight stay.',
      'Day 4: Valley of Flowers Trek. Return to Ghangaria. Overnight stay.',
      'Day 5: Ghangaria to Joshimath. Overnight stay.',
      'Day 6: Joshimath to Dehradun. Trip ends.'
    ],
    price: '₹35,000',
    actualPrice: 34999,
    discountedPrice: 29999,
  },
  {
    title: 'Yamunotri & Gangotri (Char Dham)',
    description: 'A deeply spiritual expedition to the origins of the Yamuna and the ancient Gangotri glacier system.',
    highlights: [
      { icon: '🛕', label: '3 Night / 4 Days' },
      { icon: '📍', label: 'Dehradun to Dehradun' },
      { icon: '🚗', label: 'Innova/Similar' },
      { icon: '🏔️', label: 'Yamunotri & Gangotri' },
      { icon: '⭐', label: 'Hotels & Guest Houses' },
      { icon: '🍽️', label: 'Daily Breakfast & Dinner' },
      { icon: '👥', label: 'Group Size: 12-15' }
    ],
    img: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=1200&q=80',
    itinerary: [
      'Day 1: Dehradun to Barkot (Drive 6-7 hrs). Overnight stay.',
      'Day 2: Barkot to Yamunotri (Drive 5 hrs + Trek 6 km). Return. Overnight stay.',
      'Day 3: Barkot to Uttarkashi (Drive 5-6 hrs). Visit Ganga Temple. Overnight stay.',
      'Day 4: Uttarkashi to Dehradun (Drive 6-7 hrs). Trip ends.'
    ],
    price: '₹32,000',
    actualPrice: 31999,
    discountedPrice: 26999,
  },
  {
    title: 'Chardham Complete (By Helicopter)',
    description: 'The ultimate pilgrimage covering all four shrines with the speed and comfort of a private helicopter.',
    highlights: [
      { icon: '🚁', label: '9 Night / 10 Days' },
      { icon: '📍', label: 'Dehradun to Dehradun' },
      { icon: '⭐', label: 'Helicopter + 5-Star' },
      { icon: '🍽️', label: 'All Meals Included' },
      { icon: '👥', label: 'Private Group Only' },
      { icon: '🛕', label: 'Full Darshan Assistance' }
    ],
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
    itinerary: [
      'Day 1: Dehradun to Yamunotri. Darshan. Overnight stay.',
      'Day 2: Yamunotri to Gangotri. Darshan. Overnight stay.',
      'Day 3: Gangotri to Guptkashi. Overnight stay.',
      'Day 4: Guptkashi to Kedarnath. Darshan. Overnight stay.',
      'Day 5: Kedarnath to Badrinath. Darshan. Overnight stay.',
      'Day 6-8: Rest and local sightseeing.',
      'Day 9: Return to Dehradun.',
      'Day 10: Trip ends.'
    ],
    price: '₹2,50,000',
    actualPrice: 249999,
    discountedPrice: 229999,
  },
  {
    title: 'Complete Chardham (By Road)',
    description: 'A comprehensive road journey covering all four sacred shrines over a comfortable, guided 10-day itinerary.',
    highlights: [
      { icon: '🛕', label: '9 Night / 10 Days' },
      { icon: '📍', label: 'Haridwar to Haridwar' },
      { icon: '🚗', label: 'Innova/Similar' },
      { icon: '🏔️', label: 'All Four Dhams' },
      { icon: '⭐', label: 'Hotels & Guest Houses' },
      { icon: '🍽️', label: 'Daily Breakfast & Dinner' },
      { icon: '👥', label: 'Group Size: 12-15' }
    ],
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
    itinerary: [
      'Day 1: Haridwar to Barkot. Overnight stay.',
      'Day 2: Barkot to Yamunotri. Return. Overnight stay.',
      'Day 3: Barkot to Uttarkashi. Overnight stay.',
      'Day 4: Uttarkashi to Gangotri. Return. Overnight stay.',
      'Day 5: Uttarkashi to Guptkashi. Overnight stay.',
      'Day 6: Guptkashi to Kedarnath. Return. Overnight stay.',
      'Day 7: Guptkashi to Badrinath. Overnight stay.',
      'Day 8: Badrinath local sightseeing. Overnight stay.',
      'Day 9: Badrinath to Rudraprayag. Overnight stay.',
      'Day 10: Rudraprayag to Haridwar. Trip ends.'
    ],
    price: '₹42,000',
    actualPrice: 41999,
    discountedPrice: 36999,
  }
]

const defaultInclusions = [
  '4-Star Hotels / Premium Camps',
  'Daily Breakfast & Dinner',
  'Helicopter/Ground Transport',
  'Yamunotri Pony/Doli',
  'Kedarnath Trek Assistance',
  'All Temple Darshan Assistance',
  'Experienced Trek Guide',
  'All Local Sightseeing',
  'Welcome Drink on Arrival',
  'First Aid & Oxygen Cylinder',
  'Taxes & Permit Fees'
]

const defaultExclusions = [
  'Flight Tickets to Dehradun',
  'Personal Expenses (Tips, Laundry)',
  'Any Optional Activities',
  'Additional Meals Not Mentioned',
  'Emergency Evacuation',
  'Insurance Coverage',
  'Camera Fees at Temples',
  'Any Other Item Not Mentioned'
]

const faqs = [
  { q: 'How fit do I need to be?', a: 'Moderate fitness is needed. We provide palki/pony for Yamunotri and Kedarnath.' },
  { q: 'What about food and water?', a: 'Breakfast and dinner are provided daily. Packaged water is provided throughout the journey.' },
  { q: 'Do we need permits?', a: 'No special permits are required for Indian nationals. We handle all regional entry permits.' }
]

export function CharDhamTour() {
  const [tourData, setTourData] = useState(defaultTourData)
  const [inclusions, setInclusions] = useState(defaultInclusions)
  const [exclusions, setExclusions] = useState(defaultExclusions)

  const mapProgramsToTourData = (programs: any[]) =>
    programs.map((p) => {
      const days = p.itinerary?.length || 1
      return {
        title: p.title,
        description: p.description || `Explore ${p.title} with Divine Travels.`,
        highlights: p.highlights?.length ? p.highlights : [
          { icon: days > 1 ? '🏔️' : '🚗', label: days > 1 ? `${days - 1} Night / ${days} Days` : '1 Day Trip' },
          { icon: '📍', label: 'Haridwar/Rishikesh to Haridwar/Rishikesh' },
          { icon: '🚗', label: 'Private Vehicle' },
          { icon: '🍽️', label: 'Meals Included' },
        ],
        img: p.img,
        itinerary: p.itinerary || [],
        price: p.price || 'Contact for price',
        actualPrice: p.actualPrice || 0,
        discountedPrice: p.discountedPrice || 0,
      }
    })

  useEffect(() => {
    fetch('/api/tour-destinations?slug=char-dham')
      .then(r => r.json())
      .then(data => {
        if (data && data.config) {
          if (data.programs?.length) {
            setTourData(mapProgramsToTourData(data.programs))
          }
          const cfg = data.config
          if (cfg.inclusions?.length) setInclusions(cfg.inclusions)
          if (cfg.exclusions?.length) setExclusions(cfg.exclusions)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <SingleSelectTour
      heroImage="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80"
      heroTitle="Chardham Yatra Package"
      heroSubtitle="Char Dham Yatra - A Journey of Faith Across Four Sacred Himalayan Shrines"
      heroTag="Char Dham"
      sectionTitle="Char Dham Pilgrimage"
      tourData={tourData}
      inclusions={inclusions}
      exclusions={exclusions}
      faqs={faqs}
      bookingTitle="Char Dham Yatra"
    />
  )
}
