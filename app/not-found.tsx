// Typography/DisplayTitle ride the site's client boundary (components/prism-client.tsx).
import Link from 'next/link';
import { DisplayTitle, Text } from '@/components/prism-client';
import type { ReactNode } from 'react';

export default function NotFound(): ReactNode {
  return (
    <section className="placeholder-hero">
      <DisplayTitle>404</DisplayTitle>
      <Text type="secondary">This page does not exist (yet).</Text>
      <p style={{ opacity: 0.78 }}>
        The design is documented — try <Link href="/docs">the docs</Link> or{' '}
        <Link href="/">the landing</Link>.
      </p>
    </section>
  );
}
