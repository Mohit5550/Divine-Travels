import { db } from './db'
import crypto from 'crypto'

export interface CreatorCollabRecord {
  id: string
  name: string
  email: string
  phone: string
  instagram: string | null
  youtube: string | null
  followersCount: string
  niche: string
  collaborationType: string // "barter", "affiliate", "paid"
  selectedFreeActivity: string | null // e.g. "Bungee Jump (India Highest)"
  expectedBudget: string | null // e.g. "₹20,000"
  proposedCoupon: string | null // e.g. "ROHAN10"
  deliverables: string | null
  travelDates: string | null
  message: string | null
  status: string
  assignedCoupon: string | null
  commissionPct: number | null
  adminNotes: string | null
  createdAt: string | Date
  updatedAt: string | Date
}

function generateId() {
  return 'collab_' + crypto.randomBytes(8).toString('hex')
}

export async function createCollaboration(data: {
  name: string
  email: string
  phone: string
  instagram?: string | null
  youtube?: string | null
  followersCount: string
  niche: string
  collaborationType: string
  selectedFreeActivity?: string | null
  expectedBudget?: string | null
  proposedCoupon?: string | null
  deliverables?: string | null
  travelDates?: string | null
  message?: string | null
}): Promise<CreatorCollabRecord> {
  const id = generateId()
  const now = new Date().toISOString()

  // Ensure table and columns exist
  await (db as any).$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CreatorCollaboration" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "instagram" TEXT,
      "youtube" TEXT,
      "followersCount" TEXT NOT NULL,
      "niche" TEXT NOT NULL,
      "collaborationType" TEXT NOT NULL,
      "selectedFreeActivity" TEXT,
      "expectedBudget" TEXT,
      "proposedCoupon" TEXT,
      "deliverables" TEXT,
      "travelDates" TEXT,
      "message" TEXT,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "assignedCoupon" TEXT,
      "commissionPct" INTEGER DEFAULT 10,
      "adminNotes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `).catch(() => null)

  await (db as any).$executeRawUnsafe(
    `INSERT INTO "CreatorCollaboration" (
      "id", "name", "email", "phone", "instagram", "youtube",
      "followersCount", "niche", "collaborationType", "selectedFreeActivity",
      "expectedBudget", "proposedCoupon", "deliverables",
      "travelDates", "message", "status", "commissionPct", "createdAt", "updatedAt"
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 10, ?, ?)`,
    id,
    data.name,
    data.email,
    data.phone,
    data.instagram || null,
    data.youtube || null,
    data.followersCount,
    data.niche,
    data.collaborationType,
    data.selectedFreeActivity || null,
    data.expectedBudget || null,
    data.proposedCoupon || null,
    data.deliverables || null,
    data.travelDates || null,
    data.message || null,
    now,
    now
  )

  const rows = await (db as any).$queryRawUnsafe(
    `SELECT * FROM "CreatorCollaboration" WHERE "id" = ? LIMIT 1`,
    id
  )
  return rows[0] as CreatorCollabRecord
}

export async function getCollaborations(filter?: { status?: string; type?: string }): Promise<CreatorCollabRecord[]> {
  let query = `SELECT * FROM "CreatorCollaboration"`
  const conditions: string[] = []
  const params: any[] = []

  if (filter?.status && filter.status !== 'all') {
    conditions.push(`"status" = ?`)
    params.push(filter.status)
  }
  if (filter?.type && filter.type !== 'all') {
    conditions.push(`"collaborationType" = ?`)
    params.push(filter.type)
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ')
  }
  query += ` ORDER BY "createdAt" DESC`

  const rows = await (db as any).$queryRawUnsafe(query, ...params).catch(() => [])
  return rows as CreatorCollabRecord[]
}

export async function getCollaborationStats() {
  try {
    const [totalRows, pendingRows, approvedRows, barterRows, affiliateRows, paidRows] = await Promise.all([
      (db as any).$queryRawUnsafe(`SELECT COUNT(*) as count FROM "CreatorCollaboration"`),
      (db as any).$queryRawUnsafe(`SELECT COUNT(*) as count FROM "CreatorCollaboration" WHERE "status" = 'pending'`),
      (db as any).$queryRawUnsafe(`SELECT COUNT(*) as count FROM "CreatorCollaboration" WHERE "status" = 'approved'`),
      (db as any).$queryRawUnsafe(`SELECT COUNT(*) as count FROM "CreatorCollaboration" WHERE "collaborationType" = 'barter'`),
      (db as any).$queryRawUnsafe(`SELECT COUNT(*) as count FROM "CreatorCollaboration" WHERE "collaborationType" = 'affiliate'`),
      (db as any).$queryRawUnsafe(`SELECT COUNT(*) as count FROM "CreatorCollaboration" WHERE "collaborationType" = 'paid'`),
    ])

    return {
      total: Number(totalRows[0]?.count || 0),
      pending: Number(pendingRows[0]?.count || 0),
      approved: Number(approvedRows[0]?.count || 0),
      barter: Number(barterRows[0]?.count || 0),
      affiliate: Number(affiliateRows[0]?.count || 0),
      paid: Number(paidRows[0]?.count || 0),
    }
  } catch {
    return { total: 0, pending: 0, approved: 0, barter: 0, affiliate: 0, paid: 0 }
  }
}

export async function updateCollaboration(id: string, updates: {
  status?: string
  assignedCoupon?: string | null
  commissionPct?: number | null
  selectedFreeActivity?: string | null
  expectedBudget?: string | null
  adminNotes?: string | null
}): Promise<CreatorCollabRecord | null> {
  const fields: string[] = []
  const params: any[] = []

  if (updates.status !== undefined) {
    fields.push(`"status" = ?`)
    params.push(updates.status)
  }
  if (updates.assignedCoupon !== undefined) {
    fields.push(`"assignedCoupon" = ?`)
    params.push(updates.assignedCoupon)
  }
  if (updates.commissionPct !== undefined) {
    fields.push(`"commissionPct" = ?`)
    params.push(updates.commissionPct)
  }
  if (updates.selectedFreeActivity !== undefined) {
    fields.push(`"selectedFreeActivity" = ?`)
    params.push(updates.selectedFreeActivity)
  }
  if (updates.expectedBudget !== undefined) {
    fields.push(`"expectedBudget" = ?`)
    params.push(updates.expectedBudget)
  }
  if (updates.adminNotes !== undefined) {
    fields.push(`"adminNotes" = ?`)
    params.push(updates.adminNotes)
  }

  fields.push(`"updatedAt" = ?`)
  params.push(new Date().toISOString())

  params.push(id)

  await (db as any).$executeRawUnsafe(
    `UPDATE "CreatorCollaboration" SET ${fields.join(', ')} WHERE "id" = ?`,
    ...params
  )

  const rows = await (db as any).$queryRawUnsafe(
    `SELECT * FROM "CreatorCollaboration" WHERE "id" = ? LIMIT 1`,
    id
  )
  return (rows[0] as CreatorCollabRecord) || null
}

export async function deleteCollaboration(id: string): Promise<boolean> {
  await (db as any).$executeRawUnsafe(
    `DELETE FROM "CreatorCollaboration" WHERE "id" = ?`,
    id
  )
  return true
}
