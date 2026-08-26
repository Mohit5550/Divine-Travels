'use client'

import { useState, useEffect } from 'react'
import { DayBasedTour } from './DayBasedTour'

const defaultPrograms = {
  1: { id: 1, title: 'Kunjapuri Sunrise', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800', itinerary: ['Kunjapuri Viewpoint', 'Janki Jhula', 'Paramarth Niketan', 'Geetabhawan', 'Ram Jhula Market', 'Neer Waterfall', 'Triveni Ghat Aarti'] },
  2: { id: 2, title: 'Neelkhanth & Waterfalls', img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/d1/79/1a/caption.jpg?w=1200&h=-1&s=1', itinerary: ['Neelkhanth Mahadev Temple', 'Kali Kund Waterfall', 'Patna Waterfall', 'Vasisth Cave', 'Shivpuri Beach'] },
  3: { id: 3, title: 'Local Tour', img: 'https://www.chardhamtours.in/gallery/cityImage/1462337031_veer.jpg', itinerary: ['Bharat Mata Mandir', 'Triveni Ghat', 'Veer Bhadr Temple', 'Hanuman Temple', 'Laxman Jhula', 'Ram Jhula Aarti'] },
  4: { id: 4, title: 'Devprayag', img: 'https://t.eucdn.in/tourism/lg/devprayag-9286235.webp', itinerary: ['Sangam (Alaknanda & Bhagirathi)', 'Raghunathji Temple', 'Vasisth Cave'] },
  5: { id: 5, title: 'Dhari Devi & Devprayag', img: 'https://i0.wp.com/joshimilestoner.com/wp-content/uploads/2024/10/Maa-Dhari-Devi_joshimilestoner-.webp', itinerary: ['Dhari Devi Temple', 'Devprayag Sangam', 'Vasisth Cave'] },
  6: { id: 6, title: 'Neelkanth Sunset', img: 'https://bharathgyanblog.wordpress.com/wp-content/uploads/2017/12/dsc_4204.jpg', itinerary: ['Neelkanth Temple', 'Jhilmil Gufa', 'Garud Temple', 'Neer Waterfall Sunset'] },
  7: { id: 7, title: 'Pawaki Devi & Caves', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3PO6ImpFxovyAzoKBuJgpIL2vZDSVrySgrA&s', itinerary: ['Pawaki Devi Temple', 'Loyal Cave', 'Vasisth Cave'] },
  8: { id: 8, title: 'Tehri Lake & Surkanda', img: 'https://t.eucdn.in/tourism/lg/tehri-lake-993324.webp', itinerary: ['Tehri Lake Water Sports', 'Chamba Market', 'Surkanda Devi Temple'] },
}

const defaultProgramList = Object.values(defaultPrograms).map(({ id, title, img }) => ({ id, title, img }))

const defaultDayConfigs = [
  { label: 'Day 1', title: 'Section 1: Day 1 Selection (Select 1)', maxSelect: 1 },
  { label: 'Day 2', title: 'Section 2: Day 2 Selection (Select any 2)', maxSelect: 2 },
  { label: 'Day 3', title: 'Section 3: Day 3 Selection (Select any 3)', maxSelect: 3 },
]

export function RishikeshTour() {
  const [apiData, setApiData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/tour-destinations?slug=rishikesh')
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
      heroImage={config.heroImage || 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80'}
      heroTitle={config.heroTitle || 'Rishikesh Tour Packages'}
      heroSubtitle={config.heroSubtitle || 'Explore the Yoga Capital of the World with flexible day-wise programs'}
      heroTag={config.heroTag || 'Rishikesh Tours'}
      sectionTitle={config.sectionTitle || 'Choose Your Rishikesh Experience'}
      sectionSubtitle={config.sectionSubtitle || 'Mix and match programs across 3 days to create your perfect itinerary'}
      programs={programs}
      programList={programList}
      destinationName="Rishikesh"
      dayConfigs={dayConfigs}
    />
  )
}
