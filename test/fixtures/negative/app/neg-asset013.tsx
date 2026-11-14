// Fixture neg-asset013: a source under the avatar resolution target.
// The gate must fail with ASSET013.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureSmallSource() {
  return (
    <DSImage
      src="https://cdn.example.com/fixture-tiny.webp"
      alt="Fixture tiny"
      variant="avatar"
      width={32}
      height={32}
    />
  );
}
