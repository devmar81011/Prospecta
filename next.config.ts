import type { NextConfig } from "next";

const PLACEHOLDER_URL_MARKERS = [
  "mock-project",
  "your_supabase",
  "YOUR-PROJECT-REF",
  "your-project",
];

const REAL_SUPABASE_URL = "https://cksjlnxjgaxczibuuhgv.supabase.co";
const REAL_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrc2psbnhqZ2F4Y3ppYnV1aGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMDM2NDQsImV4cCI6MjEwMjg3OTY0NH0.B37lOaMMVc0Jb7fkcrYR__PD0-SmxDoRd36DFktVFA0";

const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      !envUrl || PLACEHOLDER_URL_MARKERS.some((marker) => envUrl.includes(marker))
        ? REAL_SUPABASE_URL
        : envUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      !envKey || envKey.includes("your-anon-key") || envKey.includes("your_supabase_anon_key")
        ? REAL_SUPABASE_ANON_KEY
        : envKey,
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
