import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      "https://cksjlnxjgaxczibuuhgv.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrc2psbnhqZ2F4Y3ppYnV1aGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDM2NDQsImV4cCI6MjEwMjg3OTY0NH0.B37lOaMMVc0Jb7fkcrYR__PD0-SmxDoRd36DFktVFA0",
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
