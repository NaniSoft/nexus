// Fixture neg-asset003: a ratio that does not satisfy the presentation.
// The gate must fail with ASSET003.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureWrongRatio() {
  return (
    <DSImage
      src="https://cdn.example.com/fixture-ratio.webp"
      alt="Fixture ratio"
      variant="banner"
      width={800}
      height={600}
    />
  );
}
