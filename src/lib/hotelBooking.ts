export interface PricingTier {
  minPax: number
  maxPax: number
  pricePerPerson: number
}

export interface RoomTypeInput {
  name: string
  price: number
  baseOccupancy?: number
  extraAdultPrice?: number
  extraChildPrice?: number
  guests?: number
  maxAdults?: number
  maxChildren?: number
  plan?: string
  bed?: string
  size?: string
  pricingTiers?: PricingTier[]
}

export interface MealPlanInput {
  name: string
  description?: string
  price: number
}

export interface HotelBookingBreakdown {
  isHotel: true
  checkIn: string
  checkOut: string
  nights: number
  rooms: number
  adults: number
  children: number
  roomTypeName: string
  roomTypePrice: number
  baseOccupancy: number
  extraAdultPrice: number
  extraChildPrice: number
  mealPlanName: string
  mealPlanPrice: number
  roomCost: number
  extraAdultCost: number
  extraChildCost: number
  mealCost: number
  discount: number
  total: number
  specialRequests?: string
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime()
  const b = new Date(checkOut).getTime()
  if (!a || !b || isNaN(a) || isNaN(b) || b <= a) return 1
  return Math.max(1, Math.round((b - a) / 86400000))
}

export function computeHotelBreakdown(
  roomType: RoomTypeInput,
  mealPlan: MealPlanInput | undefined,
  opts: { checkIn: string; checkOut: string; nights: number; rooms: number; adults: number; children: number; discount?: number }
): HotelBookingBreakdown {
  const base = roomType.baseOccupancy || 2
  const nights = opts.nights
  const rooms = opts.rooms
  const adults = opts.adults
  const children = opts.children

  const roomCost = (roomType.price || 0) * nights * rooms
  const totalBaseOccupancy = base * rooms
  const extraAdults = Math.max(0, adults - totalBaseOccupancy)
  const extraAdultCost = extraAdults * (roomType.extraAdultPrice || 0) * nights
  const extraChildCost = children * rooms * (roomType.extraChildPrice || 0) * nights
  const mealCost = (mealPlan?.price || 0) * (adults + children) * nights
  const discount = opts.discount || 0
  const total = roomCost + extraAdultCost + extraChildCost + mealCost - discount

  return {
    isHotel: true,
    checkIn: opts.checkIn,
    checkOut: opts.checkOut,
    nights,
    rooms,
    adults,
    children,
    roomTypeName: roomType.name,
    roomTypePrice: roomType.price || 0,
    baseOccupancy: base,
    extraAdultPrice: roomType.extraAdultPrice || 0,
    extraChildPrice: roomType.extraChildPrice || 0,
    mealPlanName: mealPlan?.name || 'None',
    mealPlanPrice: mealPlan?.price || 0,
    roomCost,
    extraAdultCost,
    extraChildCost,
    mealCost,
    discount,
    total: Math.max(0, Math.round(total)),
  }
}

export interface CampingBookingBreakdown {
  isCamping: true
  checkIn: string
  checkOut: string
  nights: number
  camps: number
  adults: number
  children: number
  campTypeName: string
  tierPerCamp: number
  pricePerPerson: number
  roomCost: number
  mealPlanName: string
  mealPlanPrice: number
  mealCost: number
  discount: number
  total: number
  specialRequests?: string
}

// Resolve the group-size tier for a given per-camp headcount.
// Returns the matching tier, or the nearest bound tier when headcount
// falls outside all defined ranges (so a booking never ends up tierless).
export function resolveCampingTier(
  roomType: RoomTypeInput,
  headcountPerCamp: number
): PricingTier | null {
  const tiers = roomType.pricingTiers || []
  if (tiers.length === 0) return null
  const sorted = [...tiers].sort((a, b) => a.minPax - b.minPax)
  const exact = sorted.find((t) => headcountPerCamp >= t.minPax && headcountPerCamp <= t.maxPax)
  if (exact) return exact
  if (headcountPerCamp < sorted[0].minPax) return sorted[0]
  return sorted[sorted.length - 1]
}

export function computeCampingBreakdown(
  roomType: RoomTypeInput,
  mealPlan: MealPlanInput | undefined,
  opts: {
    checkIn: string
    checkOut: string
    nights: number
    camps: number
    adults: number
    children: number
    discount?: number
  }
): CampingBookingBreakdown {
  const headcount = opts.adults + opts.children
  const camps = Math.max(1, opts.camps)
  const headcountPerCamp = Math.ceil(headcount / camps)
  const tier = resolveCampingTier(roomType, headcountPerCamp)
  const pricePerPerson = tier ? tier.pricePerPerson : roomType.price || 0
  const roomCost = pricePerPerson * headcount * opts.nights
  const mealCost = (mealPlan?.price || 0) * headcount * opts.nights
  const discount = opts.discount || 0
  const total = roomCost + mealCost - discount

  return {
    isCamping: true,
    checkIn: opts.checkIn,
    checkOut: opts.checkOut,
    nights: opts.nights,
    camps,
    adults: opts.adults,
    children: opts.children,
    campTypeName: roomType.name,
    tierPerCamp: headcountPerCamp,
    pricePerPerson,
    roomCost,
    mealPlanName: mealPlan?.name || 'None',
    mealPlanPrice: mealPlan?.price || 0,
    mealCost,
    discount,
    total: Math.max(0, Math.round(total)),
  }
}

export function parseHotelNotes(notes: string | null | undefined): HotelBookingBreakdown | null {
  if (!notes) return null
  try {
    const parsed = JSON.parse(notes)
    if (parsed && parsed.isHotel === true) return parsed as HotelBookingBreakdown
  } catch {
    // not JSON / not a hotel breakdown
  }
  return null
}

export function parseCampingNotes(notes: string | null | undefined): CampingBookingBreakdown | null {
  if (!notes) return null
  try {
    const parsed = JSON.parse(notes)
    if (parsed && parsed.isCamping === true) return parsed as CampingBookingBreakdown
  } catch {
    // not JSON / not a camping breakdown
  }
  return null
}
