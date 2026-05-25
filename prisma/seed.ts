import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.packageBooking.deleteMany()
  await prisma.packageReview.deleteMany()
  await prisma.package.deleteMany()
  await prisma.wishlist.deleteMany()
  await prisma.review.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.destination.deleteMany()
  await prisma.user.deleteMany()

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@divinetravel.com',
      name: 'Admin',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9876543210',
    },
  })

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'user@test.com',
      name: 'Rahul Patel',
      password: 'user123',
      role: 'user',
      phone: '+91 9123456789',
    },
  })

  // Create second test user for reviews
  const user2 = await prisma.user.create({
    data: {
      email: 'priya@test.com',
      name: 'Priya Sharma',
      password: 'user123',
      role: 'user',
      phone: '+91 9988776655',
    },
  })

  // ============ DESTINATIONS ============
  const rishikesh = await prisma.destination.create({
    data: {
      name: 'Rishikesh',
      tagline: 'Devbhoomi of Nature & Adventure',
      description: 'Nestled in the foothills of the Himalayas along the sacred Ganges, Rishikesh is a haven for adventure seekers and spiritual enthusiasts alike. Experience white-water rafting, bungee jumping, yoga ashrams, and the mesmerizing Ganga Aarti. This divine city offers the perfect blend of thrill and tranquility, making it one of the most sought-after destinations in Uttarakhand.',
      state: 'Uttarakhand',
      category: 'adventure rafting spiritual trekking domestic',
      price: 1999,
      rating: 4.9,
      reviewCount: 324,
      image: 'https://picsum.photos/seed/rishikesh-ganga-rafting/600/750',
      badge: 'Trending',
      badgeColor: 'white',
      tags: 'Rafting,Yoga,Bungee',
      featured: true,
    },
  })

  const haridwar = await prisma.destination.create({
    data: {
      name: 'Haridwar',
      tagline: 'Gateway to the Gods & Spiritual Bliss',
      description: 'Haridwar, meaning "Gateway to God," is one of the seven holiest places in Hinduism. The evening Ganga Aarti at Har Ki Pauri is a spectacle that draws thousands. Visit ancient temples, take a holy dip in the Ganges, and immerse yourself in the spiritual energy of this sacred city. Haridwar is also the gateway to the Char Dham Yatra.',
      state: 'Uttarakhand',
      category: 'spiritual domestic hotel custom',
      price: 999,
      rating: 4.7,
      reviewCount: 256,
      image: 'https://picsum.photos/seed/haridwar-ghat-aarti/600/750',
      badge: 'Spiritual',
      badgeColor: 'orange',
      tags: 'Ganga Aarti,Temples',
      featured: true,
    },
  })

  const mussoorie = await prisma.destination.create({
    data: {
      name: 'Mussoorie',
      tagline: 'The Queen of Hills & Misty Charm',
      description: 'Perched at an altitude of 2,005 meters, Mussoorie is a charming hill station that has captivated visitors for centuries. Stroll along Mall Road, trek to Gun Hill, visit Kempty Falls, or simply enjoy the breathtaking views of the Doon Valley and snow-capped Himalayas. The misty charm of this queen of hills is truly unforgettable.',
      state: 'Uttarakhand',
      category: 'trekking domestic hotel bike',
      price: 2299,
      rating: 4.6,
      reviewCount: 198,
      image: 'https://picsum.photos/seed/mussoorie-hilltown-mist/600/750',
      badge: 'Hill Station',
      badgeColor: 'green',
      tags: 'Trekking,Resorts',
      featured: true,
    },
  })

  const nainital = await prisma.destination.create({
    data: {
      name: 'Nainital',
      tagline: 'The Lake District of India & Serene Beauty',
      description: 'Set around the beautiful Naini Lake, Nainital is a picturesque hill station known for its serene lakes, lush greenery, and pleasant weather. Enjoy boating on the lake, trek to Naina Peak, explore the vibrant Tibetan Market, or visit the famous Naina Devi Temple. Nainital is the perfect getaway for nature lovers.',
      state: 'Uttarakhand',
      category: 'domestic hotel trekking bike',
      price: 1899,
      rating: 4.5,
      reviewCount: 167,
      image: 'https://picsum.photos/seed/nainital-lake-boat/600/750',
      badge: 'Lake City',
      badgeColor: 'blue',
      tags: 'Boating,Resorts',
      featured: false,
    },
  })

  const auli = await prisma.destination.create({
    data: {
      name: 'Auli',
      tagline: 'Snow-Capped Peaks & Skiing Paradise',
      description: "Auli is India's premier skiing destination, surrounded by towering peaks and oak forests. The Auli Ropeway, one of the longest in Asia, offers stunning panoramic views. Whether you're skiing down pristine slopes in winter or trekking through bugyal meadows in summer, Auli promises an experience like no other.",
      state: 'Uttarakhand',
      category: 'adventure trekking domestic hotel skiing',
      price: 3499,
      rating: 4.8,
      reviewCount: 142,
      image: 'https://picsum.photos/seed/auli-snow-mountain-ski/600/750',
      badge: 'Hill Station',
      badgeColor: 'sky',
      tags: 'Skiing,Ropeway',
      featured: true,
    },
  })

  const charDham = await prisma.destination.create({
    data: {
      name: 'Char Dham',
      tagline: 'Sacred Pilgrimage to the Four Abodes of Divinity',
      description: 'The Char Dham Yatra — comprising Yamunotri, Gangotri, Kedarnath, and Badrinath — is the most sacred pilgrimage circuit in Hinduism. Journey through breathtaking Himalayan landscapes to these ancient shrines, each offering divine blessings and spiritual liberation. This pilgrimage is believed to cleanse the soul and lead to moksha.',
      state: 'Uttarakhand',
      category: 'spiritual domestic trekking custom hotel',
      price: 8999,
      rating: 4.9,
      reviewCount: 289,
      image: 'https://picsum.photos/seed/char-dham-temple-mountain/600/750',
      badge: 'Pilgrimage',
      badgeColor: 'amber',
      tags: 'Yatra,Trek',
      featured: true,
    },
  })

  // ============ DESTINATION REVIEWS ============
  await prisma.review.createMany({
    data: [
      {
        userId: user.id,
        destinationId: rishikesh.id,
        rating: 5,
        comment: 'Absolutely divine experience! The rafting was thrilling and the Ganga Aarti was soul-stirring. A must-visit for every traveler.',
      },
      {
        userId: user.id,
        destinationId: haridwar.id,
        rating: 4,
        comment: 'The spiritual energy of Haridwar is unmatched. Ganga Aarti at Har Ki Pauri is a mesmerizing experience that stays with you forever.',
      },
      {
        userId: user.id,
        destinationId: auli.id,
        rating: 5,
        comment: 'Skiing in Auli was a dream come true! The ropeway ride offers breathtaking views. Perfect destination for adventure lovers.',
      },
    ],
  })

  // ============ DESTINATION BOOKINGS ============
  await prisma.booking.createMany({
    data: [
      {
        userId: user.id,
        destinationId: rishikesh.id,
        checkIn: new Date('2025-06-15'),
        checkOut: new Date('2025-06-18'),
        guests: 2,
        totalPrice: 5997,
        status: 'confirmed',
        paymentStatus: 'paid',
        phone: '+91 9123456789',
      },
      {
        userId: user.id,
        destinationId: mussoorie.id,
        checkIn: new Date('2025-07-01'),
        checkOut: new Date('2025-07-04'),
        guests: 3,
        totalPrice: 6897,
        status: 'pending',
        paymentStatus: 'pending',
        phone: '+91 9123456789',
      },
    ],
  })

  // ============ RAFTING PACKAGES ============
  const brahmpuri = await prisma.package.create({
    data: {
      name: 'Brahmpuri To Rishikesh',
      slug: 'brahmpuri-rishikesh-rafting',
      tagline: 'Gentle waves, unforgettable memories',
      subtitle: 'Beginner & Family',
      description: 'The Brahmpuri to Rishikesh rafting stretch is the perfect introduction to white water rafting on the sacred Ganges. Covering a scenic 9 to 12 kilometre route from Brahmpuri ghat down to Rishikesh, this package offers a gentle yet exciting ride through Grade I and Grade II rapids. The journey takes approximately 1.5 to 2+ hours, giving you ample time to soak in the breathtaking views of the Shivalik hills, riverside ashrams, and the iconic Laxman Jhula and Ram Jhula bridges.\n\nThis stretch is particularly popular among families with children (aged 14 and above), school groups, and first-time rafters who want to experience the thrill of river rafting without the intensity of higher-grade rapids. The rapids on this route — including Sweet Sixteen, Body Surfing, and Hilton — are playful and forgiving, making them ideal for building confidence on the water. Between rapids, you can float calmly in the river, body surf on gentle currents, and even take a dip in the holy Ganges.\n\nOur certified instructors provide a thorough safety briefing before the trip, and all necessary equipment including life jackets, helmets, and paddles is provided. Whether you are planning a family outing, a school excursion, or simply want to try something new, the Brahmpuri package promises a safe, fun, and memorable adventure on the Ganges.',
      price: 399,
      image: 'https://picsum.photos/seed/brahmpuri-rafting-rishikesh/800/500',
      images: JSON.stringify([
        'https://picsum.photos/seed/brahmpuri-raft1/800/500',
        'https://picsum.photos/seed/brahmpuri-raft2/800/500',
        'https://picsum.photos/seed/brahmpuri-raft3/800/500',
        'https://picsum.photos/seed/brahmpuri-raft4/800/500',
      ]),
      category: 'rafting',
      distance: '9km to 12km route',
      duration: '1.5 to 2+ Hours',
      rapidsLevel: 'Grade I & II',
      rapidsDescription: 'Easy waves — perfect introduction to rafting',
      targetDemo: 'School groups, families, and first-timers. Safe for children above 14.',
      timings: '07:00 AM to 04:00 PM',
      highlights: JSON.stringify([
        'Perfect for beginners and families with children (14+)',
        'Gentle Grade I & II rapids — safe yet exciting',
        'Scenic views of Shivalik hills and riverside ashrams',
        'Pass under the iconic Laxman Jhula and Ram Jhula bridges',
        'Body surfing and floating in calm river stretches',
        'Opportunity to take a holy dip in the Ganges',
        'Professional certified river guides',
        'All safety equipment included — life jackets, helmets, paddles',
      ]),
      inclusions: JSON.stringify([
        'Certified river guide and safety briefing',
        'Life jacket, helmet, and paddle',
        'Rafting boat (6-seater or 8-seater)',
        'Transport from finish point back to Brahmpuri starting point',
        'Dry bag for valuables',
        'Changing room facility at the end point',
        'Basic first aid kit on the raft',
      ]),
      exclusions: JSON.stringify([
        'Transport to the starting point (Brahmpuri ghat)',
        'Meals and beverages',
        'Photography or videography (available at extra cost)',
        'Personal expenses and tips',
        'Insurance of any kind',
        'Anything not mentioned in inclusions',
      ]),
      eligibility: 'Participants must be at least 14 years old. Basic swimming ability is helpful but not mandatory as life jackets are provided. Pregnant women, persons with heart conditions, epilepsy, or severe back problems are advised not to participate. A waiver form must be signed before the activity.',
      location: 'Brahmpuri Ghat, Rishikesh, Uttarakhand 249137. The starting point is approximately 12 km upstream from Rishikesh main town on the Neelkanth road. It is easily accessible by road from Rishikesh, Haridwar, and Dehradun.',
      cancellationPolicy: '100% refund if cancelled 24 hours or more before the scheduled trip time. 50% refund if cancelled between 12-24 hours before the trip. No refund for cancellations made less than 12 hours before the trip or for no-shows. In case of unsafe weather or river conditions, the operator may reschedule the trip or provide a full refund.',
      faqs: JSON.stringify([
        { question: 'Is prior rafting experience required?', answer: 'No, the Brahmpuri stretch is designed for beginners. Our certified guides will provide a complete safety briefing and paddling instructions before the trip.' },
        { question: 'What should I wear for rafting?', answer: 'Wear quick-drying clothes like shorts and a t-shirt. Avoid cotton as it stays wet. Wear secure footwear like sports sandals or water shoes — no flip-flops. A change of dry clothes for after the trip is recommended.' },
        { question: 'Can children participate in this rafting trip?', answer: 'Yes, children aged 14 and above can participate in the Brahmpuri stretch with parental consent. The Grade I & II rapids are safe and suitable for young beginners.' },
        { question: 'What happens if it rains on the day of my trip?', answer: 'Light rain does not affect the trip — you are already going to get wet! However, if the river levels rise dangerously due to heavy rain, the trip may be rescheduled or cancelled with a full refund.' },
        { question: 'Is there a weight limit for rafting?', answer: 'There is no strict weight limit, but participants should be in reasonable physical condition to paddle and follow instructions. The life jackets support up to 130 kg.' },
      ]),
      badge: 'Family Friendly',
      badgeColor: 'bg-emerald-500',
      gradient: 'from-emerald-500/80 to-teal-600/80',
      featured: true,
      rating: 4.7,
      reviewCount: 12,
    },
  })

  const shivpuri = await prisma.package.create({
    data: {
      name: 'Shivpuri To Rishikesh',
      slug: 'shivpuri-rishikesh-rafting',
      tagline: 'The classic Rishikesh rafting experience',
      subtitle: 'Most Popular',
      description: 'The Shivpuri to Rishikesh rafting stretch is the most popular and sought-after white water rafting route in all of India. Covering an exhilarating 16 kilometre journey from Shivpuri beach camp down to Rishikesh, this package delivers the perfect balance of adventure and natural beauty. Over 3 to 4+ hours on the river, you will navigate through a thrilling series of Grade II and Grade III rapids that will get your heart racing and your spirits soaring.\n\nThe Shivpuri stretch features some of the most famous rapids on the Ganges, including the legendary Roller Coaster — a Grade III rapid that offers an adrenaline-pumping ride through churning white water. Other notable rapids on this route include Golf Course, Club House, Double Trouble, and Hilton. Between the rapids, you will have the chance to try body surfing — floating down the river with just your life jacket — and even attempt cliff jumping from riverside rocks into the deep, cool waters of the Ganges.\n\nThis package is ideal for college groups, friends, and corporate teams looking for an exciting bonding experience. The moderate difficulty level means that first-timers with a sense of adventure can handle it, while still providing enough thrills for those who have rafted before. Our expert guides know every rock and current on this stretch, ensuring your safety while maximizing the fun.\n\nThe journey takes you past stunning landscapes — lush green forests, ancient temples, and the majestic hills of the lower Himalayas. You will also pass under the iconic suspension bridges of Rishikesh, offering a unique perspective of this spiritual city from the river. The Shivpuri package is the quintessential Rishikesh rafting experience — it is no wonder it is our most booked trip.',
      price: 499,
      image: 'https://picsum.photos/seed/shivpuri-rafting-adventure/800/500',
      images: JSON.stringify([
        'https://picsum.photos/seed/shivpuri-raft1/800/500',
        'https://picsum.photos/seed/shivpuri-raft2/800/500',
        'https://picsum.photos/seed/shivpuri-raft3/800/500',
        'https://picsum.photos/seed/shivpuri-raft4/800/500',
      ]),
      category: 'rafting',
      distance: '16km Route',
      duration: '3 to 4+ Hours',
      rapidsLevel: 'Grade II & III',
      rapidsDescription: 'Moderate rapids with exciting waves',
      targetDemo: 'College groups, friends, and corporate trips. Includes body surfing and cliff jumping.',
      timings: '07:00 AM to 04:00 PM',
      highlights: JSON.stringify([
        'The most popular rafting stretch in Rishikesh — 16 km of pure adventure',
        'Tackle the legendary Roller Coaster rapid (Grade III)',
        'Navigate Golf Course, Club House, Double Trouble rapids',
        'Body surfing on the Ganges — float with the current',
        'Cliff jumping from riverside rocks into deep waters',
        'Stunning views of Himalayan foothills and riverside temples',
        'Pass under the iconic Laxman Jhula and Ram Jhula',
        'Perfect for groups — college friends, corporate teams, adventure seekers',
        'Experienced certified guides for safety and fun',
      ]),
      inclusions: JSON.stringify([
        'Professional certified river guide',
        'Life jacket, helmet, and paddle',
        'Rafting boat (6-seater or 8-seater)',
        'Body surfing and cliff jumping (subject to river conditions)',
        'Transport from finish point back to Shivpuri starting point',
        'Dry bag for valuables',
        'Changing room facility at the end point',
        'Basic first aid kit on the raft',
        'Safety briefing and paddling instructions',
      ]),
      exclusions: JSON.stringify([
        'Transport to the starting point (Shivpuri beach camp)',
        'Meals, snacks, and beverages',
        'Photography or videography (available at extra cost)',
        'Personal expenses and tips',
        'Insurance of any kind',
        'Anything not mentioned in inclusions',
      ]),
      eligibility: 'Participants must be at least 16 years old. Basic swimming ability is recommended but not mandatory. Pregnant women, persons with heart conditions, epilepsy, asthma, or severe back/neck problems are advised not to participate. A waiver form must be signed before the activity. Participants should be in reasonable physical condition.',
      location: 'Shivpuri Beach Camp, Rishikesh, Uttarakhand 249192. The starting point is approximately 16 km upstream from Rishikesh on the Badrinath highway. It is a popular camping and rafting hub with easy road access from Rishikesh (30 min drive), Haridwar (1 hour), and Dehradun (1.5 hours).',
      cancellationPolicy: '100% refund if cancelled 24 hours or more before the scheduled trip time. 50% refund if cancelled between 12-24 hours before the trip. No refund for cancellations made less than 12 hours before the trip or for no-shows. Cliff jumping and body surfing are subject to river conditions and guide discretion. In case of unsafe weather or river conditions, the operator may reschedule the trip or provide a full refund.',
      faqs: JSON.stringify([
        { question: 'Is the Shivpuri stretch suitable for first-timers?', answer: 'Yes! While it has Grade III rapids, our experienced guides make it accessible for beginners with a sense of adventure. The safety briefing covers everything you need to know, and the guide controls the raft throughout.' },
        { question: 'What is cliff jumping and is it safe?', answer: 'Cliff jumping involves leaping from riverside rocks (10-20 feet high) into deep pools of the Ganges. It is completely optional and only done at spots deemed safe by our guides. Life jackets provide buoyancy, and guides are positioned in the water for assistance.' },
        { question: 'Can I bring my phone/camera on the raft?', answer: 'We provide dry bags for small valuables, but we recommend leaving phones and cameras behind as they can get damaged. Professional photography services are available at an additional cost.' },
        { question: 'What if I fall out of the raft?', answer: 'Falling out (swimming) is part of the rafting experience and is completely normal. Your life jacket keeps you afloat, and our guides are trained to quickly pull you back into the raft. We also cover self-rescue techniques in the safety briefing.' },
        { question: 'How many people fit in one raft?', answer: 'Our rafts accommodate 6 to 8 paddlers plus the guide. If you are a smaller group, you may share the raft with other adventurers. Private rafts can be arranged on request.' },
        { question: 'Is there a best season for this rafting trip?', answer: 'The rafting season runs from September to June. The best months are October-November and March-May when the weather is pleasant and river levels are ideal. Summer months (April-June) are the busiest.' },
      ]),
      badge: 'Most Popular',
      badgeColor: 'bg-brand-orange',
      gradient: 'from-brand-orange/80 to-amber-600/80',
      featured: true,
      rating: 4.9,
      reviewCount: 28,
    },
  })

  const marineDrive = await prisma.package.create({
    data: {
      name: 'Marine Drive To Rishikesh',
      slug: 'marine-drive-rishikesh-rafting',
      tagline: 'The ultimate Ganges challenge',
      subtitle: 'Extreme Adventure',
      description: 'The Marine Drive to Rishikesh rafting stretch is the ultimate white water rafting experience in India — a full-day adventure covering 24 to 26 kilometres of the most challenging rapids the Ganges has to offer. This package is designed exclusively for adrenaline junkies and experienced rafters who crave the raw power and thrill of Grade III and Grade IV rapids.\n\nOver 4 to 6 intense hours on the river, you will face some of the most legendary rapids in South Asian rafting, including The Wall — a notorious Grade IV rapid that has flipped more rafts than any other on the Ganges. Other heart-pounding rapids on this route include Three Blind Mice, Crossfire, Roller Coaster, Golf Course, and Daniel\'s Dip. Each rapid demands focus, teamwork, and courage, rewarding you with an unmatched sense of accomplishment as you power through the churning white water.\n\nThe Marine Drive stretch begins at the scenic Marine Drive campsite, nestled deep in the Shivalik range, and takes you through some of the most remote and pristine sections of the Ganges. Between rapids, you will float through serene pools surrounded by dense forest, spot exotic birdlife, and enjoy the raw beauty of the Himalayan foothills far from the tourist crowds. The route passes through Shivpuri as well, meaning you will also experience the popular lower rapids before reaching Rishikesh.\n\nThis is not a trip for the faint-hearted. Participants should be physically fit, comfortable in water, and ready for an intense, demanding experience. Our senior guides — each with over 500 trips on this stretch — will lead you through every rapid with expertise and confidence. Full safety equipment, comprehensive briefing, and rescue kayaks are standard on every Marine Drive trip.\n\nIf you have rafted before and want to push your limits, or if you are an adventure athlete seeking the next thrill, the Marine Drive package is calling your name. This is as extreme as rafting gets in Rishikesh.',
      price: 599,
      image: 'https://picsum.photos/seed/marine-drive-extreme-rafting/800/500',
      images: JSON.stringify([
        'https://picsum.photos/seed/marine-drive-raft1/800/500',
        'https://picsum.photos/seed/marine-drive-raft2/800/500',
        'https://picsum.photos/seed/marine-drive-raft3/800/500',
        'https://picsum.photos/seed/marine-drive-raft4/800/500',
      ]),
      category: 'rafting',
      distance: '24km to 26km Route',
      duration: '4 to 6 Hours',
      rapidsLevel: 'Grade III & IV',
      rapidsDescription: 'High thrill — for the adrenaline seekers',
      targetDemo: 'Highly energetic individuals and adventure junkies. Prior rafting experience recommended.',
      timings: '07:00 AM to 04:00 PM',
      highlights: JSON.stringify([
        'The most extreme rafting experience in Rishikesh — 24-26 km of intense rapids',
        'Conquer The Wall — the infamous Grade IV rapid that challenges even experts',
        'Face Three Blind Mice, Crossfire, and Daniel\'s Dip rapids',
        'Also covers the full Shivpuri stretch (Roller Coaster, Golf Course, etc.)',
        'Full-day adventure — 4 to 6 hours on the river',
        'Remote, pristine sections of the Ganges with stunning Himalayan scenery',
        'Rescue kayak support for maximum safety',
        'Senior guides with 500+ trips of experience on this stretch',
        'The ultimate test of courage and teamwork',
      ]),
      inclusions: JSON.stringify([
        'Senior certified river guide (500+ trips experience)',
        'Life jacket, helmet, and paddle (premium equipment)',
        'Rafting boat (6-seater or 8-seater)',
        'Rescue kayak accompanying the raft',
        'Transport from finish point back to Marine Drive starting point',
        'Dry bag for valuables',
        'Changing room facility at the end point',
        'Comprehensive first aid kit on the raft',
        'Extended safety briefing and self-rescue training',
        'Energy snacks and drinking water on the raft',
      ]),
      exclusions: JSON.stringify([
        'Transport to the starting point (Marine Drive campsite)',
        'Meals and beverages (lunch not included)',
        'Photography or videography (available at extra cost)',
        'Personal expenses and tips',
        'Insurance of any kind',
        'Wetsuit rental (available at extra cost in winter months)',
        'Anything not mentioned in inclusions',
      ]),
      eligibility: 'Participants must be at least 18 years old. Prior rafting experience is strongly recommended. Participants must be physically fit and comfortable swimming in moving water. Pregnant women, persons with heart conditions, epilepsy, asthma, high blood pressure, or any chronic medical condition must not participate. A medical fitness declaration and waiver form must be signed before the activity. The operator reserves the right to refuse participation to anyone deemed unfit.',
      location: 'Marine Drive Campsite, Byasi, Rishikesh, Uttarakhand 249192. The starting point is approximately 26 km upstream from Rishikesh on the Badrinath highway, near the village of Byasi. It is accessible by road from Rishikesh (45 min drive), Haridwar (1.5 hours), and Dehradun (2 hours).',
      cancellationPolicy: '100% refund if cancelled 48 hours or more before the scheduled trip time. 50% refund if cancelled between 24-48 hours before the trip. No refund for cancellations made less than 24 hours before the trip or for no-shows. Due to the extreme nature of this trip, the operator may cancel or modify the route based on river conditions, water levels, and weather. In such cases, a full refund or rescheduling will be offered.',
      faqs: JSON.stringify([
        { question: 'Do I need prior rafting experience for Marine Drive?', answer: 'Prior rafting experience is strongly recommended for this stretch. The Grade IV rapids demand quick reactions, physical stamina, and comfort in turbulent water. If you have never rafted before, we recommend starting with the Shivpuri package first.' },
        { question: 'How difficult is The Wall rapid?', answer: 'The Wall is a Grade IV rapid known for its powerful hydraulic that can flip rafts. It requires precise paddling and teamwork under the guide\'s commands. Even experienced rafters find it thrilling. Our guides are experts at navigating it safely.' },
        { question: 'What happens if the raft flips?', answer: 'Raft flips (particularly at The Wall) are possible. This is why we conduct an extended safety briefing covering self-rescue, swimming in rapids, and re-entry techniques. Rescue kayaks accompany every trip for immediate assistance.' },
        { question: 'Why is there a rescue kayak on this trip?', answer: 'The rescue kayak is a safety measure specific to the Marine Drive stretch. The kayaker stays close to the raft and can quickly reach any swimmer in distress, provide a rescue rope, or assist with raft re-entry. This is standard practice for Grade IV trips worldwide.' },
        { question: 'Can I do this trip in winter?', answer: 'Rafting is available year-round except during the monsoon (July-August). In winter (December-February), water levels are lower but rapids remain powerful. Wetsuits are available for rent. The water is cold, so be prepared for a bracing experience!' },
        { question: 'Is there a weight or fitness requirement?', answer: 'There is no strict weight limit, but participants must be physically fit enough to paddle continuously for 4-6 hours, swim in moving water, and pull themselves back into the raft. The operator may assess fitness at the start point.' },
      ]),
      badge: 'Extreme',
      badgeColor: 'bg-red-600',
      gradient: 'from-red-600/80 to-rose-700/80',
      featured: true,
      rating: 4.8,
      reviewCount: 15,
    },
  })

  // ============ PACKAGE REVIEWS ============
  await prisma.packageReview.createMany({
    data: [
      {
        userId: user.id,
        packageId: brahmpuri.id,
        rating: 5,
        comment: 'Perfect family outing! Our kids (14 and 16) loved every minute. The guides were patient and made sure everyone felt safe. The gentle rapids were just right for beginners. Highly recommend!',
      },
      {
        userId: user2.id,
        packageId: brahmpuri.id,
        rating: 4,
        comment: 'Great experience for first-timers. The views are stunning and the water is refreshing. Only giving 4 stars because I wish it was a bit longer — we finished in about 1.5 hours.',
      },
      {
        userId: user.id,
        packageId: shivpuri.id,
        rating: 5,
        comment: 'THE best rafting experience! Roller Coaster rapid lived up to its name — absolutely thrilling! Cliff jumping was the highlight of our trip. Our guide Raju was phenomenal.',
      },
      {
        userId: user2.id,
        packageId: shivpuri.id,
        rating: 5,
        comment: 'We went as a corporate team and it was the best team building activity ever! Everyone loved it, even the scared ones. Body surfing in the calm stretches was so peaceful.',
      },
      {
        userId: user2.id,
        packageId: shivpuri.id,
        rating: 5,
        comment: 'Second time doing this stretch and it never gets old. The guides make all the difference — fun, professional, and safety-conscious. Already planning my next trip!',
      },
      {
        userId: user.id,
        packageId: marineDrive.id,
        rating: 5,
        comment: 'The Wall rapid is no joke — our raft nearly flipped! But the adrenaline rush was incredible. This is not for the faint-hearted but if you want the real deal, Marine Drive is it.',
      },
      {
        userId: user2.id,
        packageId: marineDrive.id,
        rating: 4,
        comment: 'Challenging and exhilarating! The 6 hours on the river were intense but the scenery between rapids was breathtaking. Make sure you are physically prepared for this one.',
      },
    ],
  })

  // ============ PACKAGE BOOKINGS (sample) ============
  await prisma.packageBooking.createMany({
    data: [
      {
        userId: user.id,
        packageId: shivpuri.id,
        fullName: 'Rahul Patel',
        mobile: '+91 9123456789',
        numberOfPeople: 4,
        preferredDate: new Date('2025-06-20'),
        preferredTime: 'Morning (7-9 AM)',
        additionalNotes: 'Corporate group — need invoice for company reimbursement',
        totalPrice: 499 * 4,
        status: 'confirmed',
      },
      {
        userId: user2.id,
        packageId: brahmpuri.id,
        fullName: 'Priya Sharma',
        mobile: '+91 9988776655',
        numberOfPeople: 3,
        preferredDate: new Date('2025-07-05'),
        preferredTime: 'No preference',
        additionalNotes: 'Family trip with 14-year-old child',
        totalPrice: 399 * 3,
        status: 'pending',
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log(`Admin: admin@divinetravel.com / admin123`)
  console.log(`User: user@test.com / user123`)
  console.log(`6 destinations, 3 destination reviews, 2 destination bookings`)
  console.log(`3 rafting packages, 7 package reviews, 2 package bookings`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
