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
  // Create the GalleryImage table directly (libsql/Turso doesn't run prisma db push on Windows)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS GalleryImage (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT,
      alt TEXT,
      category TEXT,
      featured INTEGER NOT NULL DEFAULT 0,
      "order" INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
  console.log('GalleryImage table created')

  // Seed all 16 images - first 5 will be featured (for the homepage)
  const images = [
    { url: '/gallery/img-01.jpg', title: 'Mountain Trekking Adventure', category: 'Trekking', featured: true, order: 1 },
    { url: '/gallery/img-02.jpg', title: 'Campfire Bonfire Night', category: 'Camping', featured: true, order: 2 },
    { url: '/gallery/img-03.jpg', title: 'Desert Safari Drive', category: 'Adventure', featured: true, order: 3 },
    { url: '/gallery/img-04.jpg', title: 'Acacia Tree at Sunset', category: 'Sightseeing', featured: true, order: 4 },
    { url: '/gallery/img-05.jpg', title: 'Luxury Resort Stay', category: 'Stay', featured: true, order: 5 },
    { url: '/gallery/img-06.jpg', title: 'Adventure Moments', category: 'Adventure', featured: false, order: 6 },
    { url: '/gallery/img-07.jpg', title: 'Group Travel Experience', category: 'Travel', featured: false, order: 7 },
    { url: '/gallery/img-08.jpg', title: 'Memorable Journeys', category: 'Travel', featured: false, order: 8 },
    { url: '/gallery/img-09.jpg', title: 'Explore the Wild', category: 'Adventure', featured: false, order: 9 },
    { url: '/gallery/img-10.jpg', title: 'Spiritual Journey', category: 'Spiritual', featured: false, order: 10 },
    { url: '/gallery/img-11.jpg', title: 'Mountain Vista', category: 'Trekking', featured: false, order: 11 },
    { url: '/gallery/img-12.jpg', title: 'Riverside Camping', category: 'Camping', featured: false, order: 12 },
    { url: '/gallery/img-13.jpg', title: 'Evening Bonfire', category: 'Camping', featured: false, order: 13 },
    { url: '/gallery/img-14.jpg', title: 'Himalayan Sunset', category: 'Sightseeing', featured: false, order: 14 },
    { url: '/gallery/img-15.jpg', title: 'Adventure Sports', category: 'Adventure', featured: false, order: 15 },
    { url: '/gallery/img-16.jpg', title: 'Travel Memories', category: 'Travel', featured: false, order: 16 },
  ]

  // Check if already seeded
  const existing = await prisma.galleryImage.count()
  if (existing > 0) {
    console.log(`GalleryImage already has ${existing} records, skipping seed.`)
  } else {
    for (const img of images) {
      const id = `gal_${Math.random().toString(36).slice(2, 12)}`
      await prisma.$executeRawUnsafe(
        `INSERT INTO GalleryImage (id, url, title, alt, category, featured, "order", active, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        id, img.url, img.title, img.title, img.category, img.featured ? 1 : 0, img.order,
      )
    }
    console.log(`Seeded ${images.length} gallery images (${images.filter((i) => i.featured).length} featured)`)
  }

  // Show what's in the table
  const all = await prisma.galleryImage.findMany({ orderBy: { order: 'asc' } })
  console.log(`Total: ${all.length} images`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
