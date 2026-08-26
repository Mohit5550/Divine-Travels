const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'c:/Users/MSI 1/Desktop/Divine travels1/Divine travels/Divine-Travels/.env' });

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  console.log('Adding new columns to CreatorCollaboration table if not existing...');
  
  const columns = [
    'ALTER TABLE "CreatorCollaboration" ADD COLUMN "selectedFreeActivity" TEXT;',
    'ALTER TABLE "CreatorCollaboration" ADD COLUMN "expectedBudget" TEXT;',
    'ALTER TABLE "CreatorCollaboration" ADD COLUMN "proposedCoupon" TEXT;',
  ];

  for (const sql of columns) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('Executed:', sql);
    } catch (e) {
      console.log('Column might already exist:', e.message);
    }
  }

  console.log('CreatorCollaboration columns updated in Turso database!');
  await prisma.$disconnect();
}

main().catch(console.error);
