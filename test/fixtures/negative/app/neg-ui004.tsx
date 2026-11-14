// Fixture neg-ui004: classes the emitted sheet does not declare, plus an
// arbitrary value. The gate must fail with UI004 (x2).
export function FixtureArbitraryClasses() {
  return (
    <div className="my-half-baked-box bg-[#bada55]">
      <span className="flex">Depth</span>
    </div>
  );
}
