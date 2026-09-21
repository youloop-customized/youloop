/**
 * Self-hosted Google fonts.
 *
 * The static site pulled these from fonts.googleapis.com on every page, which
 * blocked first render. next/font downloads them at build time and serves them
 * from our own origin, with no layout shift and no third-party request.
 *
 * Playfair Display + DM Sans are the main brand pair. Fraunces + Inter are used
 * only by /b2b and /zucity, which have their own visual language, so those two
 * are imported by those pages rather than by the root layout.
 */

import { DM_Sans, Fraunces, Inter, Playfair_Display } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-playfair',
});

export const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  variable: '--font-dm-sans',
});

export const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-fraunces',
});

export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});
