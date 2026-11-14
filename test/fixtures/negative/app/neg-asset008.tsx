// Fixture neg-asset008: an inline SVG outside the registry.
// The gate must fail with ASSET008.
export function FixtureInlineSvg() {
  return (
    <svg viewBox="0 0 32 32" role="presentation" aria-hidden="true">
      <path d="M4 16 L28 16" />
    </svg>
  );
}
