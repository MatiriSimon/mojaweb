import type { NextConfig } from "next";

const codespaceName = process.env.CODESPACE_NAME;

const allowedOrigins = [
  process.env.NEXT_PUBLIC_ALLOWED_ORIGIN,
  "http://localhost:3000",
  "localhost:3000",
  "http://127.0.0.1:3000",
  "127.0.0.1:3000",
  // GitHub Codespaces: with/without port, with/without protocol prefix
  ...(codespaceName
    ? [
        `https://${codespaceName}.app.github.dev`,
        `https://${codespaceName}-3000.app.github.dev`,
        `${codespaceName}.app.github.dev`,
        `${codespaceName}-3000.app.github.dev`,
      ]
    : []),
].filter(Boolean) as string[];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
    turbopack: {
    root: process.cwd(),
  },
  cacheMaxMemorySize: 52 * 1024 * 1024, // 52MB cache for faster builds
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60 seconds
    pagesBufferLength: 5,
  },

  experimental: {
    serverActions: { allowedOrigins },
  },
};

export default nextConfig;