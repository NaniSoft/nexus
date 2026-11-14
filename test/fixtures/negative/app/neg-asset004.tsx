// Fixture neg-asset004: a local asset no registry entry covers.
// The gate must fail with ASSET004.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureUnregisteredAsset() {
  return (
    <DSImage
      src="/assets/unregistered.webp"
      alt="Fixture unregistered"
      variant="card"
      width={1600}
      height={1200}
    />
  );
}
