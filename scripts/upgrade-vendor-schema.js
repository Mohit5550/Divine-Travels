const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'c:/Users/MSI 1/Desktop/Divine travels1/Divine travels/Divine-Travels/.env' });

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  console.log('Upgrading VendorPartner and VendorItem schemas in Turso LibSQL...');

  // Add columns to VendorPartner if not exist
  const partnerCols = [
    `ALTER TABLE "VendorPartner" ADD COLUMN "password" TEXT;`,
    `ALTER TABLE "VendorPartner" ADD COLUMN "panNumber" TEXT;`,
    `ALTER TABLE "VendorPartner" ADD COLUMN "gstDocUrl" TEXT;`,
    `ALTER TABLE "VendorPartner" ADD COLUMN "panDocUrl" TEXT;`,
    `ALTER TABLE "VendorPartner" ADD COLUMN "agreementDocUrl" TEXT;`,
    `ALTER TABLE "VendorPartner" ADD COLUMN "advancePercentage" INTEGER DEFAULT 20;`,
  ];

  for (const sql of partnerCols) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('Executed:', sql);
    } catch (e) {
      // Column may already exist
    }
  }

  // Add columns to VendorItem if not exist
  const itemCols = [
    `ALTER TABLE "VendorItem" ADD COLUMN "mrpPrice" INTEGER DEFAULT 0;`,
    `ALTER TABLE "VendorItem" ADD COLUMN "highlights" TEXT;`,
    `ALTER TABLE "VendorItem" ADD COLUMN "inclusions" TEXT;`,
    `ALTER TABLE "VendorItem" ADD COLUMN "exclusions" TEXT;`,
    `ALTER TABLE "VendorItem" ADD COLUMN "eligibility" TEXT;`,
    `ALTER TABLE "VendorItem" ADD COLUMN "advancePercentage" INTEGER DEFAULT 20;`,
    `ALTER TABLE "VendorItem" ADD COLUMN "timeSlots" TEXT;`,
    `ALTER TABLE "VendorItem" ADD COLUMN "pickupLocation" TEXT;`,
    `ALTER TABLE "VendorItem" ADD COLUMN "spotLocation" TEXT;`,
  ];

  for (const sql of itemCols) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('Executed:', sql);
    } catch (e) {
      // Column may already exist
    }
  }

  console.log('Database upgrade completed successfully!');
  await prisma.$disconnect();
}

main().catch(console.error);
