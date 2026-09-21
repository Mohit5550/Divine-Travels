import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Remove ignoreBuildErrors to show type errors at build time
    // fix type errors instead of ignoring them
  },
  reactStrictMode: true,
  // SPA deep-link support: serve the Home shell for client-side routes.
  // NOTE: no negative-lookahead regex here — Vercel's Rust router does not
  // support lookahead, which caused /api/*, /robots.txt and /sitemap.xml
  // to be rewritten to `/`. Explicit paths only.
  async rewrites() {
    const spaStatic = [
      '/rishikesh',
      '/haridwar',
      '/mussoorie',
      '/nainital',
      '/hill-stations',
      '/char-dham',
      '/rafting',
      '/bike-rental',
      '/taxi',
      '/taxi/book',
      '/trekking',
      '/adventure',
      '/domestic',
      '/spiritual',
      '/international',
      '/hotels',
      '/camping',
      '/gallery',
      '/collaborate',
      '/about',
      '/contact',
      '/dashboard',
      '/admin',
      '/privacy',
      '/terms',
      '/refund',
      '/cancellation',
      '/cookie-policy',
      '/blog',
      '/booking-success',
    ]
    return [
      ...spaStatic.map((source) => ({ source, destination: '/' })),
      { source: '/package/:id/book', destination: '/' },
      { source: '/package/:id', destination: '/' },
      { source: '/hotel/:id', destination: '/' },
      { source: '/company/:id', destination: '/' },
      { source: '/blog/:id', destination: '/' },
      { source: '/destination/:slug', destination: '/' },
    ]
  },
  // Enable compression
  compress: true,
  // Optimize images
  images: {
    domains: ['localhost', 'ik.imagekit.io', 'images.unsplash.com'],
    // MIME types, not file extensions
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  // Enable caching headers
  async headers() {
    return [
      {
        source: '/:all*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;