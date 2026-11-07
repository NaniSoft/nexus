import type { CSSProperties } from 'react'

/**
 * The Nexus editorial figure: containers on a conveyor, one of them in review.
 *
 * A placeholder for a real photograph of the floor, and a drawing rather than a
 * screenshot, so it carries no product UI it cannot verify. The container stack
 * is the mechanism the page describes: one issue, one fresh container, one
 * result lifted out. The packet rides the same ambient travel the design system
 * publishes, and every container is visible with the motion stopped.
 *
 * It is decorative: the band's title and description carry the meaning.
 */
export function EditorialFloor() {
  return (
    <svg
      viewBox="0 0 1200 675"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <rect width="1200" height="675" className="fill-muted" />

      <g className="text-foreground/20" stroke="currentColor" strokeWidth="1.5" fill="none">
        <path d="M 80 500 H 1120" />
        <path d="M 80 500 L 150 455 H 1050 L 1120 500" />
        <path d="M 80 500 L 150 545 H 1050 L 1120 500" />
        {Array.from({ length: 10 }, (_, index) => (
          <path key={index} d={`M ${170 + index * 94} 455 V 545`} />
        ))}
      </g>

      <g className="text-foreground" fill="currentColor">
        {Array.from({ length: 5 }, (_, index) => {
          const x = 210 + index * 160
          return (
            <g key={index} opacity={index === 3 ? 0.95 : 0.6}>
              <rect x={x} y={352} width="92" height="72" rx="6" opacity="0.12" />
              <rect x={x + 12} y={364} width="68" height="10" rx="3" opacity="0.35" />
              <rect x={x + 12} y={382} width="46" height="8" rx="3" opacity="0.22" />
              <rect x={x + 12} y={396} width="56" height="8" rx="3" opacity="0.22" />
            </g>
          )
        })}
      </g>

      <g className="text-primary" fill="currentColor">
        <rect
          x="760"
          y="368"
          width="18"
          height="40"
          rx="4"
          opacity="0.9"
        />
        <rect
          x="170"
          y="490"
          width="26"
          height="20"
          rx="4"
          className="prism-ambient-travel"
          style={{ '--ambient-travel-distance': '840px' } as CSSProperties}
        />
      </g>

      <g className="text-foreground/30" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="600" cy="180" r="120" strokeDasharray="6 10" />
        <circle cx="600" cy="180" r="70" strokeDasharray="3 8" />
      </g>
    </svg>
  )
}
