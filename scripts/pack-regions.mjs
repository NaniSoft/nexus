/**
 * Which region of this page a pack boundary belongs to.
 *
 * The law is in `@nanisoft/prism-ui/gates`: a boundary lands on a mark and
 * nowhere else, and a declared region set is the whole of what may carry a second
 * pack. What is here is the half only this site knows, and it is here rather than
 * in the kit because naming a region means knowing this site's own DOM. Three
 * other repositories run the same gate and each answers the same question about a
 * different page.
 *
 * Regions are named by the structure the catalogue publishes rather than by a
 * selector invented for the gate: a mark inside the switcher is the switcher's, a
 * mark in a brand lockup is the lockup's, and a mark inside `<main>` is named by
 * the ordinal its own band publishes, which is a string a reader of the page can
 * see. A band with no ordinal returns null rather than a guess, because a region
 * the gate cannot name is a region it cannot hold to `scripts/pack-map.json`.
 *
 * Read by `pnpm check`. Nothing else imports it, and that is deliberate: this is
 * a declaration about one page, not a library.
 */
export function regionOf(element) {
  if (element.closest('[data-slot="product-switcher"]')) return 'header.switcher'
  if (element.closest('header')) return 'header.brand'
  if (element.closest('footer')) return 'footer.brand'
  const section = element.closest('main section')
  if (!section) return null
  const ordinal = [...section.querySelectorAll('span, p, div > *')]
    .map((candidate) => (candidate.textContent ?? '').trim())
    .find((text) => /^\d{2}$/.test(text))
  if (!ordinal) return null
  return `landing.${ordinal}`
}
