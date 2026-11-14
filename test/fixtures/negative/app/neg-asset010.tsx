// Fixture neg-asset010: an arbitrary presentation prop on a DS asset.
// The gate must fail with ASSET010.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureArbitraryFit() {
  return (
    <DSImage
      src="https://cdn.example.com/fixture-fit.webp"
      alt="Fixture fit"
      variant="card"
      width={1600}
      height={1200}
      objectFit="contain"
    />
  );
}
