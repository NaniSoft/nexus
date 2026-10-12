import type { ReactElement } from 'react';

/**
 * The Nexus mark, at the sizes a page draws it.
 *
 * The same three stages on one cycle the favicon carries, drawn for the page:
 * every stroke is `currentColor`, so the mark follows the text it sits beside,
 * and the one bright node is the pack's own primary through a token class, so a
 * pack boundary above it repaints the accent without touching the file. A logo
 * that named a hex would be the one element on the page a theme could not reach.
 */
export function NexusLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Nexus"
      className={className ? `site-logo ${className}` : 'site-logo'}
    >
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M17.5 10.1 L22 17.9" />
        <path d="M20.5 20.5 L11.5 20.5" />
        <path d="M10 17.9 L14.5 10.1" />
      </g>
      <circle cx="16" cy="7.5" r="2.8" className="site-logo__accent" />
      <circle cx="23.5" cy="20.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="20.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
