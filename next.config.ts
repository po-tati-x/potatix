import type { NextConfig } from "next";

// Get the explicit list of all known origins we need to allow
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'development') {
    return [
      'http://potatix.com:3000',
      'http://danchess.potatix.com:3000',
      'http://www.potatix.com:3000',
      // Add any other subdomains you need here
    ];
  }
  
  return [
    'https://potatix.com',
    'https://danchess.potatix.com',
    'https://www.potatix.com',
    // Add any other production subdomains here
  ];
};

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'avatar.vercel.sh' },
      { protocol: 'https', hostname: '15fed70ebe1d7c50715513ab6046afe2.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'storage.potatix.com' },
      { protocol: 'https', hostname: 'image.mux.com' },
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
      {
        // Apply more specific headers to API routes
        source: '/api/:path*',
        headers: [
          {
            // This header will be overridden by the middleware for specific origins
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'development' 
              ? 'http://potatix.com:3000' 
              : 'https://potatix.com',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            // Add Vary header to tell browsers that the response varies based on Origin
            key: 'Vary',
            value: 'Origin',
          },
        ],
      },
    ];
  },
  devIndicators: false
};

export default nextConfig;

