import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export → Cloudflare Workers Static Assets (the platform's stack
  // precedent, proven by prism.nanisoft.com).
  output: 'export',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
