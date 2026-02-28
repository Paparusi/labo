import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // All pages use Supabase client, force dynamic rendering
  experimental: {},
};

export default nextConfig;
