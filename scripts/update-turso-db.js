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

  console.log('Updating Package images in DB...');

  // 1. Ayodhya
  await prisma.package.updateMany({
    where: { name: { contains: 'Ayodhya' } },
    data: { image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800' },
  });

  // 2. Ujjain
  await prisma.package.updateMany({
    where: { name: { contains: 'Ujjain' } },
    data: { image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800' },
  });

  // 3. TVS NTORQ
  await prisma.package.updateMany({
    where: { name: { contains: 'NTORQ' } },
    data: { image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800' },
  });

  // 4. Kedarkantha
  await prisma.package.updateMany({
    where: { name: { contains: 'Kedarkantha' } },
    data: { image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800' },
  });

  // 5. Singapore Tour
  await prisma.package.updateMany({
    where: { name: { contains: 'Singapore' } },
    data: { image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800' },
  });

  // 6. Domestic Tours
  await prisma.package.updateMany({
    where: { slug: 'kashmir-tour' },
    data: { image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'himachal-tour' },
    data: { image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'ladakh-tour' },
    data: { image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'andhra-pradesh-tour' },
    data: { image: 'https://images.unsplash.com/photo-1582653291997-079a1c04e5a1?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'assam-tour' },
    data: { image: 'https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'meghalaya-tour' },
    data: { image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'west-bengal-tour' },
    data: { image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'rajasthan-tour' },
    data: { image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'gujarat-tour' },
    data: { image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'maharashtra-tour' },
    data: { image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'goa-tour' },
    data: { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800' },
  });
  await prisma.package.updateMany({
    where: { slug: 'madhya-pradesh-tour' },
    data: { image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800' },
  });

  // Destinations
  console.log('Updating Destination images in DB...');
  await prisma.destination.updateMany({
    where: { name: 'Jaipur' },
    data: { image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=800' },
  });
  await prisma.destination.updateMany({
    where: { name: 'Goa' },
    data: { image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800' },
  });
  await prisma.destination.updateMany({
    where: { name: 'Manali' },
    data: { image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=800' },
  });
  await prisma.destination.updateMany({
    where: { name: 'Ladakh' },
    data: { image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?q=80&w=800' },
  });
  await prisma.destination.updateMany({
    where: { name: 'Kashmir' },
    data: { image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?q=80&w=800' },
  });

  // Clean Package Images array in DB
  const pkgs = await prisma.package.findMany({ select: { id: true, name: true, images: true } });
  for (const p of pkgs) {
    if (!p.images) continue;
    let g = [];
    try {
      g = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
    } catch {
      continue;
    }
    if (!Array.isArray(g)) continue;

    let changed = false;
    const cleaned = g.map(url => {
      if (typeof url !== 'string') return url;
      if (url.includes('divinetravels.in/wp-content') || url.includes('photo-1597432538819') || url.includes('photo-1589636755490') || url.includes('photo-1608797173416') || url.includes('photo-1602211843912') || url.includes('photo-1566936737687') || url.includes('photo-1598897998980') || url.includes('photo-1567153796950') || url.includes('photo-1477587458883') || url.includes('photo-1618073170573') || url.includes('photo-1512343879784') || url.includes('photo-1602179400078') || url.includes('photo-1569433819547')) {
        changed = true;
        return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800';
      }
      if (url.includes('enlivetrips.com')) {
        changed = true;
        return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800';
      }
      return url;
    });

    if (changed) {
      await prisma.package.update({
        where: { id: p.id },
        data: { images: JSON.stringify(cleaned) },
      });
      console.log(`Updated images for package ${p.name}`);
    }
  }

  await prisma.$disconnect();
  console.log('All DB image updates successfully completed!');
}

main().catch(console.error);
