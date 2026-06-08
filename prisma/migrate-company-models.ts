import { db } from '../src/lib/db'

async function migrate() {
  console.log('Starting company models migration...')

  // Create Company table
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Company (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        logo TEXT,
        description TEXT,
        website TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    console.log('✓ Company table created')
  } catch (e) {
    console.log('Company table may already exist:', e)
  }

  // Add photo column if not exists
  try {
    await db.$executeRawUnsafe(`ALTER TABLE Company ADD COLUMN photo TEXT`)
    console.log('✓ Added photo column to Company')
  } catch (e) {
    console.log('Photo column may already exist:', e)
  }

  // Create CompanyPlan table
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS CompanyPlan (
        id TEXT PRIMARY KEY NOT NULL DEFAULT (lower(hex(randomblob(16)))),
        companyId TEXT NOT NULL REFERENCES Company(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        price INTEGER,
        image TEXT,
        category TEXT,
        duration TEXT,
        highlights TEXT,
        active INTEGER NOT NULL DEFAULT 1,
        "order" INTEGER NOT NULL DEFAULT 0,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)
    console.log('✓ CompanyPlan table created')
  } catch (e) {
    console.log('CompanyPlan table may already exist:', e)
  }

  console.log('Migration complete!')
}

migrate()
  .catch(console.error)
  .finally(() => process.exit(0))
