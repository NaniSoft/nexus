import { ImageResponse } from 'next/og';

/**
 * The share card.
 *
 * **It is generated once, at build.** Under `output: 'export'` a metadata route has
 * to be told it is static, and the image is painted from constants with no request
 * to be dynamic with. Without a card, every link to this site shared into a chat
 * client or a social platform renders as bare text, which is the one first
 * impression the site does not get to make in person.
 *
 * **The card is the site's own default mode.** Nexus opens dark, on the cyan pack,
 * so the card is the dark cyan theme's own values written out as literals: an
 * image is painted once into a bitmap, there is no cascade and no `data-pack`, and
 * a token read here would resolve to the neutral base and produce a card that
 * contradicts the page it previews.
 *
 * The mark beside the family chips is Prism's spectrum, drawn as the gradient it
 * is: the design system's own mark carries no single hue, so the card shows the
 * bar's product switcher the way the site itself draws it.
 */
export const alt = 'Nexus, the Agent Factory'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export const dynamic = 'force-static'

const GROUND = '#15191a'
const INK = '#e9eeef'
const MUTED = '#c4ccce'
const HAIRLINE = '#3d4445'
const CYAN = '#7fdaf0'
const SKY = '#9bd1ff'
const MINT = '#9ddcad'
const GOLD = '#edc47d'

const SPECTRUM =
  'linear-gradient(90deg, #ec88a0 0%, #bc97e7 25%, #73bf88 50%, #6cb2eb 75%, #e4965e 100%)'

const CARD_LINE = 'A coding agent takes a GitHub issue and returns a reviewed, merged pull request.'

/**
 * The mark, as the card draws it: the same agent loop the favicon carries, painted
 * in the card's own literals and embedded as a data URI, because the renderer
 * paints a bitmap and cannot resolve cascade classes. A platform that renders no
 * card at all loses nothing; a platform that renders it shows the product's mark
 * and not only its name.
 */
const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="150" height="150" fill="none">
  <g stroke="#7fdaf0" stroke-width="2.4" stroke-linecap="round">
    <path d="M17.5 10.1 L22 17.9"/>
    <path d="M20.5 20.5 L11.5 20.5"/>
    <path d="M10 17.9 L14.5 10.1"/>
  </g>
  <circle cx="16" cy="7.5" r="2.8" fill="#cdf5ff"/>
  <circle cx="23.5" cy="20.5" r="2.6" fill="none" stroke="#7fdaf0" stroke-width="1.6"/>
  <circle cx="8.5" cy="20.5" r="2.6" fill="none" stroke="#7fdaf0" stroke-width="1.6"/>
</svg>`
const MARK_URI = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString('base64')}`

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: GROUND,
          color: INK,
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', fontSize: 26, letterSpacing: 2, color: CYAN }}>
              NANISOFT · THE AGENT FACTORY
            </div>
            <img src={MARK_URI} width={140} height={140} style={{ opacity: 0.9 }} />
          </div>
          <div style={{ display: 'flex', fontSize: 110, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>
            Nexus
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: MUTED, lineHeight: 1.35, maxWidth: 900 }}>
            {CARD_LINE}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `2px solid ${HAIRLINE}`,
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, color: MUTED }}>nexus.nanisoft.com</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[SKY, CYAN, MINT, GOLD].map((colour) => (
                <div
                  key={colour}
                  style={{ display: 'flex', width: 30, height: 30, borderRadius: 15, background: colour }}
                />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                width: 54,
                height: 30,
                borderRadius: 15,
                background: SPECTRUM,
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  )
}
