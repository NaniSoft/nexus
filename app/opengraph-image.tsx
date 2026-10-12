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
          <div style={{ display: 'flex', fontSize: 26, letterSpacing: 2, color: CYAN }}>
            NANISOFT · THE AGENT FACTORY
          </div>
          <div style={{ display: 'flex', fontSize: 110, fontWeight: 600, letterSpacing: -3, lineHeight: 1 }}>
            Nexus
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: MUTED, lineHeight: 1.35 }}>
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
