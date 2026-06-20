'use client'

import { useState, useEffect } from 'react'
import { SingleSelectTour } from './SingleSelectTour'

const defaultTourData = [
  {
    title: 'Char Dham of Uttarakhand',
    description: 'A complete road journey to the most sacred shrines in the mighty Garhwal Himalayas.',
    highlights: [
      { icon: '⛰️', label: '11 Nights / 12 Days' },
      { icon: '📍', label: 'Haridwar to Haridwar' },
      { icon: '🚗', label: 'Innova/Similar' },
      { icon: '🏔️', label: 'All Four Dhams' },
      { icon: '⭐', label: 'Hotels & Guest Houses' },
      { icon: '🍽️', label: 'Daily Breakfast & Dinner' }
    ],
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
    itinerary: [
      'Day 1: Haridwar to Barkot. Overnight stay.',
      'Day 2: Yamunotri Darshan. Return to Barkot.',
      'Day 3: Barkot to Uttarkashi. Overnight stay.',
      'Day 4: Gangotri Darshan. Return to Uttarkashi.',
      'Day 5: Uttarkashi to Guptkashi. Overnight stay.',
      'Day 6: Kedarnath Darshan. Return to Guptkashi.',
      'Day 7: Guptkashi to Badrinath. Overnight stay.',
      'Day 8: Badrinath local sightseeing.',
      'Day 9: Badrinath to Rudraprayag. Overnight stay.',
      'Day 10: Rudraprayag to Haridwar.',
      'Day 11: Haridwar local sightseeing.',
      'Day 12: Trip ends.'
    ],
    price: '₹42,000',
    actualPrice: 41999,
    discountedPrice: 36999,
  },
  {
    title: 'Badrinath, Kedarnath & Auli',
    description: 'Combine the spiritual with the scenic, ending at the stunning Auli ski resort and Gurso Bugyal.',
    highlights: [
      { icon: '🏔️', label: '5 Night / 6 Days' },
      { icon: '📍', label: 'Dehradun to Dehradun' },
      { icon: '🚗', label: 'Innova/Similar' },
      { icon: '🛕', label: 'Char Dham Temples' },
      { icon: '⭐', label: 'Hotels & Guest Houses' },
      { icon: '🍽️', label: 'Daily Breakfast & Dinner' }
    ],
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
    itinerary: [
      'Day 1: Dehradun to Guptkashi. Overnight stay.',
      'Day 2: Kedarnath Darshan. Return to Guptkashi.',
      'Day 3: Guptkashi to Badrinath. Overnight stay.',
      'Day 4: Badrinath Darshan and local sightseeing.',
      'Day 5: Badrinath to Auli. Overnight stay.',
      'Day 6: Auli to Dehradun. Trip ends.'
    ],
    price: '₹35,000',
    actualPrice: 34999,
    discountedPrice: 29999,
  },
  {
    title: 'Badrinath, Kedarnath & Chopta Trek',
    description: 'Experience the thrill of the Chandrashila trek alongside the most revered temples.',
    highlights: [
      { icon: '🥾', label: '5 Night / 6 Days' },
      { icon: '📍', label: 'Dehradun to Dehradun' },
      { icon: '🚗', label: 'Innova/Similar' },
      { icon: '🏔️', label: 'Chopta & Chandrashila' },
      { icon: '⭐', label: 'Hotels & Camps' },
      { icon: '🍽️', label: 'Daily Breakfast & Dinner' }
    ],
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
    itinerary: [
      'Day 1: Dehradun to Guptkashi. Overnight stay.',
      'Day 2: Kedarnath Darshan. Return to Guptkashi.',
      'Day 3: Guptkashi to Chopta. Trek to Tungnath. Overnight stay.',
      'Day 4: Chandrashila Summit trek. Return to Chopta.',
      'Day 5: Chopta to Badrinath. Overnight stay.',
      'Day 6: Badrinath to Dehradun. Trip ends.'
    ],
    price: '₹32,000',
    actualPrice: 31999,
    discountedPrice: 26999,
  },
  {
    title: 'Do Dham with Auli & Chopta Trek',
    description: 'A balanced mix of pilgrimage and adventure, including the famous Chopta trek and Auli meadows.',
    highlights: [
      { icon: '🥾', label: '6 Night / 7 Days' },
      { icon: '📍', label: 'Dehradun to Dehradun' },
      { icon: '🚗', label: 'Innova/Similar' },
      { icon: '🏔️', label: 'Chopta & Auli' },
      { icon: '⭐', label: 'Hotels & Camps' },
      { icon: '🍽️', label: 'Daily Breakfast & Dinner' }
    ],
    img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80',
    itinerary: [
      'Day 1: Dehradun to Guptkashi. Overnight stay.',
      'Day 2: Kedarnath Darshan. Return to Guptkashi.',
      'Day 3: Guptkashi to Chopta. Trek to Tungnath.',
      'Day 4: Chandrashila Summit. Return to Chopta.',
      'Day 5: Chopta to Badrinath. Overnight stay.',
      'Day 6: Badrinath to Auli. Overnight stay.',
      'Day 7: Auli to Dehradun. Trip ends.'
    ],
    price: '₹38,000',
    actualPrice: 37999,
    discountedPrice: 32999,
  }
]

const defaultInclusions = [
  'Hotels & Guest Houses',
  'Daily Breakfast & Dinner',
  'Ground Transport (Innova)',
  'Experienced Driver',
  'All Sightseeing',
  'Parking & Toll Taxes',
  'First Aid Kit'
]

const defaultExclusions = [
  'Flight Tickets',
  'Personal Expenses',
  'Any Optional Activities',
  'Additional Meals',
  'Insurance',
  'Camera Fees',
  'Anything Not Mentioned'
]

const faqs = [
  { q: 'Is this trip suitable for families?', a: 'Yes, the itineraries are designed for all age groups.' },
  { q: 'What about accommodation?', a: 'We provide comfortable hotels and guest houses at every stop.' },
  { q: 'Do we need a special vehicle?', a: 'No, a standard Innova is sufficient for these routes.' }
]

export function HillStationsTour() {
  const [tourData, setTourData] = useState(defaultTourData)
  const [inclusions, setInclusions] = useState(defaultInclusions)
  const [exclusions, setExclusions] = useState(defaultExclusions)

  useEffect(() => {
    fetch('/api/tour-destinations?slug=hillstations')
      .then(r => r.json())
      .then(data => {
        if (data && data.config) {
          setTourData(data.tourData || defaultTourData)
          setInclusions(data.inclusions?.length ? data.inclusions : defaultInclusions)
          setExclusions(data.exclusions?.length ? data.exclusions : defaultExclusions)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <SingleSelectTour
      heroImage="https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80"
      heroTitle="Uttarakhand Hill Stations"
      heroSubtitle="Sacred Temples & Snowy Mountain Views Across the Himalayas"
      heroTag="Hill Stations"
      sectionTitle="Uttarakhand Adventures"
      tourData={tourData}
      inclusions={inclusions}
      exclusions={exclusions}
      faqs={faqs}
      bookingTitle="Uttarakhand Hill Stations Tour"
    />
  )
}
