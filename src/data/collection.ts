/**
 * The three product cards on the home page.
 *
 * Each card has its own auto-rotating photo carousel. In the original page the
 * twelve photos were base64 data URIs inside the HTML (about 350 KB of the
 * 600 KB page); they are now plain files under /images/cards.
 */

export type CarouselSlide = {
  img: string;
  label: string;
  /** Colour of the active dot, picked to match the photo. */
  dot: string;
};

export type CollectionCard = {
  id: string;
  href: string;
  code: string;
  name: string;
  description: string;
  tags: string[];
  price: string;
  currency: string;
  badge: { label: string; background: string; color: string };
  slides: CarouselSlide[];
  /** Each carousel advances on its own timer so they feel independent. */
  rotateMs: number;
};

export const COLLECTION_CARDS: CollectionCard[] = [
  {
    id: 'sr01',
    href: '/collection/sr01',
    code: 'SR-01',
    name: 'The Birthday Set',
    description:
      'The original. A crochet mini dress with signature ruffle hem, arm warmers, and leg warmers. Made from the dress Yu wore to her performance.',
    tags: ['Mini dress', 'Arm warmers', 'Leg warmers', '4 moods'],
    price: '2,690',
    currency: 'THB',
    badge: { label: 'New Design', background: 'var(--rose)', color: 'white' },
    slides: [
      { img: '/images/cards/sr01_soft_riot.jpg', label: 'Soft Riot', dot: '#C4708A' },
      { img: '/images/cards/sr01_midnight.jpg', label: 'Midnight', dot: '#4A1A5A' },
      { img: '/images/cards/sr01_garden.jpg', label: 'Garden', dot: '#8FBC5A' },
      { img: '/images/cards/sr01_golden_hour.jpg', label: 'Golden Hour', dot: '#E8D8B0' },
    ],
    rotateMs: 3200,
  },
  {
    id: 'sr02',
    href: '/collection/sr02',
    code: 'SR-02',
    name: 'The Soft Riot Crop Set',
    description:
      'Two pieces, one intention. Tie-front bralette with open-weave mesh overlay, and a high-waist mini skirt. Soft on the surface. Sharp underneath.',
    tags: ['Bralette + overlay', 'Mini skirt', '2 pieces', '4 moods'],
    price: '1,990',
    currency: 'THB',
    badge: { label: 'New Design', background: 'var(--rose)', color: 'white' },
    slides: [
      { img: '/images/cards/sr02_soft_riot.jpg', label: 'Soft Riot', dot: '#C4708A' },
      { img: '/images/cards/sr02_midnight.jpg', label: 'Midnight', dot: '#4A1A5A' },
      { img: '/images/cards/sr02_garden.jpg', label: 'Garden', dot: '#8FBC5A' },
      { img: '/images/cards/sr02_golden_hour.jpg', label: 'Golden Hour', dot: '#E8D8B0' },
    ],
    rotateMs: 3800,
  },
  {
    id: 'hood',
    href: '/collection/srac01',
    code: 'SR-AC01',
    name: 'The Soft Riot Hood',
    description:
      'The main character accessory. Open mesh crochet pixie hood with braided tassel ties. Wear it loose, tied, or wrapped. Unisex. 8 colourways.',
    tags: ['Crochet hood', 'Braided ties', '8 colours', 'Unisex'],
    price: '990',
    currency: 'THB',
    badge: { label: 'Unisex', background: 'var(--gold)', color: '#f9f5ee' },
    slides: [
      { img: '/images/cards/hood_dusty.jpg', label: 'Dusty Rose', dot: '#C4708A' },
      { img: '/images/cards/hood_midnight.jpg', label: 'Deep Plum', dot: '#4A1A5A' },
      { img: '/images/cards/hood_cherry.jpg', label: 'Cherry Red', dot: '#9B1C2E' },
      { img: '/images/cards/hood_charcoal.jpg', label: 'Charcoal · Him', dot: '#2A2A2A' },
    ],
    rotateMs: 4200,
  },
];

/** The four "How it works" steps on the home page. */
export const HOW_IT_WORKS = [
  {
    title: 'Choose your mood',
    body: 'Pick a set from our collection that matches how you want to feel — or start with your own inspiration.',
  },
  {
    title: 'We make it',
    body: 'Your order goes to one of our selectively chosen artisan women — skilled makers who work independently and are paid fairly for their craft and time.',
  },
  {
    title: 'You receive it',
    body: '10–14 days. Packed with care. Shipped to your door. A piece that exists because you do.',
  },
  {
    title: 'Wear your intention',
    body: 'This was made for your moment. Your birthday. Your graduation. Your first date. Your spotlight. Your main character moment.',
  },
];

export const MANIFESTO_PILLS = [
  'Handmade',
  'Made to order',
  'No overproduction',
  'Creator economy',
  'Made to order',
];
