import { db } from '../src/lib/db'

const companies = [
  {
    name: 'Himalayan Bungy',
    slug: 'himalayan-bungy',
    logo: '/partners/partner-new.png',
    description: 'India\'s premier bungy jumping destination with world-class safety standards and breathtaking views.',
    plans: [
      { name: "India's Highest Bungy Jump", category: 'Bungee', duration: '1 Session', highlights: '["83 meters","India\'s highest","Certified instructors"]' },
      { name: "Highest Free Style Bungy Jump", category: 'Bungee', duration: '1 Session' },
      { name: 'Giant Swing - 113 Mtrs', category: 'Swing', duration: '1 Session' },
      { name: "India's Premium Giant Swing - 140 Feet", category: 'Swing', duration: '1 Session' },
    ],
  },
  {
    name: 'Hikers Adventure Park',
    slug: 'hikers-adventure-park',
    logo: '',
    description: 'Adventure park with thrilling rides and activities for all ages.',
    plans: [
      { name: 'Go-Kart', category: 'Go Karting', duration: '1 Session' },
      { name: 'Sky Roller', category: 'Roller', duration: '1 Session' },
      { name: 'Roller Coaster Zipline', category: 'Zipline', duration: '1 Session' },
    ],
  },
  {
    name: 'Thrill Factory',
    slug: 'thrill-factory',
    logo: '',
    description: 'One of the leading adventure companies in Rishikesh offering extreme sports experiences.',
    plans: [
      { name: 'Bungee Jump - 180 Feet', category: 'Bungee', duration: '1 Session', highlights: '["180 feet","Professional gear","Safety certified"]' },
      { name: 'Splash Bungee - 180 Feet', category: 'Bungee', duration: '1 Session' },
      { name: 'Free Style Bungee - 160 Feet', category: 'Bungee', duration: '1 Session' },
      { name: 'Splash / Bungee Jump - 180 Feet', category: 'Bungee', duration: '1 Session' },
      { name: 'Rope Bungee - 160 Feet', category: 'Bungee', duration: '1 Session' },
      { name: 'Zipline | Across The Ganga', category: 'Zipline', duration: '1 Session' },
      { name: 'Quick Jump', category: 'Jump', duration: '1 Session' },
      { name: "Reverse Bungee | India's Only (From Italy)", category: 'Bungee', duration: '1 Session' },
      { name: 'Rope Course', category: 'Rope', duration: '1 Session' },
    ],
  },
  {
    name: 'Tehri Lake Adventure Sports',
    slug: 'tehri-lake-adventure-sports',
    logo: '',
    description: 'Water sports and adventure activities at the beautiful Tehri Lake.',
    plans: [
      { name: 'FLYBOARD & JETOVATOR', category: 'Water Sports', duration: '15-20 Mins' },
      { name: 'Speed Boat Ride', category: 'Water Sports', duration: '15-20 Mins' },
      { name: 'Bumper Ride', category: 'Water Sports', duration: '15-20 Mins' },
      { name: 'Banana Ride', category: 'Water Sports', duration: '15-20 Mins' },
      { name: 'Water Surfing', category: 'Water Sports', duration: '30 Mins' },
      { name: 'Jet Ski', category: 'Water Sports', duration: '15-20 Mins' },
      { name: 'Parasailing | Per Fly', category: 'Parasailing', duration: '1 Session' },
    ],
  },
  {
    name: 'Tehri Lake Paragliding',
    slug: 'tehri-lake-paragliding',
    logo: '',
    description: 'Experience the thrill of paragliding over the stunning Tehri Lake.',
    plans: [
      { name: 'Lake View Paragliding | Per Fly', category: 'Paragliding', duration: '1 Session' },
    ],
  },
  {
    name: 'Why Not Fly',
    slug: 'why-not-fly',
    logo: '',
    description: 'Professional paragliding services in Rishikesh with experienced pilots.',
    plans: [
      { name: 'Rishikesh Paragliding | Per Fly', category: 'Paragliding', duration: '1 Session' },
    ],
  },
  {
    name: 'Jumping Heights',
    slug: 'jumping-heights',
    logo: '',
    description: 'Premium adventure sports company offering flying fox and other thrilling activities.',
    plans: [
      { name: 'Flying Fox | Solo / Tandem or Triple Ride', category: 'Flying Fox', duration: '1 Session' },
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
        description: c.description || null,
        active: true,
        order: 0,
        plans: {
          create: c.plans.map((p, i) => ({
            name: p.name,
            category: p.category || null,
            duration: p.duration || null,
            highlights: p.highlights || null,
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
