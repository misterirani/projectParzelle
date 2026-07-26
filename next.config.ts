import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  experimental: {
    serverActions: {
      // Standard-Limit von Next.js ist 1 MB - Handyfotos sind oft größer.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
