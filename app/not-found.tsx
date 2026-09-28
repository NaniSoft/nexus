import type { ReactNode } from 'react';

import { NotFoundPage } from '@nanisoft/prism-ui/pages';

/**
 * The page a reader lands on when an address does not resolve.
 *
 * It is the design system's own not-found Page, so a 404 belongs to the site rather
 * than looking like a page that fell over. The code is the page's heading, the sentence
 * is under it, and the two ways out are the Page's own link row.
 *
 * The sentence is split at the destinations on purpose. The old page carried all of it
 * as one paragraph with the two links inline, which is a shape a Page has no prop for:
 * it has a description, which is a string, and a link row, which is a list. The
 * conjunction and the full stop are the two words that did not survive the move and
 * they are recorded as removed in the parity expectations rather than quietly kept.
 */
export default function NotFound(): ReactNode {
  return (
    <NotFoundPage
      code="404"
      title="This page does not exist (yet)."
      description="The design is documented — try"
      linksLabel="Ways out"
      links={[
        { label: 'the docs', href: '/docs' },
        { label: 'the landing', href: '/' },
      ]}
    />
  );
}
