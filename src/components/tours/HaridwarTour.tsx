'use client'

import { DayBasedTour } from './DayBasedTour'

const programs = {
  1: { id: 1, title: 'The Spiritual Classic', img: 'https://cdn.s3waas.gov.in/s33416a75f4cea9109507cacd8e2f2aefc/uploads/bfi_thumb/2019082216-olw83bostxez7pfdluen8vzv6ajj4kp9ypkvffbdze.jpg', itinerary: ['09:00 AM | Mansa Devi Temple: Ropeway morning blessings and city view', '11:30 AM | Chandi Devi Temple: Ancient Shakti Peeth visit via ropeway', '01:30 PM | Lunch at Moti Bazar: Famous street food like Aloo Puri & Kachoris', '03:00 PM | Daksh Mahadev Temple: Historic Shiva temple in Kankhal', '05:30 PM | Har Ki Pauri: Sunset Ganga Aarti experience'] },
  2: { id: 2, title: 'Culture & Heritage', img: 'https://s7ap1.scene7.com/is/image/incredibleindia/saptrishi-ashram-haridwar-uttarakhand-1-attr-hero?qlt=82&ts=1726645929175', itinerary: ['10:00 AM | Bharat Mata Mandir: Unique 8-story temple for Mother India', '11:30 AM | Pawan Dham: Intricate Glass Temple with mirror work', '01:00 PM | Shantikunj Ashram: Peaceful walk and spiritual exhibits', '03:30 PM | Sapt Rishi Ashram: Seven streams of the Holy Ganga', '06:00 PM | Birla Ghat: Quiet evening by the river'] },
  3: { id: 3, title: 'Nature & Wildlife (Rajaji Loop)', img: 'https://rajajijunglesafari.com/wp-content/uploads/chilla-5.jpg', itinerary: ['07:00 AM | Chilla Range (Rajaji): Early morning Jungle Safari', '11:00 AM | Neel Dhara Pakshi Vihar: Bird watching near Bhimgoda', '01:00 PM | Lakeside Lunch: Relaxation at a garden restaurant', '03:00 PM | Patanjali Yogpeeth: Massive Yoga and Ayurveda center', '06:30 PM | Haridwar Local Market: Shopping for herbs and handicrafts'] },
  4: { id: 4, title: 'The Panch Tirth Pilgrimage', img: 'https://www.sterlingholidays.com/activities/haridwar/har-ki-pauri-activity-image.jpg.imgw.1280.1280.jpeg', itinerary: ['08:00 AM | Har Ki Pauri: Holy dip in the Brahma Kund', '10:30 AM | Kushavarta Ghat: Historic rituals and rites site', '12:30 PM | Kankhal: Explore the famous mythological Sati sacrifice site', '03:00 PM | Siddhapeeth Triangle: Mansa Devi & Chandi Devi visits', '06:00 PM | Maya Devi Temple: City\'s presiding deity visit'] },
}

const programList = Object.values(programs).map(({ id, title, img }) => ({ id, title, img }))

export function HaridwarTour() {
  return (
    <DayBasedTour
      heroImage="https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&q=80"
      heroTitle="Haridwar Tour Packages"
      heroSubtitle="Experience divine Ganga Aarti and spiritual heritage with flexible programs"
      heroTag="Haridwar Tours"
      sectionTitle="Choose Your Haridwar Experience"
      sectionSubtitle="Mix and match programs across 3 days to create your perfect spiritual journey"
      programs={programs}
      programList={programList}
      destinationName="Haridwar"
      dayConfigs={[
        { label: 'Day 1', title: 'Section 1: Day 1 Selection (Select 1)', maxSelect: 1 },
        { label: 'Day 2', title: 'Section 2: Day 2 Selection (Select any 2)', maxSelect: 2 },
        { label: 'Day 3', title: 'Section 3: Day 3 Selection (Select any 3)', maxSelect: 3 },
      ]}
    />
  )
}
