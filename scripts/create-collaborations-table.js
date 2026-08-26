const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'c:/Users/MSI 1/Desktop/Divine travels1/Divine travels/Divine-Travels/.env' });

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  console.log('Creating CreatorCollaboration table in Turso DB if not exists...');
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CreatorCollaboration" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "instagram" TEXT,
      "youtube" TEXT,
      "followersCount" TEXT NOT NULL,
      "niche" TEXT NOT NULL,
      "collaborationType" TEXT NOT NULL,
      "deliverables" TEXT,
      "travelDates" TEXT,
      "message" TEXT,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "assignedCoupon" TEXT,
      "commissionPct" INTEGER DEFAULT 10,
      "adminNotes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('CreatorCollaboration table ready in database!');
  await prisma.$disconnect();
}

main().catch(console.error);
