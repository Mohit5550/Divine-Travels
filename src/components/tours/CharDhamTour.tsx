'use client'

import { SingleSelectTour } from './SingleSelectTour'

const tours = [
  { id: 1, title: 'Badrinath Yatra (3 Days)', img: 'https://www.chardham-pilgrimage-tour.com/assets/images/chardham-banner7.webp', itinerary: ['Day 1: Pick up from Haridwar/Rishikesh and drive to Pipalkoti/Joshimath.', 'Day 2: Drive to Badrinath, visit the Temple, Tapt Kund, Mana Village, and overnight stay.', 'Day 3: Return to Rishikesh/Haridwar.'] },
  { id: 2, title: 'Kedarnath Yatra (4 Days)', img: 'https://www.tourtraveltourism.com/images/packages/kedarnath/kedarnath-trip.jpg', itinerary: ['Day 1: Haridwar/Rishikesh to Guptkashi/Sitapur (7-8 hours travel). Check-in and rest.', 'Day 2: Drive to Gaurikund, start 16-20 km trek (or pony/heli) to Kedarnath Temple.', 'Day 3: Attend morning Aarti, trek back down to Gaurikund, and return to Sitapur/Guptkashi.', 'Day 4: Depart from Sitapur/Guptkashi to Haridwar/Rishikesh.'] },
  { id: 3, title: 'Gangotri Yatra (4 Days)', img: 'https://www.chardham-pilgrimage-tour.com/assets/images/gangotri-banner2.webp', itinerary: ['Day 1: Haridwar/Rishikesh to Uttarkashi (190 km/7-8 hrs) via Chamba.', 'Day 2: Drive to Gangotri Temple (3,048m). Darshan, Aarti, and optional Harsil Valley/Gartang Gali visit.', 'Day 3: Visit Vishwanath Temple in Uttarkashi or relax in the surrounding hills.', 'Day 4: Return drive from Uttarkashi to Haridwar/Rishikesh.'] },
  { id: 4, title: 'Yamunotri Yatra (3 Days)', img: 'https://www.sushanttravels.com/uploads/nO26cmz_Yamunotri_1.jpg', itinerary: ['Day 1: Haridwar/Rishikesh to Barkot (160-180 km) via Chamba/Tehri Lake view.', 'Day 2: Barkot to Janki Chatti drive, then 6 km trek to Yamunotri Temple and hot springs.', 'Day 3: Check out from Barkot and drive back to Haridwar/Rishikesh.'] },
  { id: 5, title: 'Do Dham Yatra (7 Days)', img: 'https://yatrakey.com/wp-content/uploads/2025/02/do-dham-yatra-1.jpg', itinerary: ['Day 1: Haridwar/Rishikesh to Guptkashi/Sitapur.', 'Day 2: Trek or Helicopter to Kedarnath. Overnight stay at Kedarnath.', 'Day 3: Trek down and return to Guptkashi.', 'Day 4: Drive from Guptkashi to Badrinath via Joshimath.', 'Day 5: Badrinath Darshan and return to Rudraprayag.', 'Day 6: Return journey to Haridwar/Rishikesh.'] },
  { id: 6, title: 'Char Dham Yatra (10 Days)', img: 'https://www.shrineyatra.in/wp-content/uploads/2024/08/chardham-tour-package.webp', itinerary: ['Day 1: Rishikesh/Dehradun to Barkot', 'Day 2: Barkot - Yamunotri - Barkot (Trek Day)', 'Day 3: Barkot to Uttarkashi', 'Day 4: Uttarkashi - Gangotri - Uttarkashi', 'Day 5: Uttarkashi to Guptkashi', 'Day 6: Guptkashi to Kedarnath (Trek/Heli)', 'Day 7: Kedarnath to Guptkashi', 'Day 8: Guptkashi to Badrinath', 'Day 9: Badrinath to Rudraprayag/Pipalkoti', 'Day 10: Rudraprayag to Rishikesh'] },
]

export function CharDhamTour() {
  return (
    <SingleSelectTour
      heroImage="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80"
      heroTitle="Char Dham Yatra Packages"
      heroSubtitle="Sacred pilgrimage to the four holy abodes of Uttarakhand"
      heroTag="Char Dham Yatra"
      sectionTitle="Char Dham Yatra: Select Your Pilgrimage Package"
      destinationName="Char Dham"
      packageTypeLabel="Char Dham Yatra Package"
      tours={tours}
    />
  )
}
