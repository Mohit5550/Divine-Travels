import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

const rishikeshPrograms = [
  { id: 1, title: 'Kunjapuri Sunrise', img: 'https://sun-b2b.s3.us-east-2.amazonaws.com/tour/Sunrise-view-from-kunjapuri-temple.jpg', itinerary: ['Kunjapuri Viewpoint', 'Janki Jhula', 'Paramarth Niketan', 'Geetabhawan', 'Ram Jhula Market', 'Neer Waterfall', 'Triveni Ghat Aarti'] },
  { id: 2, title: 'Neelkhanth & Waterfalls', img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/d1/79/1a/caption.jpg?w=1200&h=-1&s=1', itinerary: ['Neelkhanth Mahadev Temple', 'Kali Kund Waterfall', 'Patna Waterfall', 'Vasisth Cave', 'Shivpuri Beach'] },
  { id: 3, title: 'Local Tour', img: 'https://www.chardhamtours.in/gallery/cityImage/1462337031_veer.jpg', itinerary: ['Bharat Mata Mandir', 'Triveni Ghat', 'Veer Bhadr Temple', 'Hanuman Temple', 'Laxman Jhula', 'Ram Jhula Aarti'] },
  { id: 4, title: 'Devprayag', img: 'https://t.eucdn.in/tourism/lg/devprayag-9286235.webp', itinerary: ['Sangam (Alaknanda & Bhagirathi)', 'Raghunathji Temple', 'Vasisth Cave'] },
  { id: 5, title: 'Dhari Devi & Devprayag', img: 'https://i0.wp.com/joshimilestoner.com/wp-content/uploads/2024/10/Maa-Dhari-Devi_joshimilestoner-.webp', itinerary: ['Dhari Devi Temple', 'Devprayag Sangam', 'Vasisth Cave'] },
  { id: 6, title: 'Neelkanth Sunset', img: 'https://bharathgyanblog.wordpress.com/wp-content/uploads/2017/12/dsc_4204.jpg', itinerary: ['Neelkanth Temple', 'Jhilmil Gufa', 'Garud Temple', 'Neer Waterfall Sunset'] },
  { id: 7, title: 'Pawaki Devi & Caves', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3PO6ImpFxovyAzoKBuJgpIL2vZDSVrySgrA&s', itinerary: ['Pawaki Devi Temple', 'Loyal Cave', 'Vasisth Cave'] },
  { id: 8, title: 'Tehri Lake & Surkanda', img: 'https://t.eucdn.in/tourism/lg/tehri-lake-993324.webp', itinerary: ['Tehri Lake Water Sports', 'Chamba Market', 'Surkanda Devi Temple'] },
]

const haridwarPrograms = [
  { id: 1, title: 'The Spiritual Classic', img: 'https://cdn.s3waas.gov.in/s33416a75f4cea9109507cacd8e2f2aefc/uploads/bfi_thumb/2019082216-olw83bostxez7pfdluen8vzv6ajj4kp9ypkvffbdze.jpg', itinerary: ['09:00 AM | Mansa Devi Temple: Ropeway morning blessings and city view', '11:30 AM | Chandi Devi Temple: Ancient Shakti Peeth visit via ropeway', '01:30 PM | Lunch at Moti Bazar: Famous street food like Aloo Puri & Kachoris', '03:00 PM | Daksh Mahadev Temple: Historic Shiva temple in Kankhal', '05:30 PM | Har Ki Pauri: Sunset Ganga Aarti experience'] },
  { id: 2, title: 'Culture & Heritage', img: 'https://s7ap1.scene7.com/is/image/incredibleindia/saptrishi-ashram-haridwar-uttarakhand-1-attr-hero?qlt=82&ts=1726645929175', itinerary: ['10:00 AM | Bharat Mata Mandir: Unique 8-story temple for Mother India', '11:30 AM | Pawan Dham: Intricate Glass Temple with mirror work', '01:00 PM | Shantikunj Ashram: Peaceful walk and spiritual exhibits', '03:30 PM | Sapt Rishi Ashram: Seven streams of the Holy Ganga', '06:00 PM | Birla Ghat: Quiet evening by the river'] },
  { id: 3, title: 'Nature & Wildlife (Rajaji Loop)', img: 'https://rajajijunglesafari.com/wp-content/uploads/chilla-5.jpg', itinerary: ['07:00 AM | Chilla Range (Rajaji): Early morning Jungle Safari', '11:00 AM | Neel Dhara Pakshi Vihar: Bird watching near Bhimgoda', '01:00 PM | Lakeside Lunch: Relaxation at a garden restaurant', '03:00 PM | Patanjali Yogpeeth: Massive Yoga and Ayurveda center', '06:30 PM | Haridwar Local Market: Shopping for herbs and handicrafts'] },
  { id: 4, title: 'The Panch Tirth Pilgrimage', img: 'https://www.sterlingholidays.com/activities/haridwar/har-ki-pauri-activity-image.jpg.imgw.1280.1280.jpeg', itinerary: ['08:00 AM | Har Ki Pauri: Holy dip in the Brahma Kund', '10:30 AM | Kushavarta Ghat: Historic rituals and rites site', '12:30 PM | Kankhal: Explore the famous mythological Sati sacrifice site', '03:00 PM | Siddhapeeth Triangle: Mansa Devi & Chandi Devi visits', '06:00 PM | Maya Devi Temple: City\'s presiding deity visit'] },
]

const mussooriePrograms = [
  { id: 1, title: 'Dehradun-Mussoorie Express', img: 'https://i0.wp.com/stampedmoments.com/wp-content/uploads/2025/07/i-love-mussoorie.jpg?fit=1024%2C768&ssl=1', itinerary: ['08:00 AM | Sahastradhara: Sulfur springs and hilltop ropeway', '10:30 AM | Robber\'s Cave: Adventure walk through natural river canyon', '12:30 PM | Prakasheshwar Temple: Famous Shiv Temple visit', '01:30 PM | Mussoorie Lake: Scenic lunch and paddle boating', '03:00 PM | Bhatta Falls: Ropeway descent and natural pools', '05:00 PM | Mall Road: Shopping and sunset at Camel\'s Back Road'] },
  { id: 2, title: 'The Queen of Hills Classic', img: 'https://blog.ecohospitality.in/wp-content/uploads/2024/07/Img-9.jpg', itinerary: ['09:30 AM | Kempty Falls: Morning dip and ropeway ride', '11:30 AM | Company Garden: Botanical walk and lake boating', '01:30 PM | Library Chowk: Local Himalayan cafes and Tibetan food', '03:00 PM | Gun Hill: Ropeway ride to peak for snowy range views', '05:00 PM | Mall Road: Evening stroll and Kulri Bazaar shopping'] },
  { id: 3, title: 'Heritage & High Peaks (Landour)', img: 'https://c.ndtvimg.com/gws/ms/top-places-to-visit-in-mussoorie/assets/2.jpeg?1727874795', itinerary: ['10:00 AM | Landour Bakehouse: Coffee and pastries at British-era bakery', '11:30 AM | Lal Tibba: Binocular viewing of Himalayan peaks', '01:00 PM | Char Dukan: Iconic pancake or Maggi lunch', '03:30 PM | George Everest\'s House: Short trek for 360-degree vistas', '06:00 PM | Cloud\'s End: Sunset walk through dense oak forest'] },
  { id: 4, title: 'Dehradun Nature & Spirit Loop', img: 'https://i0.wp.com/stampedmoments.com/wp-content/uploads/2025/07/gun-hill-mussoorie.jpg?fit=1024%2C768&ssl=1', itinerary: ['10:00 AM | Robber\'s Cave: Adventure walk through the canyon', '12:00 PM | Tapkeshwar Mahadev Temple: Forest cave temple visit', '01:30 PM | Rajpur Road: Lunch at Dehradun\'s main vibrant street', '03:00 PM | Mindrolling Monastery: Tour Grand Stupa and gardens', '05:00 PM | FRI: Photography at the Greco-Roman campus'] },
  { id: 5, title: 'Adventure & Wildlife (Doon Outskirts)', img: 'https://media.assettype.com/outlooktraveller/import/outlooktraveller/public/uploads/articles/explore/files/2015/04/220515121227-Mussorie1.jpg?w=1200&ar=40%3A21&auto=format%2Ccompress&ogImage=true&mode=crop&enlarge=true&overlay=false&overlay_position=bottom&overlay_width=100', itinerary: ['09:30 AM | Sahastradhara: Healing springs and hilltop ropeway', '12:30 PM | Malsi Deer Park: Explore the zoo (Deer, Leopards, Crocodiles)', '02:30 PM | Maldevta / Lachhiwala: Riverside picnic or swim', '05:30 PM | Buddha Temple: Visit 103-foot tall Buddha statue'] },
  { id: 6, title: 'The Clouds & Canyons Adventure', img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/30/9d/e1/a7/caption.jpg?w=1200&h=1200&s=1', itinerary: ['10:30 AM | Dalai Hills: Trek past Tibetan prayer flags to Buddha statue', '12:00 PM | Bhatta Falls: Descend via ropeway to secluded falls', '02:00 PM | Mussoorie Lake: Scenic lunch and quick boat ride', '04:00 PM | Santura Devi Temple: Peaceful hilltop shrine visit', '06:00 PM | Mall Road: Heart of Mussoorie evening stroll'] },
  { id: 7, title: 'Temples, Lakes & Alpine Forests', img: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/12/66/de/a3/beautiful-scenery.jpg?w=800&h=500&s=1', itinerary: ['05:00 AM | Kunjapuri Devi: Sunrise over snow-capped peaks', '09:30 AM | Tehri Lake Adventure: Jet Ski, Speed Boat, and brunch', '12:30 PM | Chamba Market: Local Pahadi market exploration', '02:30 PM | Surkanda Devi (Kanatal): Ropeway to Shakti Peeth (2,750m)'] },
]

const nainitalPrograms = [
  { id: 1, title: 'The Classic Nainital City Tour', img: 'https://i0.wp.com/oneday.tours/wp-content/uploads/one-day-nainital-local-sightseeing-tour-package-thandi-sadak-3.jpg?resize=750%2C400&ssl=1', itinerary: ['Naini Lake', 'Naina Devi Temple', 'Snow View Point', 'Eco Cave Gardens', 'Tiffin Top', 'Tibetan Market', 'Chitai Golu Devta Temple', 'Tiffin Top (Dorothy\'s Seat)'] },
  { id: 2, title: 'Lake District & Spiritual Trail', img: 'https://nainitaltaxi.in/wp-content/uploads/2015/10/sariya-tal-Nainital.jpg', itinerary: ['Kainchi Dham', 'Bhimtal Lake', 'Naukuchiatal', 'Sattal (Seven Lakes)', 'Hanuman Garhi', 'Nainital Mall Road'] },
  { id: 3, title: 'Kainchi Dham & Almora', img: 'https://www.epicyatra.com/wp-content/uploads/2025/01/1680354261299-1024x683.webp', itinerary: ['Kainchi Dham', 'Almora', 'Kasar Devi Temple', 'Katarmal Sun Temple'] },
  { id: 4, title: 'Nainital City Sights', img: 'https://www.bontravelindia.com/wp-content/uploads/2022/08/Best-Places-to-Visit-in-Nainital.jpg', itinerary: ['Naini Lake', 'Naina Devi Temple', 'Hanuman Garhi temple', 'Snow View Point'] },
  { id: 5, title: 'Ashram & Lake District', img: 'https://media-cdn.tripadvisor.com/media/photo-m/1280/14/3f/82/5d/bhimtal-island-aquarium.jpg', itinerary: ['Kainchi Dham (Neem Karoli Baba Ashram)', 'Chitai Golu Devta Temple', 'Bhimtal (Island Aquarium)', 'Forest lakes of Sattal'] },
  { id: 6, title: 'Wildlife Adventure & Spiritual', img: 'https://content.jdmagicbox.com/comp/corbett/a3/9999p5942.5942.191214120957.u3a3/catalogue/jim-corbett-national-park-ramnagar-corbett-wildlife-sanctuary-1loxvqyg6i.jpg', itinerary: ['Jungle Safari', 'Garjiya Devi Temple', 'Shri Hanuman Dham', 'Corbett Fall'] },
  { id: 7, title: 'Ranikhet Military & Orchards', img: 'https://hblimg.mmtcdn.com/content/hubble/img/ranikhet/mmt/activities/m_activities_ranikhet_kumaon_regimental_centre_l_405_640.jpg', itinerary: ['Kumaon Regimental Centre', 'Upat Golf Course', 'Haidakhan Babaji Temple'] },
  { id: 8, title: 'Jageshwar, Bageshwar & Almora', img: 'https://www.chirpinghillsresort.com/wp-content/uploads/2025/05/jageshwar-dham-structures-500x445.jpg', itinerary: ['Almora', 'Jageshwar Dham', 'Kasar Devi Temple', 'Bageshwar Dham'] },
  { id: 9, title: 'Almora & Kausani', img: 'https://www.tourmyindia.com/socialimg/best-of-kaumoan-hills.jpg', itinerary: ['Almora', 'Kasar Devi', 'Sun Temple', 'Someshwar Temple', 'Kausani', 'Baijnath'] },
  { id: 10, title: 'Master Program 01', img: 'https://www.bontravelindia.com/wp-content/uploads/2022/08/Best-Places-to-Visit-in-Nainital.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Ksusani', 'Someshwar', 'Sun Temple', 'Almora', 'Kasar Devi', 'Jageshwar', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
  { id: 11, title: 'Master Program 02', img: 'https://www.chirpinghillsresort.com/wp-content/uploads/2025/05/jageshwar-dham-structures-500x445.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Bageshwar', 'Almora', 'Kasar Devi', 'Jageshwar', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
  { id: 12, title: 'Master Program 03', img: 'https://hblimg.mmtcdn.com/content/hubble/img/ranikhet/mmt/activities/m_activities_ranikhet_kumaon_regimental_centre_l_405_640.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Ksusani', 'Someshwar', 'RaniKhet (Haidakhan Babaji)', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
]

const hillStationTours = [
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

const charDhamTours = [
  { id: 1, title: 'Badrinath Yatra (3 Days)', img: 'https://www.chardham-pilgrimage-tour.com/assets/images/chardham-banner7.webp', itinerary: ['Day 1: Pick up from Haridwar/Rishikesh and drive to Pipalkoti/Joshimath.', 'Day 2: Drive to Badrinath, visit the Temple, Tapt Kund, Mana Village, and overnight stay.', 'Day 3: Return to Rishikesh/Haridwar.'] },
  { id: 2, title: 'Kedarnath Yatra (4 Days)', img: 'https://www.tourtraveltourism.com/images/packages/kedarnath/kedarnath-trip.jpg', itinerary: ['Day 1: Haridwar/Rishikesh to Guptkashi/Sitapur (7-8 hours travel). Check-in and rest.', 'Day 2: Drive to Gaurikund, start 16-20 km trek (or pony/heli) to Kedarnath Temple.', 'Day 3: Attend morning Aarti, trek back down to Gaurikund, and return to Sitapur/Guptkashi.', 'Day 4: Depart from Sitapur/Guptkashi to Haridwar/Rishikesh.'] },
  { id: 3, title: 'Gangotri Yatra (4 Days)', img: 'https://www.chardham-pilgrimage-tour.com/assets/images/gangotri-banner2.webp', itinerary: ['Day 1: Haridwar/Rishikesh to Uttarkashi (190 km/7-8 hrs) via Chamba.', 'Day 2: Drive to Gangotri Temple (3,048m). Darshan, Aarti, and optional Harsil Valley/Gartang Gali visit.', 'Day 3: Visit Vishwanath Temple in Uttarkashi or relax in the surrounding hills.', 'Day 4: Return drive from Uttarkashi to Haridwar/Rishikesh.'] },
  { id: 4, title: 'Yamunotri Yatra (3 Days)', img: 'https://www.sushanttravels.com/uploads/nO26cmz_Yamunotri_1.jpg', itinerary: ['Day 1: Haridwar/Rishikesh to Barkot (160-180 km) via Chamba/Tehri Lake view.', 'Day 2: Barkot to Janki Chatti drive, then 6 km trek to Yamunotri Temple and hot springs.', 'Day 3: Check out from Barkot and drive back to Haridwar/Rishikesh.'] },
  { id: 5, title: 'Do Dham Yatra (7 Days)', img: 'https://yatrakey.com/wp-content/uploads/2025/02/do-dham-yatra-1.jpg', itinerary: ['Day 1: Haridwar/Rishikesh to Guptkashi/Sitapur.', 'Day 2: Trek or Helicopter to Kedarnath. Overnight stay at Kedarnath.', 'Day 3: Trek down and return to Guptkashi.', 'Day 4: Drive from Guptkashi to Badrinath via Joshimath.', 'Day 5: Badrinath Darshan and return to Rudraprayag.', 'Day 6: Return journey to Haridwar/Rishikesh.'] },
  { id: 6, title: 'Char Dham Yatra (10 Days)', img: 'https://www.shrineyatra.in/wp-content/uploads/2024/08/chardham-tour-package.webp', itinerary: ['Day 1: Rishikesh/Dehradun to Barkot', 'Day 2: Barkot - Yamunotri - Barkot (Trek Day)', 'Day 3: Barkot to Uttarkashi', 'Day 4: Uttarkashi - Gangotri - Uttarkashi', 'Day 5: Uttarkashi to Guptkashi', 'Day 6: Guptkashi to Kedarnath (Trek/Heli)', 'Day 7: Kedarnath to Guptkashi', 'Day 8: Guptkashi to Badrinath', 'Day 9: Badrinath to Rudraprayag/Pipalkoti', 'Day 10: Rudraprayag to Rishikesh'] },
]

async function main() {
  console.log('Seeding tour destinations...')

  // Rishikesh
  await prisma.tourDestination.upsert({
    where: { slug: 'rishikesh' },
    update: { programs: JSON.stringify(rishikeshPrograms) },
    create: {
      slug: 'rishikesh',
      name: 'Rishikesh',
      type: 'day-based',
      config: JSON.stringify({ heroImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&q=80', heroTitle: 'Rishikesh Tour Packages', heroSubtitle: 'Explore the Yoga Capital of the World with flexible day-wise programs', heroTag: 'Rishikesh Tours', sectionTitle: 'Choose Your Rishikesh Experience', sectionSubtitle: 'Mix and match programs across 3 days to create your perfect itinerary' }),
      programs: JSON.stringify(rishikeshPrograms),
      dayConfigs: JSON.stringify([{ label: 'Day 1', title: 'Section 1: Day 1 Selection (Select 1)', maxSelect: 1 }, { label: 'Day 2', title: 'Section 2: Day 2 Selection (Select any 2)', maxSelect: 2 }, { label: 'Day 3', title: 'Section 3: Day 3 Selection (Select any 3)', maxSelect: 3 }]),
    },
  })
  console.log('  ✓ Rishikesh')

  // Haridwar
  await prisma.tourDestination.upsert({
    where: { slug: 'haridwar' },
    update: { programs: JSON.stringify(haridwarPrograms) },
    create: {
      slug: 'haridwar',
      name: 'Haridwar',
      type: 'day-based',
      config: JSON.stringify({ heroImage: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=1200&q=80', heroTitle: 'Haridwar Tour Packages', heroSubtitle: 'Experience divine Ganga Aarti and spiritual heritage with flexible programs', heroTag: 'Haridwar Tours', sectionTitle: 'Choose Your Haridwar Experience', sectionSubtitle: 'Mix and match programs across 3 days to create your perfect spiritual journey' }),
      programs: JSON.stringify(haridwarPrograms),
      dayConfigs: JSON.stringify([{ label: 'Day 1', title: 'Section 1: Day 1 Selection (Select 1)', maxSelect: 1 }, { label: 'Day 2', title: 'Section 2: Day 2 Selection (Select any 2)', maxSelect: 2 }, { label: 'Day 3', title: 'Section 3: Day 3 Selection (Select any 3)', maxSelect: 3 }]),
    },
  })
  console.log('  ✓ Haridwar')

  // Mussoorie
  await prisma.tourDestination.upsert({
    where: { slug: 'mussoorie' },
    update: { programs: JSON.stringify(mussooriePrograms) },
    create: {
      slug: 'mussoorie',
      name: 'Mussoorie',
      type: 'day-based',
      config: JSON.stringify({ heroImage: 'https://blog.ecohospitality.in/wp-content/uploads/2024/07/Img-9.jpg', heroTitle: 'Mussoorie & Dehradun Tour Packages', heroSubtitle: 'Explore the Queen of Hills with flexible day-wise programs', heroTag: 'Mussoorie Tours', sectionTitle: 'Choose Your Mussoorie Experience', sectionSubtitle: 'Mix and match programs across 3 days to create your perfect hill station getaway' }),
      programs: JSON.stringify(mussooriePrograms),
      dayConfigs: JSON.stringify([{ label: 'Day 1', title: 'Section 1: Day 1 Selection (Select 1)', maxSelect: 1 }, { label: 'Day 2', title: 'Section 2: Day 2 Selection (Select any 2)', maxSelect: 2 }, { label: 'Day 3', title: 'Section 3: Day 3 Selection (Select any 3)', maxSelect: 3 }]),
    },
  })
  console.log('  ✓ Mussoorie')

  // Nainital
  await prisma.tourDestination.upsert({
    where: { slug: 'nainital' },
    update: { programs: JSON.stringify(nainitalPrograms) },
    create: {
      slug: 'nainital',
      name: 'Nainital',
      type: 'day-based',
      config: JSON.stringify({ heroImage: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80', heroTitle: 'Nainital Tour Packages', heroSubtitle: 'Discover the Lake District of India with flexible day-wise programs and master circuits', heroTag: 'Nainital Tours', sectionTitle: 'Choose Your Nainital Experience', sectionSubtitle: 'Mix and match programs across 3 days, or choose a master circuit for a complete journey' }),
      programs: JSON.stringify(nainitalPrograms),
      dayConfigs: JSON.stringify([{ label: 'Day 1', title: 'Section 1: Day 1 Selection (Select 1)', maxSelect: 1 }, { label: 'Day 2', title: 'Section 2: Day 2 Selection (Select any 2)', maxSelect: 2 }, { label: 'Day 3', title: 'Section 3: Day 3 Selection (Select any 3)', maxSelect: 3 }]),
    },
  })
  console.log('  ✓ Nainital')

  // Hill Stations
  await prisma.tourDestination.upsert({
    where: { slug: 'hill-stations' },
    update: { programs: JSON.stringify(hillStationTours) },
    create: {
      slug: 'hill-stations',
      name: 'Hill Stations',
      type: 'single-select',
      config: JSON.stringify({ heroImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', heroTitle: 'Uttarakhand Hill Stations', heroSubtitle: 'Explore the majestic Himalayan hill stations with curated tour packages', heroTag: 'Hill Stations', sectionTitle: 'Uttarakhand Journey: Select Your Tour Package' }),
      programs: JSON.stringify(hillStationTours),
      dayConfigs: '[]',
    },
  })
  console.log('  ✓ Hill Stations')

  // Char Dham
  await prisma.tourDestination.upsert({
    where: { slug: 'char-dham' },
    update: { programs: JSON.stringify(charDhamTours) },
    create: {
      slug: 'char-dham',
      name: 'Char Dham',
      type: 'single-select',
      config: JSON.stringify({ heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&q=80', heroTitle: 'Char Dham Yatra Packages', heroSubtitle: 'Sacred pilgrimage to the four holy abodes of Uttarakhand', heroTag: 'Char Dham Yatra', sectionTitle: 'Char Dham Yatra: Select Your Pilgrimage Package' }),
      programs: JSON.stringify(charDhamTours),
      dayConfigs: '[]',
    },
  })
  console.log('  ✓ Char Dham')

  // ===== Stay Content =====
  const hotelImages = [
    'https://drive.google.com/uc?export=view&id=1WfJVW2z0lW0P4_m9cvpS31fQ4cHqlTo0',
    'https://drive.google.com/uc?export=view&id=1FxzGGejRREKQiQT078LYyC2YQhakUh-h',
    'https://drive.google.com/uc?export=view&id=1TGfmXkmdPCVpMrCgquFa__PhbPLsgvts',
    'https://drive.google.com/uc?export=view&id=1gFYEOawE_y45HqBg4Jlm6kWx11s-BNkM',
  ]
  const campImages = [
    'https://drive.google.com/uc?export=view&id=1sWB7FLPZRrwHE_Nq6oeonm5DMzpW6s7X',
    'https://drive.google.com/uc?export=view&id=1nGUI8nbGuOE40xoMaDCOWEguz6mCiVBR',
    'https://drive.google.com/uc?export=view&id=1vVAjVXn4SyHnqgX7rcyLxIOHRhnnzVax',
    'https://drive.google.com/uc?export=view&id=1FN8OLXvVq3CfzvUx7stprQbqlHNogG64',
    'https://drive.google.com/uc?export=view&id=1xqeGaMPY6FOPF0CWx8cpYoU8D8n7GAIN',
  ]

  await prisma.stayContent.upsert({
    where: { section: 'hotel' },
    update: {},
    create: {
      section: 'hotel',
      name: 'Hotel Holy Ganga',
      description: 'Riverside comfort in the heart of Rishikesh',
      tag: null,
      rating: 4.0,
      images: JSON.stringify(hotelImages),
      features: JSON.stringify(['Free WiFi', 'Breakfast', 'Parking']),
      pricings: JSON.stringify([
        { label: 'Double Occupancy', sublabel: 'Non-AC Room', price: '1800', unit: '', highlighted: false },
        { label: 'Double Occupancy', sublabel: 'AC Room', price: '2200', unit: '', highlighted: true },
      ]),
    },
  })

  await prisma.stayContent.upsert({
    where: { section: 'camping' },
    update: {},
    create: {
      section: 'camping',
      name: 'Camping by the Ganges',
      description: 'Bonfire, river views & starry nights',
      tag: 'Riverside Camping',
      rating: 4.5,
      images: JSON.stringify(campImages),
      features: JSON.stringify(['Bonfire', 'River View', 'Stargazing', 'Meals Included']),
      pricings: JSON.stringify([
        { label: 'Double Sharing', sublabel: '2 persons per tent', price: '1800', unit: '/pp', highlighted: false },
        { label: 'Triple Sharing', sublabel: '3 persons per tent', price: '1600', unit: '/pp', highlighted: true },
        { label: 'Quad Sharing', sublabel: '4 persons per tent', price: '1400', unit: '/pp', highlighted: false },
      ]),
    },
  })

  // ===== Hotel Packages =====
  const hotels = [
    { name: 'Hotel Holy Ganga', slug: 'holy-ganga', tagline: 'Riverside Comfort', subtitle: 'Premium Riverside Hotel', description: 'Experience true riverside living at Hotel Holy Ganga. Located in the heart of Rishikesh, this hotel offers stunning Ganga views, modern amenities, and warm hospitality.', price: 2200, image: 'https://drive.google.com/thumbnail?id=1WfJVW2z0lW0P4_m9cvpS31fQ4cHqlTo0&sz=w800', images: JSON.stringify(hotelImages.map(u => u.replace('uc?export=view', 'thumbnail').replace('id=', 'id=') + '&sz=w800')), category: 'stay-hotel', duration: '1 Night', location: 'Rishikesh', rating: 4.0, reviewCount: 12, badge: 'Most Popular', badgeColor: 'bg-brand-orange', gradient: 'from-brand-orange/80 to-amber-600/80', featured: true, active: true },
    { name: 'The Grand Heritage', slug: 'grand-heritage', tagline: 'Luxury Living', subtitle: 'Heritage Hotel', description: 'A luxurious heritage hotel combining traditional architecture with modern comforts. Featuring a rooftop restaurant with panoramic views, spa services, and elegantly appointed rooms.', price: 3500, image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', images: '[]', category: 'stay-hotel', duration: '1 Night', location: 'Rishikesh', rating: 4.5, reviewCount: 8, badge: 'Premium', badgeColor: 'bg-brand-gold', gradient: 'from-brand-gold/80 to-amber-700/80', featured: false, active: true },
    { name: 'River View Inn', slug: 'river-view-inn', tagline: 'Budget Friendly', subtitle: 'Economy Stay', description: 'Clean, comfortable, and affordable accommodation with direct Ganga river views. Ideal for backpackers and budget-conscious travelers.', price: 1200, image: 'https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?w=800&q=80', images: '[]', category: 'stay-hotel', duration: '1 Night', location: 'Rishikesh', rating: 3.8, reviewCount: 15, badge: null, badgeColor: 'bg-brand-teal', gradient: 'from-brand-teal/80 to-emerald-600/80', featured: false, active: true },
  ]
  for (const h of hotels) {
    await prisma.package.upsert({ where: { slug: h.slug }, update: h, create: h })
    console.log('  hotel:', h.name)
  }

  // ===== Camping Packages =====
  const camps = [
    { name: 'Riverside Camping Deluxe', slug: 'riverside-camping', tagline: 'Bonfire & River Views', subtitle: 'Premium Riverside Camping', description: 'Experience the magic of camping by the Ganges. Enjoy a bonfire under the stars, sleep in comfortable tents with river views, and wake up to the sound of flowing water.', price: 1800, image: 'https://drive.google.com/thumbnail?id=1sWB7FLPZRrwHE_Nq6oeonm5DMzpW6s7X&sz=w800', images: JSON.stringify(campImages.map(u => u.replace('uc?export=view', 'thumbnail') + '&sz=w800')), category: 'stay-camping', duration: '1 Night', location: 'Rishikesh Riverside', rating: 4.7, reviewCount: 25, badge: 'Most Popular', badgeColor: 'bg-brand-orange', gradient: 'from-brand-orange/80 to-amber-600/80', featured: true, active: true },
    { name: 'Luxury Glamping Tent', slug: 'luxury-glamping', tagline: 'Camp in Style', subtitle: 'Luxury Glamping', description: 'Glamping at its finest! Spacious safari-style tents with real beds, attached washrooms, and premium furnishings. Enjoy gourmet meals and bonfire.', price: 3500, image: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80', images: '[]', category: 'stay-camping', duration: '1 Night', location: 'Rishikesh', rating: 4.9, reviewCount: 10, badge: 'Premium', badgeColor: 'bg-brand-gold', gradient: 'from-brand-gold/80 to-amber-700/80', featured: false, active: true },
    { name: 'Group Camping Adventure', slug: 'group-camping', tagline: 'Best for Groups', subtitle: 'Group Package', description: 'Perfect for groups! Special group pricing with team activities, river games, bonfire with music, and all meals included. Minimum 10 persons.', price: 1400, image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80', images: '[]', category: 'stay-camping', duration: '1 Night', location: 'Rishikesh', rating: 4.5, reviewCount: 18, badge: 'Group Offer', badgeColor: 'bg-brand-teal', gradient: 'from-brand-teal/80 to-emerald-600/80', featured: false, active: true },
  ]
  for (const c of camps) {
    await prisma.package.upsert({ where: { slug: c.slug }, update: c, create: c })
    console.log('  camping:', c.name)
  }

  console.log('Tour seeding complete!')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
