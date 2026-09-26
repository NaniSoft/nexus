'use client';

// Scroll-reveal plumbing (the prism landing prototype's pattern): attach the
// returned ref to a section root; every [data-reveal] descendant gets .is-in
// when it enters the viewport, once. Reduced motion short-circuits to visible.
// Motion law ADR-0001: 280ms decelerating, transform + opacity only.

import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';

export function useRevealRoot(): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const targets = root.querySelectorAll<HTMLElement>('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((target) => target.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    targets.forEach((target) => io.observe(target));
    return () => io.disconnect();
  }, []);

  return ref;
}

/** Spread onto any element: <div {...reveal(60)}> — entrance stagger in ms. */
export function reveal(delayMs = 0): { 'data-reveal': 'true'; style: CSSProperties } {
  return { 'data-reveal': 'true', style: { transitionDelay: `${delayMs}ms` } };
}
