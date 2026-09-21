// Typography/DisplayTitle ride the site's client boundary (components/prism-client.tsx).
import { DisplayTitle, Text } from '@/components/prism-client';
import type { ReactNode } from 'react';

export default function NotFound(): ReactNode {
  return (
    <section className="placeholder-hero">
      <DisplayTitle>404</DisplayTitle>
      <Text type="secondary">This page does not exist (yet).</Text>
    </section>
  );
}
