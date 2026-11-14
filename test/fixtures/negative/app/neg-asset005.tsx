// Fixture neg-asset005: an unapproved format. The gate must fail with ASSET005.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureInvalidFormat() {
  return (
    <DSImage
      src="/assets/fixture-old.gif"
      alt="Fixture gif"
      variant="card"
      width={1600}
      height={1200}
    />
  );
}
