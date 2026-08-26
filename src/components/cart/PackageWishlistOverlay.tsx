'use client'

import { PackageWishlistButton } from './PackageWishlistButton'

export function PackageWishlistOverlay({ packageId }: { packageId: string | null }) {
  return <PackageWishlistButton packageId={packageId} className="absolute bottom-3 right-3 z-10 w-9 h-9" />
}
