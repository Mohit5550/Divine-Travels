import { db } from '../src/lib/db'

async function migrate() {
  console.log('Starting booking price-snapshot migration...')

  try {
    await db.$executeRawUnsafe(`ALTER TABLE PackageBooking ADD COLUMN originalPrice INTEGER`)
    console.log('✓ Added originalPrice column')
  } catch (e: any) {
    console.log('originalPrice may already exist:', e?.message || e)
  }

  try {
    await db.$executeRawUnsafe(`ALTER TABLE PackageBooking ADD COLUMN basePrice INTEGER`)
    console.log('✓ Added basePrice column')
  } catch (e: any) {
    console.log('basePrice may already exist:', e?.message || e)
  }

  try {
    await db.$executeRawUnsafe(`ALTER TABLE PackageBooking ADD COLUMN unitPrice INTEGER`)
    console.log('✓ Added unitPrice column')
  } catch (e: any) {
    console.log('unitPrice may already exist:', e?.message || e)
  }

  // Backfill: for existing bookings, derive snapshots from the package relation
  try {
    const result: any[] = await db.$queryRawUnsafe(`
      SELECT pb.id, pb."totalPrice", pb."discountAmount", pb."numberOfPeople",
             p."price" AS pkg_price, p."originalPrice" AS pkg_original
      FROM PackageBooking pb
      LEFT JOIN Package p ON p.id = pb."packageId"
      WHERE pb."unitPrice" IS NULL
    `)
    console.log(`Found ${result.length} bookings to backfill`)

    for (const b of result) {
      const base = typeof b.pkg_price === 'number' ? b.pkg_price : (b.totalPrice || 0)
      const original = typeof b.pkg_original === 'number' ? b.pkg_original : null
      await db.$executeRawUnsafe(
        `UPDATE PackageBooking SET "basePrice" = ?, "originalPrice" = ?, "unitPrice" = ? WHERE id = ?`,
        base,
        original,
        base,
        b.id
      )
    }
    console.log('✓ Backfilled snapshots from package data')
  } catch (e: any) {
    console.log('Backfill error (non-fatal):', e?.message || e)
  }

  console.log('Migration complete!')
}

migrate().catch((e) => {
  console.error(e)
  process.exit(1)
})
