/** Site-wide constants: navigation, social links and the recurring brand copy. */

export type NavLink = {
  label: string;
  href: string;
  /** Matches the `active` prop passed to <SiteNav> so the current page is marked. */
  key: string;
};

export const NAV_LINKS: NavLink[] = [
  { key: 'how', label: 'How it works', href: '/#how' },
  { key: 'collection', label: 'Collection', href: '/#collection' },
  { key: 'createyourlook', label: 'Create Your Look', href: '/#createyourlook' },
  { key: 'journal', label: 'Journal', href: '/journal' },
  { key: 'about', label: 'About', href: '/about' },
];

export const ORDER_CTA = { label: 'Order now', href: '/#collection' };

export const SOCIAL_LINKS = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@youloopcrochet' },
  { label: 'Instagram', href: 'https://www.instagram.com/hello.youloop/' },
  { label: 'LINE', href: 'https://line.me/ti/p/~imaqt80085' },
];

export const BRAND = {
  name: 'YOU LOOP',
  // Two businesses share the domain: YOU LOOP Fashion (this logo, the star
  // mark, used everywhere below) sells customised crochet fashion at
  // youloop.co; YOU LOOP Creation is the B2B merchandise arm at /b2b and
  // uses its own logo instead — see creationLogo, used only there.
  logo: '/images/logo/youloop-logo-star.png',
  /** YOU LOOP Creation's own mark: no star, the interlocking loop emphasised. */
  creationLogo: '/images/logo/youloop-logo.png',
  tagline: 'Keep it Soft Riot.',
  copyright: '© 2026 YOU LOOP · Thailand',
  siteUrl: 'https://youloop.co',
  email: 'hello.youloop@gmail.com',
  instagram: 'https://instagram.com/hello.youloop',
};
