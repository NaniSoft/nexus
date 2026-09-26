import type { ReactElement } from 'react';

import { Landing } from '@/components/landing/Landing';
import './landing.css';

// The landing is a client subtree (the reveal observer and the loop canvas both
// need the DOM); this page stays a server component and owns nothing but the
// composition.
export default function HomePage(): ReactElement {
  return <Landing />;
}
