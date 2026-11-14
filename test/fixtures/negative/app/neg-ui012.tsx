// Fixture neg-ui012: a locally implemented visual primitive. The gate must fail with UI012.
export function Button({ label }: { label: string }) {
  return <button type="button">{label}</button>;
}

export function FixtureLocalPrimitive() {
  return <Button label="Fixture" />;
}
