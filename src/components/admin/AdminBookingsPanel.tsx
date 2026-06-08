'use client'

import { AdminPackageBookings } from './AdminPackageBookings'
import { AdminTourBookings } from './AdminTourBookings'
import { AdminTaxiBookings } from './AdminTaxiBookings'

interface Props {
  serviceType: string
  category?: string
}

export function AdminBookingsPanel({ serviceType, category }: Props) {
  switch (serviceType) {
    case 'package':
      return <AdminPackageBookings categoryFilter={category} />
    case 'tour':
      return <AdminTourBookings />
    case 'taxi':
      return <AdminTaxiBookings />
    default:
      return <AdminPackageBookings />
  }
}
