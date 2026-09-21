import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { dmSans, playfair } from '@/lib/fonts';
import { BRAND } from '@/data/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: {
    default: 'YOU LOOP — Your Main Character Era Starts Here · Custom Crochet Fashion',
    template: '%s | YOU LOOP',
  },
  description:
    'YOU LOOP — Your main character era starts here. Custom crochet fashion made to order, guided by Soft Riot energy. Fast fashion fills wardrobes. Custom fashion fills moments. Custom fashion for your most intentional moment. Keep it Soft Riot. Made by creators, for you, once.',
  keywords: [
    'custom crochet fashion Thailand',
    'made to order crochet dress',
    'crochet co-ord set',
    'handmade fashion Bangkok',
    'Soft Riot',
    'YOU LOOP',
    'custom birthday outfit',
    'intentional fashion',
    'slow fashion Thailand 2026',
  ],
  icons: {
    icon: [
      { url: '/images/favicon/favicon.ico', sizes: 'any' },
      { url: '/images/favicon/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/images/favicon/favicon-48.png', type: 'image/png', sizes: '48x48' },
    ],
    apple: [{ url: '/images/favicon/favicon-180.png', sizes: '180x180' }],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
