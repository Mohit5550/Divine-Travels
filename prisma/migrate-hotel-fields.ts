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
    'propertyType TEXT DEFAULT ""',
    'amenities TEXT DEFAULT "[]"',
    'roomTypes TEXT DEFAULT "[]"',
    'mealPlans TEXT DEFAULT "[]"',
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
  console.log('Done!')
}

main()
