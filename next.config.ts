import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/:path((?!api|_next|assets|images|favicon.ico|robots.txt|sitemap.xml|payment|reset-password).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;
