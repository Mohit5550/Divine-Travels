const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'c:/Users/MSI 1/Desktop/Divine travels1/Divine travels/Divine-Travels/.env' });

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  console.log('Creating VendorItem table in Turso LibSQL database...');

  const sql = `
    CREATE TABLE IF NOT EXISTS "VendorItem" (
      "id" TEXT PRIMARY KEY,
      "vendorId" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "b2bBasePrice" INTEGER NOT NULL DEFAULT 0,
      "sellingPrice" INTEGER NOT NULL DEFAULT 0,
      "capacity" TEXT,
      "amenities" TEXT,
      "specifications" TEXT,
      "photos" TEXT,
      "description" TEXT,
      "status" TEXT NOT NULL DEFAULT 'active',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await prisma.$executeRawUnsafe(sql);
  console.log('VendorItem table created successfully!');

  // Migrate existing VendorPartner initial listing as their first item if empty
  const vendors = await prisma.$queryRawUnsafe(`SELECT * FROM "VendorPartner"`);
  for (const v of vendors) {
    const existing = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorItem" WHERE "vendorId" = ?`, v.id);
    if (Number(existing[0]?.c || 0) === 0) {
      const itemId = 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      await prisma.$executeRawUnsafe(`
        INSERT INTO "VendorItem" (
          "id", "vendorId", "category", "title", "b2bBasePrice", "sellingPrice",
          "capacity", "amenities", "specifications", "photos", "description", "status"
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, 'active'
        )
      `,
        itemId,
        v.id,
        v.businessCategory,
        v.listingTitle,
        v.b2bBasePrice || 0,
        v.sellingPrice || 0,
        v.capacity || null,
        v.amenities || '[]',
        v.specifications || '{}',
        v.photos || '[]',
        v.description || null
      );
      console.log(`Migrated initial item for vendor: ${v.businessName}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
