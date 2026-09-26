import { createMDX } from 'fumadocs-mdx/next';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static export → Cloudflare Workers Static Assets (the platform's stack
  // precedent, proven by prism.nanisoft.com).
  output: 'export',
  images: {
    unoptimized: true,
  },
};

// fumadocs-mdx's Macro API: compiles content/docs + content/blog and
// transforms lib/source.ts's defineDocs/defineCollections calls. Call, not
// wrap — createMDX() returns the config decorator (prism's finding: handing
// Next the *wrapped function* instead of the config object drops `output`).
export default createMDX()(nextConfig);
