'use client'

import { DayBasedTour } from './DayBasedTour'

const programs = {
  1: { id: 1, title: 'Dehradun-Mussoorie Express', img: 'https://i0.wp.com/stampedmoments.com/wp-content/uploads/2025/07/i-love-mussoorie.jpg?fit=1024%2C768&ssl=1', itinerary: ['08:00 AM | Sahastradhara: Sulfur springs and hilltop ropeway', '10:30 AM | Robber\'s Cave: Adventure walk through natural river canyon', '12:30 PM | Prakasheshwar Temple: Famous Shiv Temple visit', '01:30 PM | Mussoorie Lake: Scenic lunch and paddle boating', '03:00 PM | Bhatta Falls: Ropeway descent and natural pools', '05:00 PM | Mall Road: Shopping and sunset at Camel\'s Back Road'] },
  2: { id: 2, title: 'The Queen of Hills Classic', img: 'https://blog.ecohospitality.in/wp-content/uploads/2024/07/Img-9.jpg', itinerary: ['09:30 AM | Kempty Falls: Morning dip and ropeway ride', '11:30 AM | Company Garden: Botanical walk and lake boating', '01:30 PM | Library Chowk: Local Himalayan cafes and Tibetan food', '03:00 PM | Gun Hill: Ropeway ride to peak for snowy range views', '05:00 PM | Mall Road: Evening stroll and Kulri Bazaar shopping'] },
  3: { id: 3, title: 'Heritage & High Peaks (Landour)', img: 'https://c.ndtvimg.com/gws/ms/top-places-to-visit-in-mussoorie/assets/2.jpeg?1727874795', itinerary: ['10:00 AM | Landour Bakehouse: Coffee and pastries at British-era bakery', '11:30 AM | Lal Tibba: Binocular viewing of Himalayan peaks', '01:00 PM | Char Dukan: Iconic pancake or Maggi lunch', '03:30 PM | George Everest\'s House: Short trek for 360-degree vistas', '06:00 PM | Cloud\'s End: Sunset walk through dense oak forest'] },
  4: { id: 4, title: 'Dehradun Nature & Spirit Loop', img: 'https://i0.wp.com/stampedmoments.com/wp-content/uploads/2025/07/gun-hill-mussoorie.jpg?fit=1024%2C768&ssl=1', itinerary: ['10:00 AM | Robber\'s Cave: Adventure walk through the canyon', '12:00 PM | Tapkeshwar Mahadev Temple: Forest cave temple visit', '01:30 PM | Rajpur Road: Lunch at Dehradun\'s main vibrant street', '03:00 PM | Mindrolling Monastery: Tour Grand Stupa and gardens', '05:00 PM | FRI: Photography at the Greco-Roman campus'] },
  5: { id: 5, title: 'Adventure & Wildlife (Doon Outskirts)', img: 'https://media.assettype.com/outlooktraveller/import/outlooktraveller/public/uploads/articles/explore/files/2015/04/220515121227-Mussorie1.jpg?w=1200&ar=40%3A21&auto=format%2Ccompress&ogImage=true&mode=crop&enlarge=true&overlay=false&overlay_position=bottom&overlay_width=100', itinerary: ['09:30 AM | Sahastradhara: Healing springs and hilltop ropeway', '12:30 PM | Malsi Deer Park: Explore the zoo (Deer, Leopards, Crocodiles)', '02:30 PM | Maldevta / Lachhiwala: Riverside picnic or swim', '05:30 PM | Buddha Temple: Visit 103-foot tall Buddha statue'] },
  6: { id: 6, title: 'The Clouds & Canyons Adventure', img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/9d/e1/a7/caption.jpg?w=1200&h=1200&s=1', itinerary: ['10:30 AM | Dalai Hills: Trek past Tibetan prayer flags to Buddha statue', '12:00 PM | Bhatta Falls: Descend via ropeway to secluded falls', '02:00 PM | Mussoorie Lake: Scenic lunch and quick boat ride', '04:00 PM | Santura Devi Temple: Peaceful hilltop shrine visit', '06:00 PM | Mall Road: Heart of Mussoorie evening stroll'] },
  7: { id: 7, title: 'Temples, Lakes & Alpine Forests', img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/66/de/a3/beautiful-scenery.jpg?w=800&h=500&s=1', itinerary: ['05:00 AM | Kunjapuri Devi: Sunrise over snow-capped peaks', '09:30 AM | Tehri Lake Adventure: Jet Ski, Speed Boat, and brunch', '12:30 PM | Chamba Market: Local Pahadi market exploration', '02:30 PM | Surkanda Devi (Kanatal): Ropeway to Shakti Peeth (2,750m)'] },
}

const programList = Object.values(programs).map(({ id, title, img }) => ({ id, title, img }))

export function MussoorieTour() {
  return (
    <DayBasedTour
      heroImage="https://blog.ecohospitality.in/wp-content/uploads/2024/07/Img-9.jpg"
      heroTitle="Mussoorie & Dehradun Tour Packages"
      heroSubtitle="Explore the Queen of Hills with flexible day-wise programs"
      heroTag="Mussoorie Tours"
      sectionTitle="Choose Your Mussoorie Experience"
      sectionSubtitle="Mix and match programs across 3 days to create your perfect hill station getaway"
      programs={programs}
      programList={programList}
      destinationName="Mussoorie"
      dayConfigs={[
        { label: 'Day 1', title: 'Section 1: Day 1 Selection (Select 1)', maxSelect: 1 },
        { label: 'Day 2', title: 'Section 2: Day 2 Selection (Select any 2)', maxSelect: 2 },
        { label: 'Day 3', title: 'Section 3: Day 3 Selection (Select any 3)', maxSelect: 3 },
      ]}
    />
  )
}
