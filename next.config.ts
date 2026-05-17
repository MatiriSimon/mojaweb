/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "refactored-zebra-5g54xg5rjrxqf77xp-3000.app.github.dev", // The domain from your terminal
        "localhost:3000"
      ],
    },
  },
};

export default nextConfig;
