import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.wishlist.deleteMany()
  await prisma.review.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.destination.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@divinetravel.com',
      name: 'Admin',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
    },
  })

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'user@test.com',
      name: 'Rahul Patel',
      password: 'user123',
      role: 'user',
      phone: '+91 9123456789',
    },
  })

  // Create destinations
  const rishikesh = await prisma.destination.create({
    data: {
      name: 'Rishikesh',
      tagline: 'Devbhoomi of Nature & Adventure',
      description: 'Nestled in the foothills of the Himalayas along the sacred Ganges, Rishikesh is a haven for adventure seekers and spiritual enthusiasts alike. Experience white-water rafting, bungee jumping, yoga ashrams, and the mesmerizing Ganga Aarti. This divine city offers the perfect blend of thrill and tranquility, making it one of the most sought-after destinations in Uttarakhand.',
      state: 'Uttarakhand',
      category: 'adventure rafting spiritual trekking domestic',
      price: 1999,
      rating: 4.9,
      reviewCount: 324,
      image: 'https://picsum.photos/seed/rishikesh-ganga-rafting/600/750',
      badge: 'Trending',
      badgeColor: 'white',
      tags: 'Rafting,Yoga,Bungee',
      featured: true,
    },
  })

  const haridwar = await prisma.destination.create({
    data: {
      name: 'Haridwar',
      tagline: 'Gateway to the Gods & Spiritual Bliss',
      description: 'Haridwar, meaning "Gateway to God," is one of the seven holiest places in Hinduism. The evening Ganga Aarti at Har Ki Pauri is a spectacle that draws thousands. Visit ancient temples, take a holy dip in the Ganges, and immerse yourself in the spiritual energy of this sacred city. Haridwar is also the gateway to the Char Dham Yatra.',
      state: 'Uttarakhand',
      category: 'spiritual domestic hotel custom',
      price: 999,
      rating: 4.7,
      reviewCount: 256,
      image: 'https://picsum.photos/seed/haridwar-ghat-aarti/600/750',
      badge: 'Spiritual',
      badgeColor: 'orange',
      tags: 'Ganga Aarti,Temples',
      featured: true,
    },
  })

  const mussoorie = await prisma.destination.create({
    data: {
      name: 'Mussoorie',
      tagline: 'The Queen of Hills & Misty Charm',
      description: 'Perched at an altitude of 2,005 meters, Mussoorie is a charming hill station that has captivated visitors for centuries. Stroll along Mall Road, trek to Gun Hill, visit Kempty Falls, or simply enjoy the breathtaking views of the Doon Valley and snow-capped Himalayas. The misty charm of this queen of hills is truly unforgettable.',
      state: 'Uttarakhand',
      category: 'trekking domestic hotel bike',
      price: 2299,
      rating: 4.6,
      reviewCount: 198,
      image: 'https://picsum.photos/seed/mussoorie-hilltown-mist/600/750',
      badge: 'Hill Station',
      badgeColor: 'green',
      tags: 'Trekking,Resorts',
      featured: true,
    },
  })

  const nainital = await prisma.destination.create({
    data: {
      name: 'Nainital',
      tagline: 'The Lake District of India & Serene Beauty',
      description: 'Set around the beautiful Naini Lake, Nainital is a picturesque hill station known for its serene lakes, lush greenery, and pleasant weather. Enjoy boating on the lake, trek to Naina Peak, explore the vibrant Tibetan Market, or visit the famous Naina Devi Temple. Nainital is the perfect getaway for nature lovers.',
      state: 'Uttarakhand',
      category: 'domestic hotel trekking bike',
      price: 1899,
      rating: 4.5,
      reviewCount: 167,
      image: 'https://picsum.photos/seed/nainital-lake-boat/600/750',
      badge: 'Lake City',
      badgeColor: 'blue',
      tags: 'Boating,Resorts',
      featured: false,
    },
  })

  const auli = await prisma.destination.create({
    data: {
      name: 'Auli',
      tagline: 'Snow-Capped Peaks & Skiing Paradise',
      description: 'Auli is India\'s premier skiing destination, surrounded by towering peaks and oak forests. The Auli Ropeway, one of the longest in Asia, offers stunning panoramic views. Whether you\'re skiing down pristine slopes in winter or trekking through bugyal meadows in summer, Auli promises an experience like no other.',
      state: 'Uttarakhand',
      category: 'adventure trekking domestic hotel skiing',
      price: 3499,
      rating: 4.8,
      reviewCount: 142,
      image: 'https://picsum.photos/seed/auli-snow-mountain-ski/600/750',
      badge: 'Hill Station',
      badgeColor: 'sky',
      tags: 'Skiing,Ropeway',
      featured: true,
    },
  })

  const charDham = await prisma.destination.create({
    data: {
      name: 'Char Dham',
      tagline: 'Sacred Pilgrimage to the Four Abodes of Divinity',
      description: 'The Char Dham Yatra — comprising Yamunotri, Gangotri, Kedarnath, and Badrinath — is the most sacred pilgrimage circuit in Hinduism. Journey through breathtaking Himalayan landscapes to these ancient shrines, each offering divine blessings and spiritual liberation. This pilgrimage is believed to cleanse the soul and lead to moksha.',
      state: 'Uttarakhand',
      category: 'spiritual domestic trekking custom hotel',
      price: 8999,
      rating: 4.9,
      reviewCount: 289,
      image: 'https://picsum.photos/seed/char-dham-temple-mountain/600/750',
      badge: 'Pilgrimage',
      badgeColor: 'amber',
      tags: 'Yatra,Trek',
      featured: true,
    },
  })

  // Create sample reviews
  await prisma.review.createMany({
    data: [
      {
        userId: user.id,
        destinationId: rishikesh.id,
        rating: 5,
        comment: 'Absolutely divine experience! The rafting was thrilling and the Ganga Aarti was soul-stirring. A must-visit for every traveler.',
      },
      {
        userId: user.id,
        destinationId: haridwar.id,
        rating: 4,
        comment: 'The spiritual energy of Haridwar is unmatched. Ganga Aarti at Har Ki Pauri is a mesmerizing experience that stays with you forever.',
      },
      {
        userId: user.id,
        destinationId: auli.id,
        rating: 5,
        comment: 'Skiing in Auli was a dream come true! The ropeway ride offers breathtaking views. Perfect destination for adventure lovers.',
      },
    ],
  })

  // Create sample bookings for the test user
  await prisma.booking.createMany({
    data: [
      {
        userId: user.id,
        destinationId: rishikesh.id,
        checkIn: new Date('2025-06-15'),
        checkOut: new Date('2025-06-18'),
        guests: 2,
        totalPrice: 5997,
        status: 'confirmed',
        paymentStatus: 'paid',
        phone: '+91 9123456789',
      },
      {
        userId: user.id,
        destinationId: mussoorie.id,
        checkIn: new Date('2025-07-01'),
        checkOut: new Date('2025-07-04'),
        guests: 3,
        totalPrice: 6897,
        status: 'pending',
        paymentStatus: 'pending',
        phone: '+91 9123456789',
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log(`Admin: admin@divinetravel.com / admin123`)
  console.log(`User: user@test.com / user123`)
  console.log(`6 destinations, 3 reviews, 2 bookings created`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
