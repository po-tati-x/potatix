import type { NextConfig } from "next";

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
  devIndicators: false
};

export default nextConfig;

