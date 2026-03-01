import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // All pages use Supabase client, force dynamic rendering
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
