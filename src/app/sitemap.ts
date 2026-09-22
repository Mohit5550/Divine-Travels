import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

const BASE_URL = 'https://divinetravels.in'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    // High-value listing pages (real SPA routes served via rewrites)
    ...[
      '/rishikesh', '/haridwar', '/mussoorie', '/nainital', '/hill-stations', '/char-dham',
      '/rafting', '/bike-rental', '/taxi', '/trekking', '/adventure',
      '/domestic', '/spiritual', '/international',
      '/hotels', '/camping', '/gallery', '/collaborate', '/about', '/contact', '/blog',
    ].map((p) => ({
      url: `${BASE_URL}${p}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  let packages: { slug: string; updatedAt: Date }[] = []
  let destinations: { slug: string; updatedAt: Date }[] = []
  let blogPosts: { slug: string; updatedAt: Date }[] = []

  try {
    packages = await db.$queryRawUnsafe<{ slug: string; updatedAt: Date }[]>(
      `SELECT "slug", "updatedAt" FROM "Package" WHERE "active" = 1 AND "slug" IS NOT NULL`
    )
  } catch { /* ignore */ }

  try {
    destinations = await db.$queryRawUnsafe<{ slug: string; updatedAt: Date }[]>(
      `SELECT COALESCE("slug", "id") AS "slug", "updatedAt" FROM "Destination" WHERE "active" = 1`
    )
  } catch { /* ignore */ }

  try {
    blogPosts = await db.$queryRawUnsafe<{ slug: string; updatedAt: Date }[]>(
      `SELECT "slug", "updatedAt" FROM "Blog" WHERE "published" = 1 AND "slug" IS NOT NULL`
    )
  } catch { /* ignore */ }

  const packagePages: MetadataRoute.Sitemap = packages.map((p) => ({
    url: `${BASE_URL}/package/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const destinationPages: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${BASE_URL}/destination/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${BASE_URL}/blog/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...packagePages, ...destinationPages, ...blogPages]
}
