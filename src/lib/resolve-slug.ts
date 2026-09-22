import { db } from '@/lib/db'

export function slugify(input: string): string {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'item'
}

// Normalize a user/admin-supplied slug so dirty values (spaces, caps,
// special chars) can never be saved. Always use on write paths.
export function cleanSlug(input: string): string {
  return slugify(input);
}

// Resolve a package by cuid id first, then by slug.
// Keeps old cuid links/bookings working while new URLs use slugs.
export async function resolvePackage(idOrSlug: string) {
  const byId = await db.package.findUnique({ where: { id: idOrSlug } }).catch(() => null)
  if (byId) return byId
  return db.package.findFirst({ where: { slug: idOrSlug } }).catch(() => null)
}

export async function resolvePackageId(idOrSlug: string): Promise<string | null> {
  const pkg = await resolvePackage(idOrSlug)
  return pkg ? pkg.id : null
}

// Resolve a destination by cuid id first, then by slug.
export async function resolveDestination(idOrSlug: string) {
  const byId = await db.destination.findUnique({ where: { id: idOrSlug } }).catch(() => null)
  if (byId) return byId
  return (db.destination.findFirst({ where: { slug: idOrSlug } } as any) as Promise<any>).catch(() => null)
}

export async function resolveDestinationId(idOrSlug: string): Promise<string | null> {
  const dest = await resolveDestination(idOrSlug)
  return dest ? dest.id : null
}
