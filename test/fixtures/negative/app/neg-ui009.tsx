// Fixture neg-ui009: a font import outside the design system.
// The gate must fail with UI009.
import { Inter } from 'next/font/google';

export const FIXTURE_FONT = Inter({ subsets: ['latin'] });
