import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.synepimelia.app',
  appName: 'Synepimelia',
  webDir: 'out',

  // Server configuration for development (optional)
  server: {
    // Use 'localhost' for local testing, or Vercel URL for live
    // For production, comment this out to use the app assets
    // url: 'https://synepimelia.vercel.app',
    // androidScheme: 'https'
  },

  // Plugins configuration
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
