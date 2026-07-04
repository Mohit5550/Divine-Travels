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
  // Find hotel packages
  const hotels = await prisma.package.findMany({
    where: { category: 'stay-hotel' },
    select: { id: true, name: true, slug: true },
  })
  console.log(`Found ${hotels.length} hotel packages`)

  if (hotels.length === 0) {
    console.log('No hotel packages found. Creating one...')
  }

  const hotelData = {
    propertyType: 'resort',
    highlights: JSON.stringify([
      '6,500 ft elevation with Doon Valley views',
      'Colonial heritage architecture',
      'Infinity swimming pool',
      'Nature trails across the property',
      'Close to Mall Road Mussoorie',
      'Bonfire evenings in winter',
    ]),
    amenities: JSON.stringify([
      { icon: 'wifi', name: 'Free WiFi' },
      { icon: 'restaurant', name: 'Restaurant' },
      { icon: 'bar', name: 'Bar' },
      { icon: 'spa', name: 'Spa' },
      { icon: 'gym', name: 'Gym' },
      { icon: 'parking', name: 'Parking' },
      { icon: 'traveldesk', name: 'Travel Desk' },
      { icon: 'roomservice', name: 'Room Service' },
      { icon: 'conference', name: 'Conference Hall' },
      { icon: 'bonfire', name: 'Bonfire Area' },
    ]),
    roomTypes: JSON.stringify([
      { name: 'Deluxe Room', price: 5800, plan: 'EP', guests: 2, bed: 'Queen Bed', size: '300 sq ft' },
      { name: 'Super Deluxe Room', price: 7500, plan: 'EP', guests: 2, bed: 'King Bed', size: '400 sq ft' },
      { name: 'Premium Suite', price: 11000, plan: 'EP', guests: 2, bed: 'King Bed', size: '550 sq ft' },
      { name: 'Family Suite', price: 13500, plan: 'EP', guests: 4, bed: '2 Queen Beds', size: '650 sq ft' },
    ]),
    mealPlans: JSON.stringify([
      { name: 'EP', description: 'Room only', price: 0 },
      { name: 'CP', description: 'Room + breakfast', price: 700 },
      { name: 'MAP', description: 'Room + breakfast + dinner', price: 1800 },
    ]),
    inclusions: JSON.stringify([
      'Complimentary breakfast (with CP/MAP plans)',
      'Free WiFi in all rooms',
      'Air conditioning or heating available',
      '24/7 front desk and room service',
      'Free parking for guests',
      'River view rooms available',
      'Laundry and housekeeping services',
    ]),
    howToReach: JSON.stringify([
      'Nearest airport: Jolly Grant, Dehradun (35 km)',
      'Nearest railway: Dehradun (36 km)',
      'Taxi/bus to Mussoorie available',
    ]),
    cancellationPolicy: 'Check-in: 2:00 PM | Check-out: 12:00 PM. Valid ID required. Peak season rates apply Oct-Mar. Cancellation: Free up to 72 hours before check-in.',
    images: JSON.stringify([
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80',
    ]),
  }

  if (hotels.length > 0) {
    // Update first hotel with demo data
    const target = hotels[0]
    await prisma.package.update({
      where: { id: target.id },
      data: hotelData,
    })
    console.log(`✓ Updated hotel: ${target.name} (${target.slug})`)
  } else {
    // Create a demo hotel package
    const created = await prisma.package.create({
      data: {
        name: 'Maulik Mansion Resort Jim Corbett',
        slug: 'maulik-mansion-resort-jim-corbett',
        tagline: 'Where East meets West',
        subtitle: 'A heritage hillside hotel perched at 6,500 ft in the Queen of Hills',
        description: 'Experience the charm and tranquility of the Maulik Mansion Resort Jim Corbett, a perfect getaway nestled in the heart of nature. Our resort offers a serene escape from the hustle and bustle of daily life, where you can relax and rejuvenate in the lap of nature. Our rooms are designed to provide comfort and elegance, ensuring that every moment of your stay is memorable.',
        price: 5500,
        originalPrice: 6000,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        category: 'stay-hotel',
        location: 'Jim Corbett, Uttarakhand',
        duration: 'Per Night',
        badge: 'Premium Resort',
        badgeColor: 'bg-amber-600',
        rating: 4.7,
        reviewCount: 21,
        featured: true,
        ...hotelData,
      },
    })
    console.log(`✓ Created hotel: ${created.name}`)
  }

  // Also update all other hotel packages with basic amenities if they don't have any
  for (const h of hotels.slice(1)) {
    const pkg = await prisma.package.findUnique({ where: { id: h.id }, select: { amenities: true, roomTypes: true } })
    if ((!pkg?.amenities || pkg.amenities === '[]') && (!pkg?.roomTypes || pkg.roomTypes === '[]')) {
      await prisma.package.update({
        where: { id: h.id },
        data: {
          amenities: hotelData.amenities,
          roomTypes: hotelData.roomTypes,
          mealPlans: hotelData.mealPlans,
          highlights: hotelData.highlights,
          howToReach: hotelData.howToReach,
          cancellationPolicy: hotelData.cancellationPolicy,
          inclusions: hotelData.inclusions,
          images: hotelData.images,
        },
      })
      console.log(`✓ Updated hotel: ${h.name}`)
    }
  }

  await prisma.$disconnect()
  console.log('\nDone!')
}

main()
