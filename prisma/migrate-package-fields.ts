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
  const columns = [
    'routeLength TEXT DEFAULT ""',
    'maxAltitude TEXT DEFAULT ""',
    'baseCamp TEXT DEFAULT ""',
    'pickupPoint TEXT DEFAULT ""',
    'suitableFor TEXT DEFAULT ""',
    'experience TEXT DEFAULT ""',
    'fitness TEXT DEFAULT ""',
    'bestSeason TEXT DEFAULT ""',
    'gstRate INTEGER DEFAULT 5',
    'itinerary TEXT DEFAULT "[]"',
    'thingsToCarry TEXT DEFAULT "[]"',
    'howToReach TEXT DEFAULT "[]"',
    'importantInfo TEXT DEFAULT ""',
    'fixedDepartures TEXT DEFAULT "[]"',
  ]

  for (const col of columns) {
    const colName = col.split(' ')[0]
    try {
      const exists = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
        `SELECT name FROM pragma_table_info('Package') WHERE name = ?`,
        colName,
      )
      if (exists.length > 0) {
        console.log(`✓ ${colName} already exists`)
      } else {
        await prisma.$executeRawUnsafe(`ALTER TABLE Package ADD COLUMN ${col}`)
        console.log(`+ Added ${colName}`)
      }
    } catch (e) {
      console.error(`x Failed ${colName}:`, e instanceof Error ? e.message : e)
    }
  }

  await prisma.$disconnect()
}

main()
