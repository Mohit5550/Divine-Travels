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
  try {
    const tables = await prisma.$queryRawUnsafe("SELECT name FROM sqlite_master WHERE type='table'")
    console.log('Tables:', JSON.stringify(tables, null, 2))

    const count = await prisma.galleryImage.count()
    console.log('GalleryImage count:', count)
  } catch (e) {
    console.error('Error:', e)
  }
  await prisma.$disconnect()
}

main()
