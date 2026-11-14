// Fixture neg-ui006: custom CSS variable reads and a CSSProperties cast.
// The gate must fail with UI006.
import type { CSSProperties } from 'react';

export const FIXTURE_VAR = 'var(--fixture-brand)';

export function FixtureCustomProperty() {
  const casts = { marginTop: '1rem' } as CSSProperties;
  return <div className="flex" data-vars={JSON.stringify(casts)}>{FIXTURE_VAR}</div>;
}
