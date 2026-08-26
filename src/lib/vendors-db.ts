import { db } from './db'

export interface TimeSlot {
  startTime: string
  endTime: string
  capacity: number
}

export interface VendorItemType {
  id: string
  vendorId: string
  category: string
  title: string
  mrpPrice?: number
  sellingPrice: number
  b2bBasePrice: number
  advancePercentage?: number
  capacity?: string | null
  highlights?: string[] | string | null
  inclusions?: string[] | string | null
  exclusions?: string[] | string | null
  eligibility?: string | null
  timeSlots?: TimeSlot[] | string | null
  pickupLocation?: string | null
  spotLocation?: string | null
  amenities?: string[] | string | null
  photos?: string[] | string | null
  description?: string | null
  specifications?: Record<string, any> | string | null
  status: 'active' | 'pending' | 'inactive'
  createdAt: string | Date
  updatedAt?: string | Date
}

export interface VendorPartnerItem {
  id: string
  businessName: string
  ownerName: string
  phone: string
  email: string
  password?: string | null
  city: string
  businessCategory: string
  gstNumber?: string | null
  panNumber?: string | null
  gstDocUrl?: string | null
  panDocUrl?: string | null
  agreementDocUrl?: string | null
  advancePercentage?: number
  experienceYears?: string | null
  bankUpi?: string | null
  status: 'pending' | 'verified' | 'rejected' | 'suspended'
  commissionPct: number
  adminNotes?: string | null
  listingTitle: string
  location: string
  b2bBasePrice: number
  sellingPrice: number
  capacity?: string | null
  amenities?: string | null
  photos?: string | null
  description?: string | null
  specifications?: string | null
  items?: VendorItemType[]
  createdAt: string | Date
  updatedAt?: string | Date
}

export async function createVendorPartner(data: {
  businessName: string
  ownerName: string
  phone: string
  email: string
  password?: string | null
  city?: string
  businessCategory: string
  gstNumber?: string | null
  panNumber?: string | null
  gstDocUrl?: string | null
  panDocUrl?: string | null
  agreementDocUrl?: string | null
  advancePercentage?: number
  experienceYears?: string | null
  bankUpi?: string | null
  listingTitle?: string | null
  location?: string | null
  b2bBasePrice?: number
  sellingPrice?: number
  capacity?: string | null
  amenities?: string[] | string | null
  photos?: string[] | string | null
  description?: string | null
  specifications?: Record<string, any> | string | null
}): Promise<VendorPartnerItem> {
  const id = 'vendor_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6)

  const amenitiesStr = Array.isArray(data.amenities)
    ? JSON.stringify(data.amenities)
    : data.amenities || '[]'

  const photosStr = Array.isArray(data.photos)
    ? JSON.stringify(data.photos)
    : data.photos || '[]'

  const specsStr = typeof data.specifications === 'object' && data.specifications !== null
    ? JSON.stringify(data.specifications)
    : data.specifications || '{}'

  const b2bBase = Number(data.b2bBasePrice) || 0
  const selling = Number(data.sellingPrice) || Math.round(b2bBase * 1.2) || 0
  const title = data.listingTitle?.trim() || `${data.businessName.trim()} Services`
  const loc = data.location?.trim() || `${data.city?.trim() || 'Rishikesh'}, Uttarakhand`

  await (db as any).$executeRawUnsafe(`
    INSERT INTO "VendorPartner" (
      "id", "businessName", "ownerName", "phone", "email", "password", "city",
      "businessCategory", "gstNumber", "panNumber", "gstDocUrl", "panDocUrl", "agreementDocUrl",
      "advancePercentage", "experienceYears", "bankUpi",
      "status", "commissionPct", "adminNotes", "listingTitle", "location",
      "b2bBasePrice", "sellingPrice", "capacity", "amenities", "photos",
      "description", "specifications", "createdAt", "updatedAt"
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?,
      'pending', 15, NULL, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, DATETIME('now'), DATETIME('now')
    )
  `,
    id,
    data.businessName.trim(),
    data.ownerName.trim(),
    data.phone.trim(),
    data.email.trim().toLowerCase(),
    data.password?.trim() || null,
    data.city?.trim() || 'Rishikesh',
    data.businessCategory,
    data.gstNumber || null,
    data.panNumber || null,
    data.gstDocUrl || null,
    data.panDocUrl || null,
    data.agreementDocUrl || null,
    Number(data.advancePercentage) || 20,
    data.experienceYears || null,
    data.bankUpi || null,
    title,
    loc,
    b2bBase,
    selling,
    data.capacity || null,
    amenitiesStr,
    photosStr,
    data.description || null,
    specsStr
  )

  const rows: any[] = await (db as any).$queryRawUnsafe(
    `SELECT * FROM "VendorPartner" WHERE "id" = ? LIMIT 1`,
    id
  )

  return rows[0] as VendorPartnerItem
}

export async function authenticateVendor(query: string, pass: string): Promise<VendorPartnerItem | null> {
  const cleanPhone = query.replace(/[^0-9]/g, '')
  const rows: any[] = await (db as any).$queryRawUnsafe(`
    SELECT * FROM "VendorPartner"
    WHERE ("email" = ? OR "phone" LIKE ? OR "id" = ?)
    LIMIT 1
  `, query.toLowerCase().trim(), `%${cleanPhone || query}%`, query.trim()).catch(() => [])

  const vendor = rows[0]
  if (!vendor) return null

  // If vendor has password set, verify it (or allow master/demo login if empty)
  if (vendor.password && vendor.password.trim() !== '') {
    if (vendor.password !== pass.trim()) {
      return null
    }
  }

  const items = await getVendorItems(vendor.id).catch(() => [])
  return {
    ...vendor,
    items,
  }
}

export async function createVendorItem(data: {
  vendorId: string
  category: string
  title: string
  mrpPrice?: number
  sellingPrice: number
  b2bBasePrice: number
  advancePercentage?: number
  capacity?: string | null
  highlights?: string[] | string | null
  inclusions?: string[] | string | null
  exclusions?: string[] | string | null
  eligibility?: string | null
  timeSlots?: TimeSlot[] | string | null
  pickupLocation?: string | null
  spotLocation?: string | null
  amenities?: string[] | string | null
  specifications?: Record<string, any> | string | null
  photos?: string[] | string | null
  description?: string | null
  status?: 'active' | 'pending' | 'inactive'
}): Promise<VendorItemType> {
  const id = 'item_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6)

  const amenitiesStr = Array.isArray(data.amenities)
    ? JSON.stringify(data.amenities)
    : data.amenities || '[]'

  const photosStr = Array.isArray(data.photos)
    ? JSON.stringify(data.photos)
    : data.photos || '[]'

  const specsStr = typeof data.specifications === 'object' && data.specifications !== null
    ? JSON.stringify(data.specifications)
    : data.specifications || '{}'

  const highlightsStr = Array.isArray(data.highlights)
    ? JSON.stringify(data.highlights)
    : data.highlights || '[]'

  const inclusionsStr = Array.isArray(data.inclusions)
    ? JSON.stringify(data.inclusions)
    : data.inclusions || '[]'

  const exclusionsStr = Array.isArray(data.exclusions)
    ? JSON.stringify(data.exclusions)
    : data.exclusions || '[]'

  const timeSlotsStr = Array.isArray(data.timeSlots)
    ? JSON.stringify(data.timeSlots)
    : data.timeSlots || '[]'

  const b2b = Number(data.b2bBasePrice) || 0
  const selling = Number(data.sellingPrice) || Math.round(b2b * 1.2) || 0
  const mrp = Number(data.mrpPrice) || Math.round(selling * 1.25) || Math.round(b2b * 1.5) || 0

  await (db as any).$executeRawUnsafe(`
    INSERT INTO "VendorItem" (
      "id", "vendorId", "category", "title", "mrpPrice", "sellingPrice", "b2bBasePrice",
      "advancePercentage", "capacity", "highlights", "inclusions", "exclusions", "eligibility",
      "timeSlots", "pickupLocation", "spotLocation", "amenities", "specifications", "photos",
      "description", "status", "createdAt", "updatedAt"
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, DATETIME('now'), DATETIME('now')
    )
  `,
    id,
    data.vendorId,
    data.category,
    data.title.trim(),
    mrp,
    selling,
    b2b,
    Number(data.advancePercentage) || 20,
    data.capacity || null,
    highlightsStr,
    inclusionsStr,
    exclusionsStr,
    data.eligibility || null,
    timeSlotsStr,
    data.pickupLocation || null,
    data.spotLocation || null,
    amenitiesStr,
    specsStr,
    photosStr,
    data.description || null,
    data.status || 'active'
  )

  const rows: any[] = await (db as any).$queryRawUnsafe(
    `SELECT * FROM "VendorItem" WHERE "id" = ? LIMIT 1`,
    id
  )
  return rows[0] as VendorItemType
}

export async function getVendorItems(vendorId: string): Promise<VendorItemType[]> {
  const rows: any[] = await (db as any).$queryRawUnsafe(
    `SELECT * FROM "VendorItem" WHERE "vendorId" = ? ORDER BY "createdAt" ASC`,
    vendorId
  ).catch(() => [])

  return rows.map((r) => {
    let amenities = []
    let photos = []
    let specifications = {}
    let highlights = []
    let inclusions = []
    let exclusions = []
    let timeSlots = []

    try { amenities = JSON.parse(r.amenities || '[]') } catch {}
    try { photos = JSON.parse(r.photos || '[]') } catch {}
    try { specifications = JSON.parse(r.specifications || '{}') } catch {}
    try { highlights = JSON.parse(r.highlights || '[]') } catch {}
    try { inclusions = JSON.parse(r.inclusions || '[]') } catch {}
    try { exclusions = JSON.parse(r.exclusions || '[]') } catch {}
    try { timeSlots = JSON.parse(r.timeSlots || '[]') } catch {}

    return {
      ...r,
      amenities,
      photos,
      specifications,
      highlights,
      inclusions,
      exclusions,
      timeSlots,
    }
  })
}

export async function updateVendorItem(
  id: string,
  data: {
    title?: string
    category?: string
    mrpPrice?: number
    sellingPrice?: number
    b2bBasePrice?: number
    advancePercentage?: number
    capacity?: string | null
    highlights?: string[] | string | null
    inclusions?: string[] | string | null
    exclusions?: string[] | string | null
    eligibility?: string | null
    timeSlots?: TimeSlot[] | string | null
    pickupLocation?: string | null
    spotLocation?: string | null
    amenities?: string[] | string | null
    specifications?: Record<string, any> | string | null
    photos?: string[] | string | null
    description?: string | null
    status?: 'active' | 'pending' | 'inactive'
  }
): Promise<VendorItemType> {
  const sets: string[] = []
  const params: any[] = []

  if (data.title !== undefined) {
    sets.push(`"title" = ?`)
    params.push(data.title.trim())
  }
  if (data.category !== undefined) {
    sets.push(`"category" = ?`)
    params.push(data.category)
  }
  if (data.mrpPrice !== undefined) {
    sets.push(`"mrpPrice" = ?`)
    params.push(Number(data.mrpPrice))
  }
  if (data.sellingPrice !== undefined) {
    sets.push(`"sellingPrice" = ?`)
    params.push(Number(data.sellingPrice))
  }
  if (data.b2bBasePrice !== undefined) {
    sets.push(`"b2bBasePrice" = ?`)
    params.push(Number(data.b2bBasePrice))
  }
  if (data.advancePercentage !== undefined) {
    sets.push(`"advancePercentage" = ?`)
    params.push(Number(data.advancePercentage))
  }
  if (data.capacity !== undefined) {
    sets.push(`"capacity" = ?`)
    params.push(data.capacity)
  }
  if (data.highlights !== undefined) {
    sets.push(`"highlights" = ?`)
    params.push(Array.isArray(data.highlights) ? JSON.stringify(data.highlights) : data.highlights)
  }
  if (data.inclusions !== undefined) {
    sets.push(`"inclusions" = ?`)
    params.push(Array.isArray(data.inclusions) ? JSON.stringify(data.inclusions) : data.inclusions)
  }
  if (data.exclusions !== undefined) {
    sets.push(`"exclusions" = ?`)
    params.push(Array.isArray(data.exclusions) ? JSON.stringify(data.exclusions) : data.exclusions)
  }
  if (data.eligibility !== undefined) {
    sets.push(`"eligibility" = ?`)
    params.push(data.eligibility)
  }
  if (data.timeSlots !== undefined) {
    sets.push(`"timeSlots" = ?`)
    params.push(Array.isArray(data.timeSlots) ? JSON.stringify(data.timeSlots) : data.timeSlots)
  }
  if (data.pickupLocation !== undefined) {
    sets.push(`"pickupLocation" = ?`)
    params.push(data.pickupLocation)
  }
  if (data.spotLocation !== undefined) {
    sets.push(`"spotLocation" = ?`)
    params.push(data.spotLocation)
  }
  if (data.amenities !== undefined) {
    sets.push(`"amenities" = ?`)
    params.push(Array.isArray(data.amenities) ? JSON.stringify(data.amenities) : data.amenities)
  }
  if (data.specifications !== undefined) {
    sets.push(`"specifications" = ?`)
    params.push(typeof data.specifications === 'object' ? JSON.stringify(data.specifications) : data.specifications)
  }
  if (data.photos !== undefined) {
    sets.push(`"photos" = ?`)
    params.push(Array.isArray(data.photos) ? JSON.stringify(data.photos) : data.photos)
  }
  if (data.description !== undefined) {
    sets.push(`"description" = ?`)
    params.push(data.description)
  }
  if (data.status !== undefined) {
    sets.push(`"status" = ?`)
    params.push(data.status)
  }

  sets.push(`"updatedAt" = DATETIME('now')`)
  params.push(id)

  await (db as any).$executeRawUnsafe(
    `UPDATE "VendorItem" SET ${sets.join(', ')} WHERE "id" = ?`,
    ...params
  )

  const rows: any[] = await (db as any).$queryRawUnsafe(
    `SELECT * FROM "VendorItem" WHERE "id" = ? LIMIT 1`,
    id
  )
  return rows[0] as VendorItemType
}

export async function deleteVendorItem(id: string) {
  await (db as any).$executeRawUnsafe(
    `DELETE FROM "VendorItem" WHERE "id" = ?`,
    id
  )
}

export async function getVendorPartners(filters?: {
  status?: string
  category?: string
  search?: string
}): Promise<VendorPartnerItem[]> {
  let query = `SELECT * FROM "VendorPartner" WHERE 1=1`
  const params: any[] = []

  if (filters?.status && filters.status !== 'all') {
    query += ` AND "status" = ?`
    params.push(filters.status)
  }

  if (filters?.category && filters.category !== 'all') {
    query += ` AND "businessCategory" = ?`
    params.push(filters.category)
  }

  if (filters?.search) {
    const s = `%${filters.search.trim().toLowerCase()}%`
    query += ` AND (LOWER("businessName") LIKE ? OR LOWER("ownerName") LIKE ? OR "phone" LIKE ? OR LOWER("listingTitle") LIKE ?)`
    params.push(s, s, s, s)
  }

  query += ` ORDER BY "createdAt" DESC`

  const rows: any[] = await (db as any).$queryRawUnsafe(query, ...params).catch(() => [])

  // Attach all vendor items to each vendor
  const vendorsWithItems = await Promise.all(
    rows.map(async (v: any) => {
      const items = await getVendorItems(v.id).catch(() => [])
      return {
        ...v,
        items,
      }
    })
  )

  return vendorsWithItems as VendorPartnerItem[]
}

export async function getVendorStats() {
  const [totalRes, pendingRes, verifiedRes, itemsCountRes, campingRes, raftingRes, hotelRes, bikeRes, advRes]: any[] = await Promise.all([
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorPartner"`).catch(() => [{ c: 0 }]),
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorPartner" WHERE "status" = 'pending'`).catch(() => [{ c: 0 }]),
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorPartner" WHERE "status" = 'verified'`).catch(() => [{ c: 0 }]),
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorItem"`).catch(() => [{ c: 0 }]),
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorPartner" WHERE "businessCategory" = 'camping'`).catch(() => [{ c: 0 }]),
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorPartner" WHERE "businessCategory" = 'rafting'`).catch(() => [{ c: 0 }]),
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorPartner" WHERE "businessCategory" = 'hotel'`).catch(() => [{ c: 0 }]),
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorPartner" WHERE "businessCategory" = 'bike-rental'`).catch(() => [{ c: 0 }]),
    (db as any).$queryRawUnsafe(`SELECT COUNT(*) as c FROM "VendorPartner" WHERE "businessCategory" = 'adventure'`).catch(() => [{ c: 0 }]),
  ])

  return {
    total: Number(totalRes[0]?.c || 0),
    pending: Number(pendingRes[0]?.c || 0),
    verified: Number(verifiedRes[0]?.c || 0),
    totalListings: Number(itemsCountRes[0]?.c || 0),
    byCategory: {
      camping: Number(campingRes[0]?.c || 0),
      rafting: Number(raftingRes[0]?.c || 0),
      hotel: Number(hotelRes[0]?.c || 0),
      bikeRental: Number(bikeRes[0]?.c || 0),
      adventure: Number(advRes[0]?.c || 0),
    },
  }
}

export async function updateVendorPartner(
  id: string,
  data: {
    status?: 'pending' | 'verified' | 'rejected' | 'suspended'
    commissionPct?: number
    adminNotes?: string | null
    b2bBasePrice?: number
    sellingPrice?: number
    businessName?: string
    ownerName?: string
    phone?: string
    email?: string
    city?: string
    location?: string
    listingTitle?: string
    description?: string
    amenities?: string[] | string | null
    photos?: string[] | string | null
    businessCategory?: string
    gstNumber?: string | null
    panNumber?: string | null
    advancePercentage?: number
    bankUpi?: string | null
    experienceYears?: string | null
    agreementDocUrl?: string | null
    gstDocUrl?: string | null
    panDocUrl?: string | null
  }
) {
  const sets: string[] = []
  const params: any[] = []

  if (data.status !== undefined) {
    sets.push(`"status" = ?`)
    params.push(data.status)
  }
  if (data.commissionPct !== undefined) {
    sets.push(`"commissionPct" = ?`)
    params.push(Number(data.commissionPct))
  }
  if (data.adminNotes !== undefined) {
    sets.push(`"adminNotes" = ?`)
    params.push(data.adminNotes)
  }
  if (data.b2bBasePrice !== undefined) {
    sets.push(`"b2bBasePrice" = ?`)
    params.push(Number(data.b2bBasePrice))
  }
  if (data.sellingPrice !== undefined) {
    sets.push(`"sellingPrice" = ?`)
    params.push(Number(data.sellingPrice))
  }
  if (data.businessName !== undefined) {
    sets.push(`"businessName" = ?`)
    params.push(data.businessName.trim())
  }
  if (data.ownerName !== undefined) {
    sets.push(`"ownerName" = ?`)
    params.push(data.ownerName.trim())
  }
  if (data.phone !== undefined) {
    sets.push(`"phone" = ?`)
    params.push(data.phone.trim())
  }
  if (data.email !== undefined) {
    sets.push(`"email" = ?`)
    params.push(data.email.trim().toLowerCase())
  }
  if (data.city !== undefined) {
    sets.push(`"city" = ?`)
    params.push(data.city.trim())
  }
  if (data.location !== undefined) {
    sets.push(`"location" = ?`)
    params.push(data.location.trim())
  }
  if (data.listingTitle !== undefined) {
    sets.push(`"listingTitle" = ?`)
    params.push(data.listingTitle.trim())
  }
  if (data.description !== undefined) {
    sets.push(`"description" = ?`)
    params.push(data.description)
  }
  if (data.amenities !== undefined) {
    sets.push(`"amenities" = ?`)
    params.push(Array.isArray(data.amenities) ? JSON.stringify(data.amenities) : data.amenities)
  }
  if (data.photos !== undefined) {
    sets.push(`"photos" = ?`)
    params.push(Array.isArray(data.photos) ? JSON.stringify(data.photos) : data.photos)
  }
  if (data.businessCategory !== undefined) {
    sets.push(`"businessCategory" = ?`)
    params.push(data.businessCategory)
  }
  if (data.gstNumber !== undefined) {
    sets.push(`"gstNumber" = ?`)
    params.push(data.gstNumber)
  }
  if (data.panNumber !== undefined) {
    sets.push(`"panNumber" = ?`)
    params.push(data.panNumber)
  }
  if (data.advancePercentage !== undefined) {
    sets.push(`"advancePercentage" = ?`)
    params.push(Number(data.advancePercentage))
  }
  if (data.bankUpi !== undefined) {
    sets.push(`"bankUpi" = ?`)
    params.push(data.bankUpi)
  }
  if (data.experienceYears !== undefined) {
    sets.push(`"experienceYears" = ?`)
    params.push(data.experienceYears)
  }
  if (data.agreementDocUrl !== undefined) {
    sets.push(`"agreementDocUrl" = ?`)
    params.push(data.agreementDocUrl)
  }
  if (data.gstDocUrl !== undefined) {
    sets.push(`"gstDocUrl" = ?`)
    params.push(data.gstDocUrl)
  }
  if (data.panDocUrl !== undefined) {
    sets.push(`"panDocUrl" = ?`)
    params.push(data.panDocUrl)
  }

  sets.push(`"updatedAt" = DATETIME('now')`)
  params.push(id)

  await (db as any).$executeRawUnsafe(
    `UPDATE "VendorPartner" SET ${sets.join(', ')} WHERE "id" = ?`,
    ...params
  )

  const rows: any[] = await (db as any).$queryRawUnsafe(
    `SELECT * FROM "VendorPartner" WHERE "id" = ? LIMIT 1`,
    id
  )
  return rows[0] as VendorPartnerItem
}

export async function deleteVendorPartner(id: string) {
  await (db as any).$executeRawUnsafe(
    `DELETE FROM "VendorItem" WHERE "vendorId" = ?`,
    id
  ).catch(() => null)

  await (db as any).$executeRawUnsafe(
    `DELETE FROM "VendorPartner" WHERE "id" = ?`,
    id
  )
}

function parseVendorItemRow(r: any) {
  let amenities: any[] = []
  let photos: any[] = []
  let specifications: any = {}
  let highlights: any[] = []
  let inclusions: any[] = []
  let exclusions: any[] = []
  let timeSlots: any[] = []

  try { amenities = JSON.parse(r.amenities || '[]') } catch {}
  try { photos = JSON.parse(r.photos || '[]') } catch {}
  try { specifications = JSON.parse(r.specifications || '{}') } catch {}
  try { highlights = JSON.parse(r.highlights || '[]') } catch {}
  try { inclusions = JSON.parse(r.inclusions || '[]') } catch {}
  try { exclusions = JSON.parse(r.exclusions || '[]') } catch {}
  try { timeSlots = JSON.parse(r.timeSlots || '[]') } catch {}

  return {
    ...r,
    amenities,
    photos,
    specifications,
    highlights,
    inclusions,
    exclusions,
    timeSlots,
  }
}

export async function getPublicVendorItems(category?: string): Promise<any[]> {
  const params: any[] = []
  let query = `
    SELECT i.*, v."businessName" as "vendorName", v."location" as "vendorLocation",
           v."city" as "vendorCity", v."phone" as "vendorPhone", v."listingTitle" as "vendorListingTitle",
           v."ownerName" as "vendorOwner", v."description" as "vendorDescription"
    FROM "VendorItem" i
    JOIN "VendorPartner" v ON v."id" = i."vendorId"
    WHERE v."status" = 'verified' AND i."status" = 'active'
  `
  if (category && category !== 'all') {
    query += ` AND i."category" = ?`
    params.push(category)
  }
  query += ` ORDER BY i."createdAt" DESC`

  const rows: any[] = await (db as any).$queryRawUnsafe(query, ...params).catch(() => [])
  return rows.map(parseVendorItemRow)
}

export async function getPublicVendorItemById(id: string): Promise<any | null> {
  const rows: any[] = await (db as any).$queryRawUnsafe(`
    SELECT i.*, v."businessName" as "vendorName", v."location" as "vendorLocation",
           v."city" as "vendorCity", v."phone" as "vendorPhone", v."listingTitle" as "vendorListingTitle",
           v."ownerName" as "vendorOwner", v."description" as "vendorDescription", v."id" as "vendorIdRaw"
    FROM "VendorItem" i
    JOIN "VendorPartner" v ON v."id" = i."vendorId"
    WHERE i."id" = ? AND v."status" = 'verified' AND i."status" = 'active'
    LIMIT 1
  `, id).catch(() => [])

  if (!rows[0]) return null
  return parseVendorItemRow(rows[0])
}
