// Fixture neg-asset014: a presentation class that re-sizes the frame.
// The gate must fail with ASSET014.
import { DSImage } from '@nanisoft/prism-ui/components/ds-image';

export function FixtureFrameBypass() {
  return (
    <DSImage
      src="https://cdn.example.com/fixture-frame.webp"
      alt="Fixture frame"
      variant="card"
      width={1600}
      height={1200}
      className="aspect-video"
    />
  );
}
