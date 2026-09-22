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
      { protocol: 'https', hostname: 'www.justahotels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'vl-prod-static.b-cdn.net', pathname: '/**' },
      { protocol: 'https', hostname: 'www.jumpinheights.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media-cdn.tripadvisor.com', pathname: '/**' },
      { protocol: 'https', hostname: 'dynamic-media-cdn.tripadvisor.com', pathname: '/**' },
      { protocol: 'https', hostname: 'travelistaan.com', pathname: '/**' },
      { protocol: 'https', hostname: '5.imimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'blog.ecohospitality.in', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'd26dp53kz39178.cloudfront.net', pathname: '/**' },
      { protocol: 'https', hostname: 'd1kxjw4xo8k4dx.cloudfront.net', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.dev.beautifuldestinations.app', pathname: '/**' },
      { protocol: 'https', hostname: 'thrillfactory.in', pathname: '/**' },
      { protocol: 'https', hostname: 'p0.piqsels.com', pathname: '/**' },
      { protocol: 'https', hostname: 'curlytales.com', pathname: '/**' },
      { protocol: 'https', hostname: 'media1.thrillophilia.com', pathname: '/**' },
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