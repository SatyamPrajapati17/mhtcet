import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cetcounsel.app',
  appName: 'CETCounsel AI',
  server: {
    url: 'https://cetcounsel-ai.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
