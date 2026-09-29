import type { ReactElement } from 'react';

/**
 * The standing status note: the documentation set's one honesty device, rendered at
 * the top of every docs page, every blog post, and the docs index.
 *
 * It is plain HTML with no heading and no role, styled by `.site-status-note`, because
 * it is a note inside a document rather than a region of the page.
 *
 * Forty words used to sit above every document on this site, and the clause after the
 * first sentence was a list of things that are not here, which is a sentence about
 * absence in a page whose whole point is that what is here is true. It is shorter now
 * and it says one thing: this is a designed system, in the present tense, and nothing
 * has shipped. The words are still frozen content, and the honesty law is still the
 * law: no quickstart, no screenshots, no release notes, and a configuration model that
 * is a design-stage model.
 */
export function StatusNote(): ReactElement {
  return (
    <aside className="site-status-note">
      <strong>Status</strong>
      <span>
        Nexus is in active development, so these docs describe a designed system in the
        present tense. No quickstart, no screenshots, no release notes: configuration is
        documented as a design-stage model.
      </span>
    </aside>
  );
}
