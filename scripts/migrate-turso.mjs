import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

async function migrate() {
  const statements = [
    "ALTER TABLE HeroNotice ADD COLUMN link TEXT;",
    "ALTER TABLE TourBooking ADD COLUMN userId TEXT;",
    "CREATE INDEX IF NOT EXISTS idx_tour_booking_userId ON TourBooking(userId);",
  ]

  for (const sql of statements) {
    try {
      await client.execute(sql)
      console.log(`✓ ${sql}`)
    } catch (e) {
      if (e.message?.includes('duplicate column') || e.message?.includes('already exists')) {
        console.log(`~ already applied: ${sql}`)
      } else {
        console.log(`✗ ${sql}: ${e.message}`)
      }
    }
  }

  console.log('Migration complete')
  process.exit(0)
}

migrate().catch((e) => { console.error(e); process.exit(1) })
