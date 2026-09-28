import type { ReactElement } from 'react';

/**
 * The standing status note: the documentation set's one honesty device, rendered at
 * the top of every docs page, every blog post, and the docs index.
 *
 * It is plain HTML with no heading and no role, styled by `.site-status-note`, because
 * it is a note inside a document rather than a region of the page. The words are
 * frozen content: they are the sentence the site's honesty law is made of, and the
 * migration this file was rewritten in did not touch them.
 */
export function StatusNote(): ReactElement {
  return (
    <aside className="site-status-note">
      <strong>Status</strong>
      <span>
        Nexus is in active development. These docs describe the designed system in the present
        tense — there is no quickstart, no screenshots, and no release notes, because nothing has
        shipped. Configuration is documented as a design-stage model.
      </span>
    </aside>
  );
}
