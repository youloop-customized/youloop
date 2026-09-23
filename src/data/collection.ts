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
  /** Color of the active dot, picked to match the photo. */
  dot: string;
};

export type CollectionCard = {
  id: string;
  href: string;
  code: string;
  name: string;
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
    tags: ['Mini dress', 'Arm warmers', 'Leg warmers', '4 colors'],
    price: '2,690',
    currency: 'THB',
    badge: { label: 'New Design', background: 'var(--rose)', color: 'white' },
    slides: [
      { img: '/images/sr01/soft_riot.jpg', label: 'Soft Riot', dot: '#C4708A' },
      { img: '/images/sr01/midnight.jpg', label: 'Midnight', dot: '#4A1A5A' },
      { img: '/images/sr01/garden.jpg', label: 'Garden', dot: '#8FBC5A' },
      { img: '/images/sr01/golden_hour.jpg', label: 'Golden Hour', dot: '#E8D8B0' },
    ],
    rotateMs: 3200,
  },
  {
    id: 'sr02',
    href: '/collection/sr02',
    code: 'SR-02',
    name: 'The Soft Riot Crop Set',
    tags: ['Bralette + overlay', 'Mini skirt', '2 pieces', '4 colors'],
    price: '1,990',
    currency: 'THB',
    badge: { label: 'New Design', background: 'var(--rose)', color: 'white' },
    slides: [
      { img: '/images/sr02/soft_riot.jpg', label: 'Soft Riot', dot: '#C4708A' },
      { img: '/images/sr02/midnight.jpg', label: 'Midnight', dot: '#4A1A5A' },
      { img: '/images/sr02/garden.jpg', label: 'Garden', dot: '#8FBC5A' },
      { img: '/images/sr02/golden_hour.jpg', label: 'Golden Hour', dot: '#E8D8B0' },
    ],
    rotateMs: 3800,
  },
  {
    id: 'hood',
    href: '/collection/srac01',
    code: 'SR-AC01',
    name: 'The Soft Riot Hood',
    tags: ['Crochet hood', 'Braided ties', '8 colors', 'Unisex'],
    price: '990',
    currency: 'THB',
    badge: { label: 'Unisex', background: 'var(--gold)', color: '#f9f5ee' },
    slides: [
      { img: '/images/srac01/dusty_rose_m.jpg', label: 'Dusty Rose', dot: '#C4708A' },
      { img: '/images/srac01/deep_plum_m.jpg', label: 'Deep Plum', dot: '#4A1A5A' },
      { img: '/images/srac01/cherry_m.jpg', label: 'Cherry Red', dot: '#9B1C2E' },
      { img: '/images/srac01/charcoal_m.jpg', label: 'Charcoal · Him', dot: '#2A2A2A' },
    ],
    rotateMs: 4200,
  },
];

/** The four "How it works" steps on the home page. */
export const HOW_IT_WORKS = [
  {
    title: 'Choose your color',
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
