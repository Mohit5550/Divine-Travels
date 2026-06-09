import { db } from '../src/lib/db'

async function migrate() {
  console.log('Starting availability price migration...')

  const count = await db.$executeRawUnsafe(`SELECT COUNT(*) FROM DateAvailability`)
  console.log('Current records:', count)

  try {
    await db.$executeRawUnsafe(`ALTER TABLE DateAvailability ADD COLUMN dateTo TEXT`)
    console.log('✓ Added dateTo column')
  } catch (e) {
    console.log('dateTo column may already exist:', e)
  }

  try {
    await db.$executeRawUnsafe(`ALTER TABLE DateAvailability ADD COLUMN price INTEGER`)
    console.log('✓ Added price column')
  } catch (e) {
    console.log('price column may already exist:', e)
  }

  try {
    await db.$executeRawUnsafe(`ALTER TABLE DateAvailability ADD COLUMN slots INTEGER`)
    console.log('✓ Added slots column')
  } catch (e) {
    console.log('slots column may already exist:', e)
  }

  // Remove unique constraint by recreating table
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS DateAvailability_new (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        date TEXT NOT NULL,
        dateTo TEXT,
        service TEXT NOT NULL,
        subOptions TEXT NOT NULL DEFAULT '[]',
        allDay INTEGER NOT NULL DEFAULT 0,
        price INTEGER,
        slots INTEGER,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    console.log('✓ Created new table')

    await db.$executeRawUnsafe(`
      INSERT INTO DateAvailability_new (id, date, dateTo, service, subOptions, allDay, price, slots, createdAt, updatedAt)
      SELECT id, date, dateTo, service, subOptions, allDay, price, slots, createdAt, updatedAt FROM DateAvailability
    `)
    console.log('✓ Copied data')

    await db.$executeRawUnsafe(`DROP TABLE DateAvailability`)
    console.log('✓ Dropped old table')

    await db.$executeRawUnsafe(`ALTER TABLE DateAvailability_new RENAME TO DateAvailability`)
    console.log('✓ Renamed table')
  } catch (e) {
    console.log('Table recreation error:', e)
  }

  console.log('Migration complete!')
}

migrate().catch(console.error)
