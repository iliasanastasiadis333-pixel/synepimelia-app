import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor mobile app
  output: 'export',

  // Required for Capacitor file:// URLs
  trailingSlash: true,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Ensure trailing slashes for Capacitor routing
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

export default nextConfig;
