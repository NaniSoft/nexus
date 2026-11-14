import type { ReactElement } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@nanisoft/prism-ui/components/alert';

/**
 * The standing status note: the documentation set's one honesty device, rendered at
 * the top of every docs page, every blog post, and the docs index.
 *
 * It is the design system's `Alert`: a callout carrying an important message, with
 * the short heading and the sentence under it. The words are the same as the note
 * it replaces, and remain frozen content under the honesty law: no quickstart, no
 * screenshots, no release notes, and a configuration model that is a design-stage
 * model.
 *
 * Forty words used to sit above every document on this site, and the clause after
 * the first sentence was a list of things that are not here, which is a sentence
 * about absence in a page whose whole point is that what is here is true. It is
 * shorter now and it says one thing: this is a designed system, in the present
 * tense, and nothing has shipped.
 */
export function StatusNote(): ReactElement {
  return (
    <Alert>
      <AlertTitle>Status</AlertTitle>
      <AlertDescription>
        Nexus is in active development, so these docs describe a designed system in the
        present tense. No quickstart, no screenshots, no release notes: configuration
        is documented as a design-stage model.
      </AlertDescription>
    </Alert>
  );
}
