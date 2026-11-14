// Fixture positive: approved components, registered assets, approved variants,
// and business-specific composition. The gate must pass this root.
import type { ReactElement } from 'react';

import { ContentGrid01 } from '@nanisoft/prism-ui/blocks/content-grid-01';
import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid';
import { DSIcon } from '@nanisoft/prism-ui/components/ds-icon';
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';
import { DSLogo } from '@nanisoft/prism-ui/components/ds-logo';
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack';

export function PositivePage(): ReactElement {
  return (
    <DSStack gap="md">
      <DSImage
        src="/assets/fixture-hero.webp"
        alt="Fixture hero"
        variant="card"
        width={800}
        height={600}
      />
      <DSLogo src="/assets/fixture-logo.svg" alt="Fixture logo" />
      <DSIcon name="settings" size="md" />
      <ContentGrid01
        headingLevel="h1"
        title="Fixture"
        description="Approved composition."
        variant="cards"
        columns={3}
        entries={[
          {
            id: 'one',
            title: 'Entry',
            summary: 'A short summary.',
            href: '/entry',
            hrefLabel: 'Read Entry',
          },
        ]}
      />
      <DSGrid columns={1} gap="md">
        <span className="flex">One column, one gap.</span>
      </DSGrid>
    </DSStack>
  );
}
