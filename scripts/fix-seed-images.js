const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
let content = fs.readFileSync(seedPath, 'utf-8');

const replacements = [
  // Destinations
  { from: 'photo-1597432538819-efba72f4a91f?q=80&w=600&h=750&fit=crop', to: 'photo-1598091383021-15ddea10925d?q=80&w=800' },
  { from: 'photo-1608797173416-35dd8b2a72b8?q=80&w=600&h=750&fit=crop', to: 'photo-1581793745862-99fde7fa73d2?q=80&w=800' },
  { from: 'photo-1589636755490-8d1aa04f3160?q=80&w=600&h=750&fit=crop', to: 'photo-1626621341517-bbf3d9990a23?q=80&w=800' },
  { from: 'photo-1512343879784-a960bf40e7e9?q=80&w=600&h=750&fit=crop', to: 'photo-1507525428034-b723cf961d3e?q=80&w=800' },
  { from: 'photo-1477587458883-47145edc745f?q=80&w=600&h=750&fit=crop', to: 'photo-1599661046289-e31897846e41?q=80&w=800' },
  { from: 'photo-1567153796950-74e23f0723a1?q=80&w=600&h=750&fit=crop', to: 'photo-1464822759023-fed622ff2c3b?q=80&w=800' },
  { from: 'https://www.enlivetrips.com/uploads/posts/kedarkantha%20trek.jpg', to: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800' },
  // Domestic packages
  { from: 'photo-1597432538819-efba72f4a91f?q=80&w=800', to: 'photo-1598091383021-15ddea10925d?q=80&w=800' },
  { from: 'photo-1589636755490-8d1aa04f3160?q=80&w=800', to: 'photo-1626621341517-bbf3d9990a23?q=80&w=800' },
  { from: 'photo-1608797173416-35dd8b2a72b8?q=80&w=800', to: 'photo-1581793745862-99fde7fa73d2?q=80&w=800' },
  { from: 'photo-1602211843912-e4152ba9fbac?q=80&w=800', to: 'photo-1582653291997-079a1c04e5a1?q=80&w=800' },
  { from: 'photo-1566936737687-8f5b60c6d18f?q=80&w=800', to: 'photo-1540979388789-6cee28a1cdc9?q=80&w=800' },
  { from: 'photo-1598897998980-1a11d7b1b007?q=80&w=800', to: 'photo-1506744038136-46273834b3fb?q=80&w=800' },
  { from: 'photo-1567153796950-74e23f0723a1?q=80&w=800', to: 'photo-1548013146-72479768bada?q=80&w=800' },
  { from: 'photo-1477587458883-47145edc745f?q=80&w=800', to: 'photo-1599661046289-e31897846e41?q=80&w=800' },
  { from: 'photo-1618073170573-fcb3b798974a?q=80&w=800', to: 'photo-1596176530529-78163a4f7af2?q=80&w=800' },
  { from: 'photo-1512343879784-a960bf40e7e9?q=80&w=800', to: 'photo-1507525428034-b723cf961d3e?q=80&w=800' },
  { from: 'photo-1602179400078-5fd0dc1ac5da?q=80&w=800', to: 'photo-1596176530529-78163a4f7af2?q=80&w=800' },
  // NDTV & Spiritual
  { from: 'https://c.ndtvimg.com/2024-01/ev1g16t8_ayodhya-ram-mandir-inauguration-news-live_625x300_22_January_24.jpeg?im=FaceCrop,algorithm=dnn,width=545,height=307', to: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800' },
  { from: 'https://c.ndtvimg.com/2024-10/4trm92rg_ujjain-news-_625x300_28_October_24.jpeg?im=FitAndFill,algorithm=dnn,width=1200,height=675', to: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800' },
  // Singapore
  { from: 'photo-1569433819547-8a4a67a7fcb0?q=80&w=800', to: 'photo-1525625293386-3f8f99389edd?q=80&w=800' },
  // divinetravels legacy
  { from: 'https://divinetravels.in/wp-content/uploads/2025/11/photo_2025-11-08_12-51-10.jpg', to: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2026/02/photo_2026-02-26_20-46-26.jpg', to: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2025/11/photo_2025-11-08_11-51-05.jpg', to: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2025/11/photo_2025-11-08_11-55-02.jpg', to: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2026/03/9.jpg', to: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2026/03/14.jpg', to: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2025/11/photo_2025-11-08_11-54-20.jpg', to: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2026/03/13.jpg', to: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2025/11/photo_2025-11-08_11-58-36.jpg', to: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2026/03/25.jpg', to: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2026/03/33.jpg', to: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2026/03/21.jpg', to: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800' },
  { from: 'https://divinetravels.in/wp-content/uploads/2025/11/photo_2025-11-08_11-53-36.jpg', to: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800' },
];

replacements.forEach(r => {
  content = content.replaceAll(r.from, r.to);
});

fs.writeFileSync(seedPath, content);
console.log('Cleaned and fixed all image links in prisma/seed.ts');
