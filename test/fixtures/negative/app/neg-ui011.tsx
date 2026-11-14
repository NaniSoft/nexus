// Fixture neg-ui011: application-owned responsive styling. The gate must fail with UI011.
export function useFixtureMediaQuery() {
  return window.innerWidth > 768;
}

export function FixtureMediaQuery() {
  const wide = useFixtureMediaQuery();
  return <div className="flex">{wide ? 'Wide' : 'Narrow'}</div>;
}
