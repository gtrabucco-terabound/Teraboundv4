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
};

export default nextConfig;
