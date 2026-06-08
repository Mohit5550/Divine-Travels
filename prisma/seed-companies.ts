import { db } from '../src/lib/db'

const companies = [
  {
    name: 'Himalayan Bungy',
    slug: 'himalayan-bungy',
    logo: '/partners/partner-new.png',
    photo: '/gallery/img-01.jpg',
    description: 'India\'s premier bungy jumping destination with world-class safety standards and breathtaking views.',
    plans: [
      { name: "India's Highest Bungy Jump", category: 'Bungee', duration: '1 Session', highlights: '["83 meters","India\'s highest","Certified instructors"]', packageSlug: 'indias-highest-bungy' },
      { name: "Highest Free Style Bungy Jump", category: 'Bungee', duration: '1 Session', packageSlug: 'free-style-bungy' },
      { name: 'Giant Swing - 113 Mtrs', category: 'Swing', duration: '1 Session', packageSlug: 'giant-swing-113' },
      { name: "India's Premium Giant Swing - 140 Feet", category: 'Swing', duration: '1 Session', packageSlug: 'premium-giant-swing-140' },
    ],
  },
  {
    name: 'Hikers Adventure Park',
    slug: 'hikers-adventure-park',
    logo: '',
    photo: '/gallery/img-02.jpg',
    description: 'Adventure park with thrilling rides and activities for all ages.',
    plans: [
      { name: 'Go-Kart', category: 'Go Karting', duration: '1 Session', packageSlug: 'go-kart-rishikesh' },
      { name: 'Sky Roller', category: 'Roller', duration: '1 Session', packageSlug: 'sky-roller-rishikesh' },
      { name: 'Roller Coaster Zipline', category: 'Zipline', duration: '1 Session', packageSlug: 'roller-coaster-zipline' },
    ],
  },
  {
    name: 'Thrill Factory',
    slug: 'thrill-factory',
    logo: '',
    photo: '/gallery/img-03.jpg',
    description: 'One of the leading adventure companies in Rishikesh offering extreme sports experiences.',
    plans: [
      { name: 'Bungee Jump - 180 Feet', category: 'Bungee', duration: '1 Session', highlights: '["180 feet","Professional gear","Safety certified"]', packageSlug: 'bungee-180-feet' },
      { name: 'Splash Bungee - 180 Feet', category: 'Bungee', duration: '1 Session', packageSlug: 'splash-bungee-180' },
      { name: 'Free Style Bungee - 160 Feet', category: 'Bungee', duration: '1 Session', packageSlug: 'free-style-bungee-160' },
      { name: 'Splash / Bungee Jump - 180 Feet', category: 'Bungee', duration: '1 Session', packageSlug: 'couple-bungee-jump' },
      { name: 'Rope Bungee - 160 Feet', category: 'Bungee', duration: '1 Session', packageSlug: 'rope-bungee-160' },
      { name: 'Zipline | Across The Ganga', category: 'Zipline', duration: '1 Session', packageSlug: 'zipline-across-ganga' },
      { name: 'Quick Jump', category: 'Jump', duration: '1 Session', packageSlug: 'quick-jump-rishikesh' },
      { name: "Reverse Bungee | India's Only (From Italy)", category: 'Bungee', duration: '1 Session', packageSlug: 'reverse-bungee-india' },
      { name: 'Rope Course', category: 'Rope', duration: '1 Session', packageSlug: 'rope-course-rishikesh' },
    ],
  },
  {
    name: 'Tehri Lake Adventure Sports',
    slug: 'tehri-lake-adventure-sports',
    logo: '',
    photo: '/gallery/img-04.jpg',
    description: 'Water sports and adventure activities at the beautiful Tehri Lake.',
    plans: [
      { name: 'FLYBOARD & JETOVATOR', category: 'Water Sports', duration: '15-20 Mins', packageSlug: 'flyboard-jetovator-tehri' },
      { name: 'Speed Boat Ride', category: 'Water Sports', duration: '15-20 Mins', packageSlug: 'speed-boat-tehri' },
      { name: 'Bumper Ride', category: 'Water Sports', duration: '15-20 Mins', packageSlug: 'bumper-ride-tehri' },
      { name: 'Banana Ride', category: 'Water Sports', duration: '15-20 Mins', packageSlug: 'banana-ride-tehri' },
      { name: 'Water Surfing', category: 'Water Sports', duration: '30 Mins', packageSlug: 'water-surfing-tehri' },
      { name: 'Jet Ski', category: 'Water Sports', duration: '15-20 Mins', packageSlug: 'jet-ski-tehri' },
      { name: 'Parasailing | Per Fly', category: 'Parasailing', duration: '1 Session', packageSlug: 'parasailing-tehri' },
    ],
  },
  {
    name: 'Tehri Lake Paragliding',
    slug: 'tehri-lake-paragliding',
    logo: '',
    photo: '/gallery/img-05.jpg',
    description: 'Experience the thrill of paragliding over the stunning Tehri Lake.',
    plans: [
      { name: 'Lake View Paragliding | Per Fly', category: 'Paragliding', duration: '1 Session', packageSlug: 'lake-view-paragliding' },
    ],
  },
  {
    name: 'Why Not Fly',
    slug: 'why-not-fly',
    logo: '',
    photo: '/gallery/img-06.jpg',
    description: 'Professional paragliding services in Rishikesh with experienced pilots.',
    plans: [
      { name: 'Rishikesh Paragliding | Per Fly', category: 'Paragliding', duration: '1 Session', packageSlug: 'rishikesh-paragliding' },
    ],
  },
  {
    name: 'Jumping Heights',
    slug: 'jumping-heights',
    logo: '',
    photo: '/gallery/img-07.jpg',
    description: 'Premium adventure sports company offering flying fox and other thrilling activities.',
    plans: [
      { name: 'Flying Fox | Solo / Tandem or Triple Ride', category: 'Flying Fox', duration: '1 Session', packageSlug: 'flying-fox-rishikesh' },
    ],
  },
]

async function seed() {
  console.log('Seeding companies and plans...')

  for (const c of companies) {
    // Check if company already exists
    const existing = await db.company.findUnique({ where: { slug: c.slug } })
    if (existing) {
      console.log(`  ↻ Skipping "${c.name}" (already exists)`)
      continue
    }

    const company = await db.company.create({
      data: {
        name: c.name,
        slug: c.slug,
        logo: c.logo || null,
        photo: c.photo || null,
        description: c.description || null,
        active: true,
        order: 0,
        plans: {
          create: c.plans.map((p, i) => ({
            name: p.name,
            category: p.category || null,
            duration: p.duration || null,
            highlights: p.highlights || null,
            packageSlug: p.packageSlug || null,
            active: true,
            order: i,
          })),
        },
      },
    })
    console.log(`  ✓ Created "${company.name}" with ${c.plans.length} plans`)
  }

  console.log('Seeding complete!')
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0))
