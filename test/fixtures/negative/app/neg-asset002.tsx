// Fixture neg-asset002: impossible intrinsic dimensions. The gate must fail with ASSET002.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureImpossibleDimensions() {
  return (
    <DSImage
      src="https://cdn.example.com/fixture-zero.webp"
      alt="Fixture zero"
      variant="card"
      width={0}
      height={0}
    />
  );
}
