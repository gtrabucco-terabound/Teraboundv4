import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@terabound/domain',
    '@terabound/firebase-client',
    '@terabound/config',
    '@terabound/repositories',
    '@terabound/auth',
    '@terabound/ui',
  ],
  experimental: {
    // Habilita imports de packages del monorepo
  },
};

export default nextConfig;
