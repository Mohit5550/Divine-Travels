'use client'

import { useState, useEffect } from 'react'
import { SingleSelectTour } from './SingleSelectTour'

const defaultTourData = [
  {
    title: 'Auli Tour (3 Days)',
    description: 'Experience the breathtaking beauty of Auli — Uttarakhand\'s premier ski destination with panoramic views of Nanda Devi peak.',
    highlights: [
      { icon: '⛰️', label: '2 Night / 3 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🚡', label: 'Auli Ropeway Ride' },
      { icon: '🎿', label: 'Skiing (Winter)' },
      { icon: '🏔️', label: 'Nanda Devi Views' },
      { icon: '🍽️', label: 'Meals Included' }
    ],
    img: 'https://triptradition.com/wp-content/uploads/2024/08/Uttarakhand-Auli-tour-package.jpg',
    itinerary: [
      'Day 1: Rishikesh to Joshimath/Auli via Devprayag & Rudraprayag confluences',
      'Day 2: Auli Ropeway, Artificial Lake, panoramic views of Nanda Devi & Skiing (Winter)',
      'Day 3: Early morning return journey to Rishikesh'
    ],
    price: '₹12,000',
    actualPrice: 14999,
    discountedPrice: 11999,
  },
  {
    title: 'Auli & Chopta Tour (5 Days)',
    description: 'Combine the ski slopes of Auli with the serene meadows of Chopta and the sacred Tungnath-Chandrashila trek.',
    highlights: [
      { icon: '🥾', label: '4 Night / 5 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🏔️', label: 'Auli + Chopta' },
      { icon: '🛕', label: 'Tungnath Temple Trek' },
      { icon: '🏞️', label: 'Gorson Bugyal' },
      { icon: '🍽️', label: 'All Meals' }
    ],
    img: 'https://yatrakey.com/wp-content/uploads/2024/05/Auli.jpg',
    itinerary: [
      'Day 1: Rishikesh to Chopta drive (200km) via holy confluences',
      'Day 2: Tungnath Temple and Chandrashila Peak Trekking (360° Himalayan views)',
      'Day 3: Chopta to Joshimath/Auli travel',
      'Day 4: Auli Exploration: Lake, Skiing & Gorson Bugyal Trek',
      'Day 5: Return to Rishikesh via Dhari Devi Temple'
    ],
    price: '₹18,500',
    actualPrice: 21999,
    discountedPrice: 18499,
  },
  {
    title: 'Chakrata: Hidden Gem (3 Days)',
    description: 'Discover the serene offbeat hill station of Chakrata with its stunning Tiger Falls and ancient limestone caves.',
    highlights: [
      { icon: '🌲', label: '2 Night / 3 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '💧', label: 'Tiger Falls Visit' },
      { icon: '🕳️', label: 'Limestone Caves' },
      { icon: '🏞️', label: 'Deoban Forest' },
      { icon: '🍽️', label: 'Meals Included' }
    ],
    img: 'https://www.thehosteller.com/_next/image/?url=https%3A%2F%2Fstatic.thehosteller.com%2Fhostel%2Fimages%2Fblog%20cover-%20pc-%20Connecting%20Traveller.jpg%2Fblog%20cover-%20pc-%20Connecting%20Traveller-1696316511377.jpg&w=2048&q=75',
    itinerary: [
      'Day 1: Rishikesh to Chakrata via Vikasnagar, Sunset view at Chilmiri Neck',
      'Day 2: Tiger Falls (312-foot cascade) & Deoban Forest exploration',
      'Day 3: Budher Limestone Caves, Ram Tal Garden visit & Return journey'
    ],
    price: '₹9,500',
    actualPrice: 11999,
    discountedPrice: 9499,
  },
  {
    title: 'Chopta, Tungnath & Chandrashila (3 Days)',
    description: 'Trek to the highest Shiva temple at Tungnath and summit Chandrashila Peak for a 360° Himalayan panorama.',
    highlights: [
      { icon: '🥾', label: '2 Night / 3 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🛕', label: 'Tungnath Temple' },
      { icon: '🏔️', label: 'Chandrashila Summit' },
      { icon: '🏞️', label: 'Deoria Tal Lake' },
      { icon: '🍽️', label: 'All Meals' }
    ],
    img: 'https://himalayandaredevils.com/storage/uploads/6809e3b078591.webp',
    itinerary: [
      'Day 1: Rishikesh to Chopta camp stay via Alaknanda/Mandakini river views',
      'Day 2: Trek to Tungnath Temple (3,680 m) and Chandrashila Peak (4,000 m)',
      'Day 3: Return to Rishikesh via Sari Village & Deoria Tal lake trek'
    ],
    price: '₹8,500',
    actualPrice: 10999,
    discountedPrice: 8499,
  },
  {
    title: 'Harsil & Gartang Gali (4 Days)',
    description: 'Explore the historic wooden skywalk of Gartang Gali and the pristine beauty of Harsil Valley along the Bhagirathi river.',
    highlights: [
      { icon: '🏔️', label: '3 Night / 4 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🌉', label: 'Gartang Gali Skywalk' },
      { icon: '🛕', label: 'Gangotri Temple' },
      { icon: '♨️', label: 'Gangnani Hot Springs' },
      { icon: '🍽️', label: 'All Meals' }
    ],
    img: 'https://res.cloudinary.com/dd3lqv9q9/images/f_auto,q_auto/v1768296494/Gartang_gali-f_gvjlod/Gartang_gali-f_gvjlod.webp?_i=AA',
    itinerary: [
      'Day 1: Drive along Bhagirathi river to Harsil Valley, Kashi Vishwanath visit',
      'Day 2: Gartang Gali historic wooden skywalk trek and Gangotri Temple visit',
      'Day 3: Explore Bagori Village, Mukhba and Sattal lakes cluster',
      'Day 4: Return to Rishikesh via Gangnani Hot Springs'
    ],
    price: '₹14,000',
    actualPrice: 16999,
    discountedPrice: 13999,
  },
  {
    title: 'Kanatal & Tehri Lake (3 Days)',
    description: 'Enjoy the tranquility of Kanatal with apple orchards and pine forests combined with water sports at Tehri Lake.',
    highlights: [
      { icon: '🌲', label: '2 Night / 3 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🏞️', label: 'Tehri Lake Sports' },
      { icon: '🛕', label: 'Surkanda Devi Temple' },
      { icon: '🌳', label: 'Dhanaulti Eco Park' },
      { icon: '🍽️', label: 'Meals Included' }
    ],
    img: 'https://www.thegypsysoulresort.com/wp-content/uploads/2022/11/dam.jpg',
    itinerary: [
      'Day 1: Drive to Kanatal, stroll through Kodai Jungle & apple orchards',
      'Day 2: Surkanda Devi Temple (Ropeway) and Tehri Lake Water Sports',
      'Day 3: Dhanaulti Eco Park visit and return journey to Rishikesh'
    ],
    price: '₹9,000',
    actualPrice: 11999,
    discountedPrice: 8999,
  },
  {
    title: 'Khirsu & Pauri (3 Days)',
    description: 'Discover the tranquil hill stations of Khirsu and Pauri with panoramic Himalayan views and ancient temples.',
    highlights: [
      { icon: '🏔️', label: '2 Night / 3 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🌲', label: 'Pine Forest Walks' },
      { icon: '🛕', label: 'Kyunkaleshwar Mahadev' },
      { icon: '🏞️', label: 'Ulka Garhi Viewpoint' },
      { icon: '🍽️', label: 'Meals Included' }
    ],
    img: 'https://mysterioushimachal.wordpress.com/wp-content/uploads/2025/01/top-places-to-visit-in-khirsu-uttarakhand.jpg',
    itinerary: [
      'Day 1: Drive to Khirsu via Devprayag, Pine forest sunset walk',
      'Day 2: Explore Khirsu orchards, Kyunkaleshwar Mahadev & Ulka Garhi viewpoint',
      'Day 3: Final sunrise views and return to Rishikesh via Srinagar'
    ],
    price: '₹8,000',
    actualPrice: 9999,
    discountedPrice: 7999,
  },
  {
    title: 'Lansdowne Hill Station (2 Days)',
    description: 'A quick weekend getaway to the quiet, pine-clad cantonment town of Lansdowne with colonial charm.',
    highlights: [
      { icon: '🌲', label: '1 Night / 2 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🏞️', label: 'Bhulla Tal Lake' },
      { icon: '🌅', label: 'Tip-in-Top Sunset' },
      { icon: '⛪', label: 'St. Mary\'s Church' },
      { icon: '🍽️', label: 'Meals Included' }
    ],
    img: 'https://www.uttarakhandi.com/wp-content/uploads/Lansdowne.jpg',
    itinerary: [
      'Day 1: Arrive Lansdowne, Bhulla Tal Lake boating and Tip-in-Top Sunset Point',
      'Day 2: St. Mary\'s Church, Army Museum and Bhim Pakora visit'
    ],
    price: '₹5,500',
    actualPrice: 6999,
    discountedPrice: 5499,
  },
  {
    title: 'Loyal Cave & Pawki Devi (1 Day)',
    description: 'A quick day trip from Rishikesh to explore the mystical Loyal Kailash Cave and the Shakti Peeth at Pawki Devi.',
    highlights: [
      { icon: '🕳️', label: '1 Day Trip' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🛕', label: 'Loyal Kailash Cave' },
      { icon: '🏔️', label: 'Pawki Devi Hike' },
      { icon: '🚗', label: 'Private Vehicle' },
      { icon: '🍽️', label: 'Lunch Included' }
    ],
    img: 'https://inditales.com/wp-content/uploads/2013/10/kailash-temple-ellora-caves.jpg',
    itinerary: [
      '08:30 AM: Departure from Rishikesh along Badrinath Highway',
      '10:00 AM: Explore Loyal Kailash Cave and meet local Baba',
      '02:30 PM: Hike to Pawki Devi Shakti Peeth (5,000 feet) for views',
      '06:30 PM: Return arrival in Rishikesh'
    ],
    price: '₹2,500',
    actualPrice: 3499,
    discountedPrice: 2499,
  },
  {
    title: 'Mahabgarh Mahadev (2 Days)',
    description: 'A spiritual weekend escape to the Mahabgarh peak with stunning Himalayan sunrise views from the ridge.',
    highlights: [
      { icon: '🏔️', label: '1 Night / 2 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🛕', label: 'Mahabgarh Mahadev' },
      { icon: '🌅', label: 'Himalayan Sunrise' },
      { icon: '🌲', label: 'Forest Nature Walk' },
      { icon: '🍽️', label: 'Meals Included' }
    ],
    img: 'https://i.ytimg.com/vi/fH5SieIpAFU/maxresdefault.jpg',
    itinerary: [
      'Day 1: Twin Valley stay via Kotdwar road, Sunset at Mahabgarh peak',
      'Day 2: Himalayan Sunrise from ridge, forest nature walk and return'
    ],
    price: '₹5,000',
    actualPrice: 6499,
    discountedPrice: 4999,
  },
  {
    title: 'Munsiyari Highlights (6 Days)',
    description: 'A comprehensive expedition to the charming hill station of Munsiyari with views of the Panchachuli range and tribal heritage.',
    highlights: [
      { icon: '🏔️', label: '5 Night / 6 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🏞️', label: 'Panchachuli Views' },
      { icon: '🥾', label: 'Khaliya Top Trek' },
      { icon: '🛕', label: 'Nanda Devi Temple' },
      { icon: '🍽️', label: 'All Meals' }
    ],
    img: 'https://munsiyari-tours.com/images/post-images/1751985553.jpg',
    itinerary: [
      'Day 1: Rishikesh to Chaukori tea gardens',
      'Day 2: Birthi Falls visit and reach Munsiyari',
      'Day 3: Nanda Devi Temple trek and Tribal Heritage Museum',
      'Day 4: Trek to Khaliya Top (Views of Panchachuli range)',
      'Day 5: Thamri Kund and Darkot Village local shopping',
      'Day 6: Return journey to Rishikesh via Almora/Binsar'
    ],
    price: '₹22,000',
    actualPrice: 25999,
    discountedPrice: 21999,
  },
  {
    title: 'Niti Valley & Chote Amarnath (4 Days)',
    description: 'Venture into the remote Niti Valley near the Tibet border and trek to the Chote Amarnath ice Shivling cave.',
    highlights: [
      { icon: '🏔️', label: '3 Night / 4 Days' },
      { icon: '📍', label: 'Rishikesh to Rishikesh' },
      { icon: '🕳️', label: 'Ice Shivling Cave' },
      { icon: '🏞️', label: 'Niti Valley' },
      { icon: '♨️', label: 'Tapovan Hot Springs' },
      { icon: '🍽️', label: 'All Meals' }
    ],
    img: 'https://cdn1.tripoto.com/media/filter/tst/img/2150829/Image/1658416060_niti2.jpg',
    itinerary: [
      'Day 1: Rishikesh to Joshimath via Panch Prayags',
      'Day 2: Tapovan Hot Springs and Rock-cut roads to Niti Village',
      'Day 3: Timmersain Mahadev (Ice Shivling) cave trek',
      'Day 4: Long return drive to Rishikesh (Starting at 5:00 AM)'
    ],
    price: '₹16,000',
    actualPrice: 18999,
    discountedPrice: 15999,
  }
]

const defaultInclusions = [
  'Comfortable Hotels / Camps / Guest Houses',
  'Daily Breakfast & Dinner',
  'Private Vehicle (Innova/Similar)',
  'Experienced Driver',
  'All Toll Tax & Parking',
  'First Aid Kit',
  'Sightseeing as per itinerary'
]

const defaultExclusions = [
  'Flight / Train Tickets',
  'Personal Expenses (Tips, Laundry)',
  'Any Optional Activities',
  'Additional Meals Not Mentioned',
  'Insurance Coverage',
  'Entry Fees at Monuments',
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

  const mapProgramsToTourData = (programs: any[]) =>
    programs.map((p) => {
      const days = p.itinerary?.length || 1
      return {
        title: p.title,
        description: p.description || `Explore ${p.title} with Divine Travels.`,
        highlights: p.highlights?.length ? p.highlights : [
          { icon: days > 1 ? '🏔️' : '🚗', label: days > 1 ? `${days - 1} Night / ${days} Days` : '1 Day Trip' },
          { icon: '📍', label: 'Rishikesh to Rishikesh' },
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
    fetch('/api/tour-destinations?slug=hill-stations')
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
