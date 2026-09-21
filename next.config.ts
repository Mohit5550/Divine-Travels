import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Remove ignoreBuildErrors to show type errors at build time
    // fix type errors instead of ignoring them
  },
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/:path((?!api|_next|assets|images|favicon.ico|robots.txt|sitemap.xml|payment|reset-password).*)',
        destination: '/',
      },
    ];
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