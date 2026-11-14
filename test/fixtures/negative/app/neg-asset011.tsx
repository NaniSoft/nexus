// Fixture neg-asset011: srcSet without a sizes pair.
// The gate must fail with ASSET011.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureSrcSetOnly() {
  return (
    <DSImage
      src="https://cdn.example.com/fixture-srcset.webp"
      alt="Fixture srcset"
      variant="card"
      width={1600}
      height={1200}
      srcSet="/assets/fixture-srcset.webp 2x"
    />
  );
}
