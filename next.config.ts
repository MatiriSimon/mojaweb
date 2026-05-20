import type { NextConfig } from "next";

const allowedOrigins = [
  process.env.NEXT_PUBLIC_ALLOWED_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;