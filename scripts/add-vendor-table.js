const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: 'c:/Users/MSI 1/Desktop/Divine travels1/Divine travels/Divine-Travels/.env' });

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  console.log('Creating VendorPartner table in Turso LibSQL database...');

  const sql = `
    CREATE TABLE IF NOT EXISTS "VendorPartner" (
      "id" TEXT PRIMARY KEY,
      "businessName" TEXT NOT NULL,
      "ownerName" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "city" TEXT NOT NULL DEFAULT 'Rishikesh',
      "businessCategory" TEXT NOT NULL DEFAULT 'camping',
      "gstNumber" TEXT,
      "experienceYears" TEXT,
      "bankUpi" TEXT,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "commissionPct" INTEGER NOT NULL DEFAULT 15,
      "adminNotes" TEXT,
      
      -- Listing details
      "listingTitle" TEXT NOT NULL,
      "location" TEXT NOT NULL,
      "b2bBasePrice" INTEGER NOT NULL DEFAULT 0,
      "sellingPrice" INTEGER NOT NULL DEFAULT 0,
      "capacity" TEXT,
      "amenities" TEXT,
      "photos" TEXT,
      "description" TEXT,
      "specifications" TEXT,
      
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await prisma.$executeRawUnsafe(sql);
  console.log('VendorPartner table created successfully!');

  // Seed 1 verified demonstration vendor if empty
  const count = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "VendorPartner"`);
  const total = Number(count[0]?.count || 0);

  if (total === 0) {
    console.log('Seeding demo vendor application...');
    const demoId = 'vendor_' + Date.now().toString(36);
    const seedSql = `
      INSERT INTO "VendorPartner" (
        "id", "businessName", "ownerName", "phone", "email", "city",
        "businessCategory", "gstNumber", "experienceYears", "bankUpi",
        "status", "commissionPct", "adminNotes", "listingTitle", "location",
        "b2bBasePrice", "sellingPrice", "capacity", "amenities", "photos",
        "description", "specifications", "createdAt", "updatedAt"
      ) VALUES (
        '${demoId}',
        'Ganga Serenity Luxury Riverside Camp',
        'Virendra Singh Rawat',
        '9876543210',
        'gangaserenity@gmail.com',
        'Shivpuri, Rishikesh',
        'camping',
        '05AAAAA0000A1Z5',
        '6 Years',
        'gangaserenity@okaxis',
        'pending',
        15,
        'Property verified on call. Prime riverside location with swimming pool.',
        'Luxury AC Swiss Cottages with River Ganga View & Bonfire',
        'Near Shivpuri Bridge, Badrinath Highway, Rishikesh',
        1800,
        2250,
        '25 Swiss Tents (100 Pax Capacity)',
        '["Swimming Pool", "Attached Washroom", "Bonfire with Music", "Buffet Dinner & Breakfast", "River Access", "Free Parking", "AC/Geyser"]',
        '["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80"]',
        'Experience luxury Swiss tent stay right beside the holy river Ganga. Features swimming pool, live music evenings, and traditional Garhwali food buffet.',
        '{"tentType":"Luxury Swiss AC Tent","mealsIncluded":"Breakfast, Evening Snacks, Buffet Dinner","checkIn":"12:00 PM","checkOut":"10:00 AM","poolAccess":true,"distanceFromRiver":"50 meters"}',
        DATETIME('now'),
        DATETIME('now')
      );
    `;
    await prisma.$executeRawUnsafe(seedSql);
    console.log('Demo vendor seeded!');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
