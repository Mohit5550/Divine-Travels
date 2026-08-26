import { Metadata } from 'next'
import { VendorPartnerPage } from '@/components/landing/VendorPartnerPage'

export const metadata: Metadata = {
  title: 'Partner with Us | List Your Camps, Rafting & Stays | Divine Travels Rishikesh',
  description: 'List your luxury riverside camp, river rafting company, hotel, or bike rental fleet on Divine Travels. Reach 50,000+ monthly travelers with zero upfront fees.',
}

export default function Page() {
  return <VendorPartnerPage />
}
