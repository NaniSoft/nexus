// Fixture neg-asset006: a registered asset over its size budget.
// The gate must fail with ASSET006.
import { DSLogo } from '@nanisoft/prism-ui/components/ds-logo';

export function FixtureOversizedAsset() {
  return <DSLogo src="/large-logo.svg" alt="Fixture logo" />;
}
