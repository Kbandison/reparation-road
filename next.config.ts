import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'nviahrhrupqvwyglaxlj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/archives/**',
      },
      {
        protocol: 'https',
        hostname: 'nviahrhrupqvwyglaxlj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/archive-images/**',
      },
      {
        protocol: 'https',
        hostname: 'nviahrhrupqvwyglaxlj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/revolutionary_soldiers/**',
      },
      {
        protocol: 'https',
        hostname: 'nviahrhrupqvwyglaxlj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/revolutionary-soldiers/**',
      },
      {
        protocol: 'https',
        hostname: 'nviahrhrupqvwyglaxlj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/ex-slave-pension/**',
      },
      {
        protocol: 'https',
        hostname: 'nviahrhrupqvwyglaxlj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/brit-span-fren/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Use unoptimized to bypass Next.js image optimization and serve directly from Supabase
    // This reduces latency by avoiding the Next.js image optimization server
    unoptimized: false, // Keep optimized for now, but can set to true if still slow
  },
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  // Disable powered by header
  poweredByHeader: false,
};

export default nextConfig;
