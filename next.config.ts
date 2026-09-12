import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep API routes enabled for OAuth and other server functions
  // For Capacitor mobile app, we'll use Vercel URL as webDir
  // or build with target: 'export' only for static pages

  // Disable image optimization for better performance
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for URL consistency
  trailingSlash: false,
};

export default nextConfig;
