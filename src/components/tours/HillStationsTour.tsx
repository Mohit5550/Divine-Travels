'use client'

import { SingleSelectTour } from './SingleSelectTour'

const tours = [
  { id: 1, title: 'Auli Tour (3 Days)', img: 'https://triptradition.com/wp-content/uploads/2024/08/Uttarakhand-Auli-tour-package.jpg', itinerary: ['Day 1: Rishikesh to Joshimath/Auli via Devprayag & Rudraprayag confluences', 'Day 2: Auli Ropeway, Artificial Lake, panoramic views of Nanda Devi & Skiing (Winter)', 'Day 3: Early morning return journey to Rishikesh'] },
  { id: 2, title: 'Auli & Chopta Tour (5 Days)', img: 'https://yatrakey.com/wp-content/uploads/2024/05/Auli.jpg', itinerary: ['Day 1: Rishikesh to Chopta drive (200 km) via holy confluences', 'Day 2: Tungnath Temple and Chandrashila Peak Trekking (360° Himalayan views)', 'Day 3: Chopta to Joshimath/Auli travel', 'Day 4: Auli Exploration: Lake, Skiing & Gorson Bugyal Trek', 'Day 5: Return to Rishikesh via Dhari Devi Temple'] },
  { id: 3, title: 'Chakrata: Hidden Gem (3 Days)', img: 'https://www.thehosteller.com/_next/image/?url=https%3A%2F%2Fstatic.thehosteller.com%2Fhostel%2Fimages%2Fblog%20cover-%20pc-%20Connecting%20Traveller.jpg%2Fblog%20cover-%20pc-%20Connecting%20Traveller-1696316511377.jpg&w=2048&q=75', itinerary: ['Day 1: Rishikesh to Chakrata via Vikasnagar, Sunset view at Chilmiri Neck', 'Day 2: Tiger Falls (312-foot cascade) & Deoban Forest exploration', 'Day 3: Budher Limestone Caves, Ram Tal Garden visit & Return journey'] },
  { id: 4, title: 'Chopta, Tungnath & Chandrashila (3 Days)', img: 'https://himalayandaredevils.com/storage/uploads/6809e3b078591.webp', itinerary: ['Day 1: Rishikesh to Chopta camp stay via Alaknanda/Mandakini river views', 'Day 2: Trek to Tungnath Temple (3,680 m) and Chandrashila Peak (4000 m)', 'Day 3: Return to Rishikesh via Sari Village & Deoria Tal lake trek'] },
  { id: 5, title: 'Harsil & Gartang Gali (4 Days)', img: 'https://res.cloudinary.com/dd3lqv9q9/images/f_auto,q_auto/v1768296494/Gartang_gali-f_gvjlod/Gartang_gali-f_gvjlod.webp?_i=AA', itinerary: ['Day 1: Drive along Bhagirathi river to Harsil Valley, Kashi Vishwanath visit', 'Day 2: Gartang Gali historic wooden skywalk trek and Gangotri Temple visit', 'Day 3: Explore Bagori Village, Mukhba and Sattal lakes cluster', 'Day 4: Return to Rishikesh via Gangnani Hot Springs'] },
  { id: 6, title: 'Kanatal & Tehri Lake (3 Days)', img: 'https://www.thegypsysoulresort.com/wp-content/uploads/2022/11/dam.jpg', itinerary: ['Day 1: Drive to Kanatal, stroll through Kodai Jungle & apple orchards', 'Day 2: Surkanda Devi Temple (Ropeway) and Tehri Lake Water Sports', 'Day 3: Dhanaulti Eco Park visit and return journey to Rishikesh'] },
  { id: 7, title: 'Khirsu & Pauri (3 Days)', img: 'https://mysterioushimachal.wordpress.com/wp-content/uploads/2025/01/top-places-to-visit-in-khirsu-uttarakhand.jpg', itinerary: ['Day 1: Drive to Khirsu via Devprayag, Pine forest sunset walk', 'Day 2: Explore Khirsu orchards, Kyunkaleshwar Mahadev & Ulka Garhi viewpoint', 'Day 3: Final sunrise views and return to Rishikesh via Srinagar'] },
  { id: 8, title: 'Lansdowne Hill Station (2 Days)', img: 'https://www.uttarakhandi.com/wp-content/uploads/Lansdowne.jpg', itinerary: ['Day 1: Arrive Lansdowne, Bhulla Tal Lake boating and Tip-in-Top Sunset Point', 'Day 2: St. Mary\'s Church, Army Museum and Bhim Pakora visit'] },
  { id: 9, title: 'Loyal Cave & Pawki Devi (1 Day)', img: 'https://inditales.com/wp-content/uploads/2013/10/kailash-temple-ellora-caves.jpg', itinerary: ['08:30 AM: Departure from Rishikesh along Badrinath Highway', '10:00 AM: Explore Loyal Kailash Cave and meet local \'Baba\'', '02:30 PM: Hike to Pawki Devi Shakti Peeth (5,000 feet) for views', '06:30 PM: Return arrival in Rishikesh'] },
  { id: 10, title: 'Mahabgarh Mahadev (2 Days)', img: 'https://i.ytimg.com/vi/fH5SieIpAFU/maxresdefault.jpg', itinerary: ['Day 1: Twin Valley stay via Kotdwar road, Sunset at Mahabgarh peak', 'Day 2: Himalayan Sunrise from ridge, forest nature walk and return'] },
  { id: 11, title: 'Munsiyari Highlights (6 Days)', img: 'https://munsiyari-tours.com/images/post-images/1751985553.jpg', itinerary: ['Day 1: Rishikesh to Chaukori tea gardens', 'Day 2: Birthi Falls visit and reach Munsiyari', 'Day 3: Nanda Devi Temple trek and Tribal Heritage Museum', 'Day 4: Trek to Khaliya Top (Views of Panchachuli range)', 'Day 5: Thamri Kund and Darkot Village local shopping', 'Day 6: Return journey to Rishikesh via Almora/Binsar'] },
  { id: 12, title: 'Niti Valley & Chote Amarnath (4 Days)', img: 'https://cdn1.tripoto.com/media/filter/tst/img/2150829/Image/1658416060_niti2.jpg', itinerary: ['Day 1: Rishikesh to Joshimath via Panch Prayags', 'Day 2: Tapovan Hot Springs and Rock-cut roads to Niti Village', 'Day 3: Timmersain Mahadev (Ice Shivling) cave trek', 'Day 4: Long return drive to Rishikesh (Starting at 5:00 AM)'] },
]

export function HillStationsTour() {
  return (
    <SingleSelectTour
      heroImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80"
      heroTitle="Uttarakhand Hill Stations"
      heroSubtitle="Explore the majestic Himalayan hill stations with curated tour packages"
      heroTag="Hill Stations"
      sectionTitle="Uttarakhand Journey: Select Your Tour Package"
      destinationName="Uttarakhand Hill Stations"
      packageTypeLabel="Hill Stations Tour Package"
      tours={tours}
    />
  )
}
