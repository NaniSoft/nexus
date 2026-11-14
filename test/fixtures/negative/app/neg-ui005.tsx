// Fixture neg-ui005: an unapproved UI library import. The gate must fail with UI005.
import { ArrowRight } from 'lucide-react';

export function FixtureUnapprovedIcon() {
  return (
    <span>
      <ArrowRight />
      Label
    </span>
  );
}
