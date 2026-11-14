// Fixture neg-ui010: direct DOM styling. The gate must fail with UI010.
export function paintFixture() {
  document.getElementById('fixture-box')!.style.color = 'red';
}
