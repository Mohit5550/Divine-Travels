const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'c:/Users/MSI 1/Desktop/Divine travels1/Divine travels/Divine-Travels/.env' });

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  console.log('Adding new columns to Coupon table...');

  const columns = [
    `ALTER TABLE "Coupon" ADD COLUMN "type" TEXT DEFAULT 'public';`,
    `ALTER TABLE "Coupon" ADD COLUMN "isPrivate" BOOLEAN DEFAULT 0;`,
    `ALTER TABLE "Coupon" ADD COLUMN "applicableCategory" TEXT;`,
    `ALTER TABLE "Coupon" ADD COLUMN "userEligibility" TEXT DEFAULT 'all';`,
    `ALTER TABLE "Coupon" ADD COLUMN "creatorName" TEXT;`,
  ];

  for (const sql of columns) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('Executed:', sql);
    } catch (e) {
      console.log('Column might already exist:', e.message);
    }
  }

  // Update existing creator coupons so they are marked as private/influencer
  console.log('Updating existing creator coupons to private...');
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE "Coupon"
      SET "type" = 'influencer', "isPrivate" = 1
      WHERE "description" LIKE '%Creator Collab%' OR "description" LIKE '%Affiliate%';
    `);
  } catch (e) {
    console.log('Update note:', e.message);
  }

  console.log('Coupon columns updated successfully in Turso database!');
  await prisma.$disconnect();
}

main().catch(console.error);
