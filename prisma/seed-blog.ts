import * as dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const cat1 = await prisma.blogCategory.upsert({
    where: { slug: 'travel-guides' },
    update: {},
    create: { name: 'Travel Guides', slug: 'travel-guides', description: 'Detailed guides for traveling across Uttarakhand and beyond.' },
  })
  console.log('✓ Travel Guides category')
  const cat2 = await prisma.blogCategory.upsert({
    where: { slug: 'adventure-stories' },
    update: {},
    create: { name: 'Adventure Stories', slug: 'adventure-stories', description: 'Thrilling tales from the mountains, rivers, and trails.' },
  })
  console.log('✓ Adventure Stories category')
  const cat3 = await prisma.blogCategory.upsert({
    where: { slug: 'spiritual-journeys' },
    update: {},
    create: { name: 'Spiritual Journeys', slug: 'spiritual-journeys', description: 'Explore the sacred temples, ghats, and pilgrimages of India.' },
  })
  console.log('✓ Spiritual Journeys category')
  const cat4 = await prisma.blogCategory.upsert({
    where: { slug: 'tips-tricks' },
    update: {},
    create: { name: 'Tips & Tricks', slug: 'tips-tricks', description: 'Practical advice to make your travel smoother and more enjoyable.' },
  })
  console.log('✓ Tips & Tricks category')

  const now = new Date()

  const posts = [
    {
      title: 'White Water Rafting in Rishikesh: The Ultimate Guide',
      slug: 'white-water-rafting-rishikesh-guide',
      content: `<p>Rishikesh, the Yoga Capital of the World, is also India's undisputed rafting capital. The Ganges river offers some of the most exhilarating rapids ranging from Grade I to Grade IV+.</p>
<h2>Best Time for Rafting</h2>
<p>The rafting season in Rishikesh typically runs from September to June. The monsoon months (July-August) see river closures due to safety concerns. The best months are October-November and March-April when the weather is pleasant and water levels are ideal.</p>
<h2>Popular Rafting Stretches</h2>
<h3>1. 16 km Stretch (Shivpuri to Rishikesh)</h3>
<p>The most popular stretch featuring rapids like Roller Coaster, Golf Course, and Cliffhanger. Perfect for beginners and intermediate rafters.</p>
<h3>2. 26 km Stretch (Marine Drive to Rishikesh)</h3>
<p>For those seeking more adventure, this longer stretch includes bigger rapids and stunning riverside scenery.</p>
<h3>3. 36 km Stretch (Kaudiyala to Rishikesh)</h3>
<p>The ultimate challenge with Grade IV rapids like The Wall and Daniel's Dip. Recommended for experienced rafters only.</p>
<h2>What to Expect</h2>
<p>Your rafting trip typically includes safety briefing, life jacket and helmet, professional guide, and around 2-3 hours on the river. Most packages include cliff jumping, body surfing, and photography.</p>
<h2>Safety Tips</h2>
<ul><li>Always wear a life jacket and helmet</li><li>Listen carefully to your guide's instructions</li><li>Don't raft under the influence of alcohol</li><li>Choose a registered and reputable operator</li><li>Carry a change of clothes and towel</li></ul>
<p>Book your Rishikesh rafting adventure with Divine Travels for the safest and most memorable experience on the Ganges!</p>`,
      excerpt: 'Everything you need to know about white water rafting in Rishikesh — best time, popular stretches, safety tips, and what to expect on the river.',
      featuredImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
      tags: JSON.stringify(['rafting', 'rishikesh', 'adventure', 'water-sports', 'uttarakhand']),
      categoryId: cat1.id,
      author: 'Divine Travels',
      published: true,
      publishedAt: new Date(now.getTime() - 1 * 86400000),
    },
    {
      title: 'Exploring the Char Dham Yatra: A Spiritual Pilgrimage',
      slug: 'char-dham-yatra-spiritual-pilgrimage',
      content: `<p>The Char Dham Yatra — Yamunotri, Gangotri, Kedarnath, and Badrinath — is one of the most sacred pilgrimages in Hinduism. Nestled in the Garhwal Himalayas of Uttarakhand, each temple holds immense spiritual significance.</p>
<h2>Yamunotri</h2>
<p>The source of the Yamuna River, Yamunotri is the first stop. The temple is dedicated to Goddess Yamuna and sits at an altitude of 3,293 meters. The hot spring at Surya Kund is a must-visit.</p>
<h2>Gangotri</h2>
<p>Gangotri, at 3,100 meters, marks the origin of the Ganges River. The temple dedicated to Goddess Ganga was built by the Gorkha General Amar Singh Thapa in the 18th century.</p>
<h2>Kedarnath</h2>
<p>One of the 12 Jyotirlingas, Kedarnath Temple at 3,583 meters is the most challenging stop. The temple is believed to have been built by the Pandavas and later revived by Adi Shankaracharya.</p>
<h2>Badrinath</h2>
<p>The final stop, Badrinath at 3,300 meters, is dedicated to Lord Vishnu. The Badrinath Temple is part of the Char Dham and also one of the 108 Divya Desams.</p>
<h2>Planning Your Yatra</h2>
<p>The Yatra typically opens in May and closes in October/November depending on weather. Helicopter services are available for those with limited time. Book your Char Dham Yatra package with Divine Travels for a hassle-free spiritual journey.</p>`,
      excerpt: 'Discover the sacred Char Dham Yatra of Uttarakhand — Yamunotri, Gangotri, Kedarnath, and Badrinath. A complete guide to India\'s most revered pilgrimage.',
      featuredImage: 'https://images.unsplash.com/photo-1566837945700-30057527ade0?w=800&q=80',
      tags: JSON.stringify(['char-dham', 'pilgrimage', 'spiritual', 'kedarnath', 'badrinath']),
      categoryId: cat3.id,
      author: 'Divine Travels',
      published: true,
      publishedAt: new Date(now.getTime() - 3 * 86400000),
    },
    {
      title: 'Top 10 Trekking Trails in Uttarakhand for Beginners',
      slug: 'top-10-trekking-trails-uttarakhand-beginners',
      content: `<p>Uttarakhand, known as Devbhumi (Land of the Gods), is a paradise for trekkers. From gentle meadow walks to challenging mountain ascents, here are the top 10 beginner-friendly trekking trails.</p>
<h2>1. Valley of Flowers Trek</h2>
<p>A UNESCO World Heritage Site, this 4-5 day trek takes you through a stunning valley of alpine flowers. Best time: July to September.</p>
<h2>2. Nag Tibba Trek</h2>
<p>The "Serpent's Peak" near Mussoorie offers panoramic views of the Himalayan range. A perfect weekend trek at just 3,050 meters.</p>
<h2>3. Chopta Chandrashila Trek</h2>
<p>Often called the "Mini Switzerland of India," Chopta offers breathtaking views of Nanda Devi, Trishul, and Chaukhamba peaks.</p>
<h2>4. Har Ki Dun Trek</h2>
<p>The "Valley of Gods" is a beautiful valley surrounded by snow-capped peaks. The trail passes through traditional villages and pine forests.</p>
<h2>5. Kheerganga Trek</h2>
<p>Located in Himachal but easily accessible from Uttarakhand, this trek ends at natural hot water springs — a perfect reward after the climb.</p>
<h2>Essential Tips for Beginners</h2>
<ul><li>Start with shorter, lower altitude treks</li><li>Invest in good quality trekking shoes</li><li>Carry sufficient water and high-energy snacks</li><li>Always trek with a guide or group</li><li>Acclimatize properly to avoid altitude sickness</li></ul>
<p>Browse our trekking packages at Divine Travels and embark on your first Himalayan adventure!</p>`,
      excerpt: 'Planning your first Himalayan trek? Here are 10 beginner-friendly trails in Uttarakhand with essential tips for a safe and memorable experience.',
      featuredImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
      tags: JSON.stringify(['trekking', 'himalayas', 'beginners', 'uttarakhand', 'adventure']),
      categoryId: cat2.id,
      author: 'Divine Travels',
      published: true,
      publishedAt: new Date(now.getTime() - 5 * 86400000),
    },
    {
      title: '10 Essential Tips for First-Time Visitors to Rishikesh',
      slug: 'essential-tips-first-time-rishikesh-visitors',
      content: `<p>Planning your first trip to Rishikesh? Whether you're coming for yoga, adventure, or spirituality, these tips will help you make the most of your visit.</p>
<h2>1. Best Time to Visit</h2>
<p>September to November and March to May offer the best weather. Avoid July-August (monsoon) and December-January (very cold).</p>
<h2>2. Getting There</h2>
<p>The nearest airport is Dehradun's Jolly Grant Airport (35 km). Rishikesh railway station connects to major cities. Regular buses run from Delhi (6-7 hours) and Dehradun (1 hour).</p>
<h2>3. What to Pack</h2>
<p>Comfortable cotton clothes, a light jacket (evenings get cool), comfortable walking shoes, sunscreen, insect repellent, and a reusable water bottle.</p>
<h2>4. Where to Stay</h2>
<p>From budget hostels to luxury resorts, Rishikesh has it all. The best areas are Tapovan (close to cafes and the Beatles Ashram) and Laxman Jhula (serene riverside vibe).</p>
<h2>5. Food & Water</h2>
<p>Rishikesh is a vegetarian city by law in the holy areas. Try the local North Indian cuisine, but stick to bottled or filtered water.</p>
<h2>6. Respect Local Customs</h2>
<p>Dress modestly when visiting temples. Remove shoes before entering religious places. Avoid alcohol and non-vegetarian food in the holy precincts.</p>
<h2>7. Adventure Activities</h2>
<p>Book all adventure activities (rafting, bungee, camping) through registered operators only. Divine Travels offers the safest and most affordable packages.</p>
<h2>8. Stay Connected</h2>
<p>Mobile connectivity is excellent in Rishikesh town but may be patchy in surrounding areas. Most cafes and hotels offer WiFi.</p>
<h2>9. Bargaining</h2>
<p>Bargaining is common in local markets. Street food is safe but choose busy vendors with high turnover.</p>
<h2>10. Travel Insurance</h2>
<p>Always carry travel insurance that covers adventure activities. This is non-negotiable for rafting, bungee jumping, and trekking.</p>`,
      excerpt: 'Planning your first Rishikesh trip? From packing tips to local customs, here are 10 essential things every first-time visitor should know.',
      featuredImage: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=800&q=80',
      tags: JSON.stringify(['rishikesh', 'travel-tips', 'beginners', 'uttarakhand', 'travel-guide']),
      categoryId: cat4.id,
      author: 'Divine Travels',
      published: true,
      publishedAt: new Date(now.getTime() - 7 * 86400000),
    },
    {
      title: 'Camping by the Ganges: A Night Under the Stars in Rishikesh',
      slug: 'camping-by-ganges-rishikesh-night-under-stars',
      content: `<p>Imagine falling asleep to the soothing sound of the Ganges river and waking up to birds chirping and the majestic Himalayan sunrise. Camping in Rishikesh is an experience like no other.</p>
<h2>Why Camp in Rishikesh?</h2>
<p>Rishikesh offers some of the best riverside camping experiences in India. The combination of pristine beaches, dense forests, and the sacred Ganges creates an unforgettable atmosphere.</p>
<h2>Types of Camps</h2>
<h3>Riverside Camps</h3>
<p>Pitched on sandy beaches along the Ganges, these camps offer basic to luxury accommodations. Most include tents, sleeping bags, campfire, and meals.</p>
<h3>Luxury Glamping</h3>
<p>For those who want comfort without sacrificing nature, glamping sites offer Swiss tents with attached bathrooms, comfortable beds, and gourmet meals.</p>
<h3>Adventure Camps</h3>
<p>Combine camping with activities like rafting, kayaking, rock climbing, and trekking. These camps are perfect for adventure enthusiasts.</p>
<h2>What's Included</h2>
<p>Most camping packages include: tent accommodation, all meals (breakfast, lunch, dinner), evening campfire with music, guided nature walks, and basic adventure activities.</p>
<h2>Best Camping Spots</h2>
<ul><li>Shivpuri — The most popular area with excellent beaches</li><li>Byasi — Quieter and more secluded</li><li>Neer Garh Waterfall — Camp near a stunning waterfall</li><li>Phool Chatti — Riverside camping with spiritual vibe</li></ul>
<h2>Pro Tips</h2>
<p>Carry warm clothes even in summer (nights get cold). Bring a torch/flashlight, power bank, and mosquito repellent. Book in advance during peak season (October-November, March-May).</p>
<p>Check out Divine Travels' camping packages for the best riverside camping experience in Rishikesh!</p>`,
      excerpt: 'Experience the magic of camping by the Ganges in Rishikesh. From riverside tents to luxury glamping, here\'s everything you need to know.',
      featuredImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      tags: JSON.stringify(['camping', 'rishikesh', 'ganges', 'nature', 'weekend-getaway']),
      categoryId: cat1.id,
      author: 'Divine Travels',
      published: true,
      publishedAt: new Date(now.getTime() - 10 * 86400000),
    },
  ]

  for (const p of posts) {
    await prisma.blog.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
    console.log(`✓ Post: ${p.title}`)
  }

  await prisma.$disconnect()
  console.log('\nDone! 5 blog posts seeded.')
}

main()
