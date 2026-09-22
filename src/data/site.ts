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
  logo: '/images/logo/youloop-logo.png',
  tagline: 'Keep it Soft Riot. · Fast fashion fills wardrobes. Custom fashion fills moments.',
  copyright: '© 2026 YOU LOOP · Thailand',
  siteUrl: 'https://youloop.co',
  email: 'hello.youloop@gmail.com',
  instagram: 'https://instagram.com/hello.youloop',
};
