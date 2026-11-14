// Fixture neg-asset012: no intrinsic dimensions. The gate must fail with ASSET012.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureNoDimensions() {
  return (
    <DSImage
      src="https://cdn.example.com/fixture-plain.webp"
      alt="Fixture plain"
      variant="card"
    />
  );
}
