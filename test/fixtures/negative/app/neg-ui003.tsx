// Fixture neg-ui003: a hardcoded colour literal. The gate must fail with UI003.
export const FIXTURE_HEX = '#ff0000';

export function FixtureColour() {
  return <div className="flex">{FIXTURE_HEX}</div>;
}
