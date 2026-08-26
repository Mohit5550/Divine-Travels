'use client'

import { useState, useEffect } from 'react'
import { DayBasedTour } from './DayBasedTour'

const defaultPrograms = {
  1: { id: 1, title: 'The Classic Nainital City Tour', img: 'https://i0.wp.com/oneday.tours/wp-content/uploads/one-day-nainital-local-sightseeing-tour-package-thandi-sadak-3.jpg?resize=750%2C400&ssl=1', itinerary: ['Naini Lake', 'Naina Devi Temple', 'Snow View Point', 'Eco Cave Gardens', 'Tiffin Top', 'Tibetan Market', 'Chitai Golu Devta Temple', 'Tiffin Top (Dorothy\'s Seat)'] },
  2: { id: 2, title: 'Lake District & Spiritual Trail', img: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=800', itinerary: ['Kainchi Dham', 'Bhimtal Lake', 'Naukuchiatal', 'Sattal (Seven Lakes)', 'Hanuman Garhi', 'Nainital Mall Road'] },
  3: { id: 3, title: 'Kainchi Dham & Almora', img: 'https://www.epicyatra.com/wp-content/uploads/2025/01/1680354261299-1024x683.webp', itinerary: ['Kainchi Dham', 'Almora', 'Kasar Devi Temple', 'Katarmal Sun Temple'] },
  4: { id: 4, title: 'Nainital City Sights', img: 'https://www.bontravelindia.com/wp-content/uploads/2022/08/Best-Places-to-Visit-in-Nainital.jpg', itinerary: ['Naini Lake', 'Naina Devi Temple', 'Hanuman Garhi temple', 'Snow View Point'] },
  5: { id: 5, title: 'Ashram & Lake District', img: 'https://media-cdn.tripadvisor.com/media/photo-m/1280/14/3f/82/5d/bhimtal-island-aquarium.jpg', itinerary: ['Kainchi Dham (Neem Karoli Baba Ashram)', 'Chitai Golu Devta Temple', 'Bhimtal (Island Aquarium)', 'Forest lakes of Sattal'] },
  6: { id: 6, title: 'Wildlife Adventure & Spiritual', img: 'https://content.jdmagicbox.com/comp/corbett/a3/9999p5942.5942.191214120957.u3a3/catalogue/jim-corbett-national-park-ramnagar-corbett-wildlife-sanctuary-1loxvqyg6i.jpg', itinerary: ['Jungle Safari', 'Garjiya Devi Temple', 'Shri Hanuman Dham', 'Corbett Fall'] },
  7: { id: 7, title: 'Ranikhet Military & Orchards', img: 'https://hblimg.mmtcdn.com/content/hubble/img/ranikhet/mmt/activities/m_activities_ranikhet_kumaon_regimental_centre_l_405_640.jpg', itinerary: ['Kumaon Regimental Centre', 'Upat Golf Course', 'Haidakhan Babaji Temple'] },
  8: { id: 8, title: 'Jageshwar, Bageshwar & Almora', img: 'https://www.chirpinghillsresort.com/wp-content/uploads/2025/05/jageshwar-dham-structures-500x445.jpg', itinerary: ['Almora', 'Jageshwar Dham', 'Kasar Devi Temple', 'Bageshwar Dham'] },
  9: { id: 9, title: 'Almora & Kausani', img: 'https://www.tourmyindia.com/socialimg/best-of-kaumoan-hills.jpg', itinerary: ['Almora', 'Kasar Devi', 'Sun Temple', 'Someshwar Temple', 'Kausani', 'Baijnath'] },
  10: { id: 10, title: 'Master Program 01', img: 'https://www.bontravelindia.com/wp-content/uploads/2022/08/Best-Places-to-Visit-in-Nainital.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Ksusani', 'Someshwar', 'Sun Temple', 'Almora', 'Kasar Devi', 'Jageshwar', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
  11: { id: 11, title: 'Master Program 02', img: 'https://www.chirpinghillsresort.com/wp-content/uploads/2025/05/jageshwar-dham-structures-500x445.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Bageshwar', 'Almora', 'Kasar Devi', 'Jageshwar', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
  12: { id: 12, title: 'Master Program 03', img: 'https://hblimg.mmtcdn.com/content/hubble/img/ranikhet/mmt/activities/m_activities_ranikhet_kumaon_regimental_centre_l_405_640.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Ksusani', 'Someshwar', 'RaniKhet (Haidakhan Babaji)', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
}

const defaultProgramList = Object.values(defaultPrograms).map(({ id, title, img }) => ({ id, title, img }))

const defaultDayConfigs = [
  { label: 'Day 1', title: 'Section 1: Day 1 Selection (Select 1)', maxSelect: 1 },
  { label: 'Day 2', title: 'Section 2: Day 2 Selection (Select any 2)', maxSelect: 2 },
  { label: 'Day 3', title: 'Section 3: Day 3 Selection (Select any 3)', maxSelect: 3 },
]

export function NainitalTour() {
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/tour-destinations?slug=nainital')
      .then(r => r.json())
      .then(data => { if (data && data.config) setApiData(data) })
      .catch(() => {})
  }, [])

  const config = apiData?.config || {}
  const programs = apiData?.programs?.length
    ? Object.fromEntries(apiData.programs.map((p: any) => [p.id, p]))
    : defaultPrograms
  const programList = apiData?.programs?.length
    ? apiData.programs.map((p: any) => ({ id: p.id, title: p.title, img: p.img }))
    : defaultProgramList
  const dayConfigs = apiData?.dayConfigs?.length ? apiData.dayConfigs : defaultDayConfigs

  return (
    <DayBasedTour
      heroImage={config.heroImage || 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80'}
      heroTitle={config.heroTitle || 'Nainital Tour Packages'}
      heroSubtitle={config.heroSubtitle || 'Discover the Lake District of India with flexible day-wise programs and master circuits'}
      heroTag={config.heroTag || 'Nainital Tours'}
      sectionTitle={config.sectionTitle || 'Choose Your Nainital Experience'}
      sectionSubtitle={config.sectionSubtitle || 'Mix and match programs across 3 days, or choose a master circuit for a complete journey'}
      programs={programs}
      programList={programList}
      destinationName="Nainital"
      dayConfigs={dayConfigs}
    />
  )
}
