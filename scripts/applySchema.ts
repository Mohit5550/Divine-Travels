import fs from 'fs'

const env = fs.readFileSync('.env', 'utf8')
for (const line of env.split('\n')) {
  const m = line.match(/^\s*([A-Z_]+)="?([^"]*)"?\s*$/)
  if (m) process.env[m[1]] = m[2]
}

async function main() {
  const { db } = await import('../src/lib/db')

  const stmts = [
    `CREATE TABLE IF NOT EXISTS BookingOffer (
      id TEXT PRIMARY KEY,
      bookingType TEXT NOT NULL,
      bookingId TEXT NOT NULL,
      offeredBy TEXT NOT NULL,
      amount INTEGER NOT NULL,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt DATETIME NOT NULL DEFAULT current_timestamp,
      updatedAt DATETIME NOT NULL DEFAULT current_timestamp
    )`,
    `CREATE TABLE IF NOT EXISTS PaymentReceipt (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bookingType TEXT NOT NULL,
      bookingId TEXT NOT NULL,
      amount INTEGER NOT NULL,
      method TEXT NOT NULL DEFAULT 'online',
      type TEXT NOT NULL DEFAULT 'balance',
      txnId TEXT,
      addedBy TEXT NOT NULL DEFAULT 'user',
      note TEXT,
      status TEXT NOT NULL DEFAULT 'completed',
      createdAt DATETIME NOT NULL DEFAULT current_timestamp
    )`,
    `ALTER TABLE Booking ADD COLUMN negotiatedPrice INTEGER`,
    `ALTER TABLE Booking ADD COLUMN priceLocked BOOLEAN NOT NULL DEFAULT 0`,
    `ALTER TABLE PackageBooking ADD COLUMN negotiatedPrice INTEGER`,
    `ALTER TABLE PackageBooking ADD COLUMN priceLocked BOOLEAN NOT NULL DEFAULT 0`,
    `ALTER TABLE TourBooking ADD COLUMN itinerary TEXT`,
    `ALTER TABLE TourBooking ADD COLUMN days INTEGER`,
    `ALTER TABLE TourBooking ADD COLUMN note TEXT`,
    `ALTER TABLE TourBooking ADD COLUMN negotiatedPrice INTEGER`,
    `ALTER TABLE TourBooking ADD COLUMN priceLocked BOOLEAN NOT NULL DEFAULT 0`,
    `ALTER TABLE TourBooking ADD COLUMN totalPrice INTEGER`,
  ]

  for (const s of stmts) {
    try {
      await db.$executeRawUnsafe(s)
      console.log('OK:', s.slice(0, 60))
    } catch (e: any) {
      console.log('SKIP:', s.slice(0, 60), '->', String(e?.message || e).split('\n')[0])
    }
  }

  await db.$disconnect()
  console.log('MIGRATION DONE')
}

main()
