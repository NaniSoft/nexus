import type { ReactElement } from 'react';

// The standing status note — the docs' one honesty device, rendered at the top
// of every docs page (ticket 06: "one clear in-development status note … at the
// top of docs"). Marked up as plain HTML, styled by .site-status-note.
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
