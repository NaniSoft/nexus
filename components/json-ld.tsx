import type { ReactElement } from 'react';

/**
 * Structured data, rendered as the script tag a crawler reads.
 *
 * The payload is built from the same constants the page renders, so the structured
 * data and the visible page cannot disagree about what this site is. The one hazard
 * of inline JSON is a closing script tag smuggled through a string, so every `<` is
 * escaped and the payload cannot terminate its own tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
