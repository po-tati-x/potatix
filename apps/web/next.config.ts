import { config as loadEnv } from "dotenv-flow";
import { join } from "path";
import type { NextConfig } from "next";

// Load environment variables from monorepo root
loadEnv({ path: join(__dirname, "../..") });

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "avatar.vercel.sh" },
      {
        protocol: "https",
        hostname: "15fed70ebe1d7c50715513ab6046afe2.r2.cloudflarestorage.com",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "storage.potatix.com" },
      { protocol: "https", hostname: "image.mux.com" }
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
        ],
      },
      {
        // Apply more specific headers to API routes
        source: "/api/:path*",
        headers: [
          {
            // Note: This header will be dynamically overridden by the middleware
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          {
            // Add Vary header to tell browsers that the response varies based on Origin
            key: "Vary",
            value: "Origin",
          },
        ],
      },
    ];
  },
  devIndicators: false,
  // Webpack config for monorepo packages and pintura
  transpilePackages: ['@potatix/db', '@potatix/auth', '@pqina/pintura', '@pqina/react-pintura'],
  // This is required for subdomain routing in development
  allowedDevOrigins: ['potatix.com', '*.potatix.com'],
};

export default nextConfig;
