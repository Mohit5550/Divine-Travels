const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
require('dotenv').config({ path: 'c:/Users/MSI 1/Desktop/Divine travels1/Divine travels/Divine-Travels/.env' });

async function main() {
  console.log('Connecting to database...');
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  const prisma = new PrismaClient({ adapter });

  console.log('Updating stayContent records in DB...');

  const hotelImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=800',
  ];

  const campingImages = [
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800',
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800',
    'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=800',
    'https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?q=80&w=800',
  ];

  await prisma.stayContent.updateMany({
    where: { section: 'hotel' },
    data: {
      images: JSON.stringify(hotelImages),
    },
  });

  await prisma.stayContent.updateMany({
    where: { section: 'camping' },
    data: {
      images: JSON.stringify(campingImages),
    },
  });

  // Also update any Package with category 'stay-hotel' or 'stay-camping' or 'hotel' or 'camping'
  await prisma.package.updateMany({
    where: { category: 'stay-hotel' },
    data: {
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
      images: JSON.stringify(hotelImages),
    },
  });

  await prisma.package.updateMany({
    where: { category: 'stay-camping' },
    data: {
      image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800',
      images: JSON.stringify(campingImages),
    },
  });

  console.log('StayContent updated in DB successfully!');
  await prisma.$disconnect();
}

main().catch(console.error);
