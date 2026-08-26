export interface FAQItem {
  q: string
  a: string
}

export interface FAQCategoryData {
  label: string
  items: FAQItem[]
}

export const DEFAULT_FAQS_DATA: Record<string, FAQCategoryData> = {
  rafting: {
    label: 'Rafting & Adventure',
    items: [
      {
        q: 'Is rafting safe for non-swimmers and beginners?',
        a: 'Yes, absolutely! 90% of our rafters are first-timers and non-swimmers. We provide high-buoyancy life jackets, helmets, and Govt.-certified river guides who steer each raft safely.',
      },
      {
        q: 'What is the minimum age and weight limit for river rafting in Rishikesh?',
        a: 'The minimum age for Brahmpuri (9km) is 12 years. For Shivpuri (16km) and Marine Drive (26km), the age limit is 14 to 60 years. Minimum weight is 35kg and maximum is 115kg.',
      },
      {
        q: 'What should I wear during rafting?',
        a: 'Wear quick-drying synthetic clothes (t-shirts, shorts, or track pants). Avoid heavy cotton or denim. Wear secure strap sandals or wet shoes.',
      },
    ],
  },
  camping: {
    label: 'Riverside Camping',
    items: [
      {
        q: 'What amenities are included in luxury Riverside Camps?',
        a: 'Our premium camps include attached western washrooms, private air-coolers/fans, swimming pool access, evening bonfire with light music, buffet meals (Breakfast, Lunch, Dinner, Evening snacks), and direct river beach access.',
      },
      {
        q: 'Is camping in Rishikesh safe for families and couples?',
        a: 'Yes, 100% safe. We host separate designated family camps with 24/7 security, proper power backup, and trained staff.',
      },
    ],
  },
  taxi: {
    label: 'Taxi & Outstation Cabs',
    items: [
      {
        q: 'Are toll and parking charges included in taxi bookings?',
        a: 'Our base fare includes sanitized AC cab, fuel, and driver allowance. State border taxes, tolls, and parking receipts are payable as per actuals directly at booths.',
      },
      {
        q: 'Can we book Airport pick-up from Dehradun (Jolly Grant) or Delhi?',
        a: 'Yes! We provide 24x7 punctual airport transfers from Jolly Grant Airport (DED) and Delhi IGI Airport (DEL) to Rishikesh, Haridwar, Mussoorie, and Nainital.',
      },
    ],
  },
  chardham: {
    label: 'Char Dham & Tours',
    items: [
      {
        q: 'Do you provide complete Char Dham Yatra packages from Haridwar/Rishikesh?',
        a: 'Yes, we offer complete 10-12 Days Char Dham packages (Kedarnath, Badrinath, Gangotri, Yamunotri) and Do Dham packages including sanitized vehicle, pre-booked hotel stays, and biometric registration support.',
      },
      {
        q: 'Is medical certificate or physical fitness required for Kedarnath?',
        a: 'Kedarnath trek is at high altitude (3,584m). Travelers with heart conditions or breathing issues must consult their doctor. Helicopter services and pony/doli options are also available.',
      },
    ],
  },
  booking: {
    label: 'Payments & Cancellation',
    items: [
      {
        q: 'How much advance do I need to pay to confirm a booking?',
        a: 'You only need to pay a 10% to 20% advance token to lock your slots and cab. The remaining balance can be paid on arrival at the camp/hotel or to the driver.',
      },
      {
        q: 'What is the date reschedule and cancellation policy?',
        a: 'We offer free date rescheduling up to 48 hours before departure. If trips are cancelled due to extreme weather or river closure, 100% refund or credit voucher is provided.',
      },
    ],
  },
}
