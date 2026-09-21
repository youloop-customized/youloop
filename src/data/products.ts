/**
 * Configurator products.
 *
 * SR-01, SR-02 and SR-AC01 were three near-identical 300 KB HTML pages. Their
 * markup and behaviour were the same; only the copy, photos, prices and a
 * couple of optional sections differed. Everything that differed now lives
 * here, and <Configurator> renders all three from these objects.
 */

export type Swatch = {
  /** Stable key, also used as the photo lookup key in the original pages. */
  key: string;
  name: string;
  /** Sub-line shown over the photo, e.g. "Dusty Rose - Deep Plum - Golden ruffles". */
  sub: string;
  /** Colour of the little square swatch. */
  dot: string;
  /** Optional border, used where the dot is nearly white or nearly black. */
  dotBorder?: string;
  photo: string;
  /** Alternate photo for the hood's "Him" model toggle. */
  altPhoto?: string;
  /** Styling tip shown under the hood swatches. */
  pairing?: string;
};

export type SwatchGroup = {
  label?: string;
  swatches: Swatch[];
};

export type SizeOption = {
  label: string;
  price: number;
  /** Marks L/XL with the little gold arrow — they cost more yarn and time. */
  upsized?: boolean;
};

export type Measurements = {
  bust: number;
  waist: number;
  hips: number;
  height: number;
};

export type DetailCard = {
  label: string;
  lines: string[];
};

export type ProductConfig = {
  slug: string;
  sku: string;
  /** Netlify form name — must exist in public/__forms.html. */
  formName: string;
  /** Value stored in the submission's `product` field. */
  productLabel: string;
  name: string;
  /** Page <title>. */
  title: string;
  tagline: string[];
  basePrice: number;
  priceNote: string;
  heroBand: string[];
  navPill: { label: string; background: string; color: string };
  photoBadge: string;
  photoNote: string;
  /** "Choose a mood" for the sets, "Choose a colourway" for the hood. */
  groupedModeLabel: string;
  swatchGroups: SwatchGroup[];
  /** Hood only: swaps the photo set between the female and male model. */
  modelToggle?: { female: string; male: string };
  /** Hood only: renders the "Pairs with..." styling tip. */
  showPairingHint?: boolean;
  /** Absent for the hood, which is one size. */
  sizing?: {
    options: SizeOption[];
    note: string;
    measurements: Record<string, Measurements>;
  };
  /** Hood only: replaces the size section. */
  wearPills?: { label: string; pills: string[] };
  yarnDefaultNote: string;
  leadTime: string;
  trust: string[];
  details: DetailCard[];
};

/** Promo codes are the same across all three configurators. */
export const PROMO_CODES: Record<string, { percent: number; label: string }> = {
  WELCOME10: { percent: 0.1, label: '10% off' },
  SOFTRIOT15: { percent: 0.15, label: '15% off' },
};

/** Standard size chart, shared by SR-01 and SR-02. */
const STANDARD_MEASUREMENTS: Record<string, Measurements> = {
  XS: { bust: 78, waist: 60, hips: 84, height: 158 },
  S: { bust: 83, waist: 65, hips: 89, height: 161 },
  M: { bust: 88, waist: 70, hips: 94, height: 165 },
  L: { bust: 94, waist: 76, hips: 100, height: 168 },
  XL: { bust: 101, waist: 83, hips: 107, height: 172 },
};

const NEW_DESIGN_PILL = { label: 'New Design', background: '#aa4a30', color: 'white' };

export const SR01: ProductConfig = {
  slug: 'sr01',
  sku: 'SR-01',
  formName: 'order-sr01',
  productLabel: 'SR-01 The Birthday Set',
  name: 'The Birthday Set',
  title: 'SR-01 — The Birthday Set | YOU LOOP',
  tagline: [
    'Mini dress + arm warmers + leg warmers.',
    "Your main character outfit for the moment you'll remember.",
  ],
  basePrice: 2690,
  priceNote: '3 pieces · Custom made · 10-14 days',
  heroBand: ['SR-01', 'The Birthday Set', '4 Moods + 81 Yarn Colours', '3 Pieces', '10–14 Days'],
  navPill: NEW_DESIGN_PILL,
  photoBadge: '✦ Dress · Arm warmers · Leg warmers',
  photoNote: '10–14 day delivery',
  groupedModeLabel: 'Choose a mood',
  swatchGroups: [
    {
      swatches: [
        {
          key: 'soft_riot',
          name: 'Soft Riot',
          sub: 'Dusty Rose - Deep Plum - Golden ruffles',
          dot: '#C4708A',
          photo: '/images/sr01/soft_riot.jpg',
        },
        {
          key: 'midnight',
          name: 'Midnight',
          sub: 'Deep Plum - Mid Plum - Golden ruffles',
          dot: '#4A1A5A',
          photo: '/images/sr01/midnight.jpg',
        },
        {
          key: 'garden',
          name: 'Garden',
          sub: 'Celery - Cream - Golden ruffles',
          dot: '#8FBC5A',
          photo: '/images/sr01/garden.jpg',
        },
        {
          key: 'golden_hour',
          name: 'Golden Hour',
          sub: 'Cream - Brown - Golden ruffles',
          dot: '#E8D8B0',
          photo: '/images/sr01/golden_hour.jpg',
        },
      ],
    },
  ],
  sizing: {
    options: [
      { label: 'XS', price: 2690 },
      { label: 'S', price: 2690 },
      { label: 'M', price: 2690 },
      { label: 'L', price: 2890, upsized: true },
      { label: 'XL', price: 3040, upsized: true },
    ],
    note: 'L + XL reflect extra yarn and stitching time.',
    measurements: STANDARD_MEASUREMENTS,
  },
  yarnDefaultNote: 'No yarn selected - we will confirm your colour via LINE before starting.',
  leadTime: '10-14 days',
  trust: ['3 pieces included', '100% Cotton', 'Fairly made', 'Photo approval'],
  details: [
    { label: 'Includes', lines: ['Mini dress', 'Arm warmers', 'Leg warmers'] },
    {
      label: 'Ruffle detail',
      lines: ['3-tier gradient hem', 'YOU LOOP signature', 'Gold always present'],
    },
    { label: 'Material', lines: ['100% Cotton DK', 'Open mesh body', 'Ribbed warmers'] },
    { label: 'Delivery', lines: ['10-14 days', 'Express delivery', 'Progress photos'] },
  ],
};

export const SR02: ProductConfig = {
  slug: 'sr02',
  sku: 'SR-02',
  formName: 'order-sr02',
  productLabel: 'SR-02 The Soft Riot Crop Set',
  name: 'The Soft Riot Crop Set',
  title: 'SR-02 — The Soft Riot Crop Set | YOU LOOP',
  tagline: [
    'Long sleeve open-weave mesh top + high-waist mini skirt.',
    'Soft on the surface. Sharp underneath.',
  ],
  basePrice: 1990,
  priceNote: '2 pieces · Custom made · 10-14 days',
  heroBand: [
    'SR-02',
    'The Soft Riot Crop Set',
    '4 Moods + 81 Yarn Colours',
    '2 Pieces',
    '10–14 Days',
  ],
  navPill: NEW_DESIGN_PILL,
  photoBadge: '✦ Long sleeve mesh top · Mini skirt',
  photoNote: '10–14 day delivery',
  groupedModeLabel: 'Choose a mood',
  swatchGroups: [
    {
      swatches: [
        {
          key: 'soft_riot',
          name: 'Soft Riot',
          sub: 'Dusty Rose throughout',
          dot: '#C4708A',
          photo: '/images/sr02/soft_riot.jpg',
        },
        {
          key: 'midnight',
          name: 'Midnight',
          sub: 'Deep Plum throughout',
          dot: '#4A1A5A',
          photo: '/images/sr02/midnight.jpg',
        },
        {
          key: 'garden',
          name: 'Garden',
          sub: 'Celery Green throughout',
          dot: '#8FBC5A',
          photo: '/images/sr02/garden.jpg',
        },
        {
          key: 'golden_hour',
          name: 'Golden Hour',
          sub: 'Cream throughout',
          dot: '#E8D8B0',
          photo: '/images/sr02/golden_hour.jpg',
        },
      ],
    },
  ],
  sizing: {
    options: [
      { label: 'XS', price: 1990 },
      { label: 'S', price: 1990 },
      { label: 'M', price: 1990 },
      { label: 'L', price: 2190, upsized: true },
      { label: 'XL', price: 2340, upsized: true },
    ],
    note: 'L + XL reflect extra yarn and stitching time.',
    measurements: STANDARD_MEASUREMENTS,
  },
  yarnDefaultNote: 'No yarn selected - we will confirm via Instagram before starting.',
  leadTime: '10-14 days',
  trust: ['2 pieces included', '100% Cotton', 'Fairly made', 'Photo approval'],
  details: [
    { label: 'Includes', lines: ['Mesh crop top', 'Mini skirt'] },
    { label: 'Top detail', lines: ['Open mesh weave', 'Tie-front detail', 'Long sleeves'] },
    { label: 'Material', lines: ['100% Cotton DK', 'Open weave', 'Lined skirt'] },
    { label: 'Delivery', lines: ['10-14 days', 'Express delivery', 'Progress photos'] },
  ],
};

export const SRAC01: ProductConfig = {
  slug: 'srac01',
  sku: 'SR-AC01',
  formName: 'order-srac01',
  productLabel: 'SR-AC01 The Soft Riot Hood',
  name: 'The Soft Riot Hood',
  title: 'SR-AC01 — The Soft Riot Hood | YOU LOOP',
  tagline: ['Crochet pixie hood · Open mesh · Braided tassel ties · Wear it your way'],
  basePrice: 990,
  priceNote: 'Custom made · 7-10 days · Unisex',
  heroBand: [
    'SR-AC01',
    'The Soft Riot Hood',
    '8 Colourways + 81 Yarn Colours',
    'Unisex · One Size',
    '7–10 Days',
  ],
  navPill: { label: 'Unisex', background: '#d49a37', color: '#f9f5ee' },
  photoBadge: '✦ Unisex Design',
  photoNote: '7–10 day delivery',
  groupedModeLabel: 'Choose a colourway',
  modelToggle: { female: 'Her ✦', male: 'Him ✦' },
  showPairingHint: true,
  swatchGroups: [
    {
      label: 'Matches our sets',
      swatches: [
        {
          key: 'dusty_rose',
          name: 'Dusty Rose',
          sub: 'Soft Riot colourway',
          dot: '#C4708A',
          photo: '/images/srac01/dusty_rose.jpg',
          altPhoto: '/images/srac01/dusty_rose_m.jpg',
          pairing: 'Pairs with SR-01 and SR-02 Soft Riot',
        },
        {
          key: 'deep_plum',
          name: 'Deep Plum',
          sub: 'Midnight colourway',
          dot: '#6B2D8B',
          photo: '/images/srac01/deep_plum.jpg',
          altPhoto: '/images/srac01/deep_plum_m.jpg',
          pairing: 'Pairs with SR-01 and SR-02 Midnight',
        },
        {
          key: 'celery',
          name: 'Celery Green',
          sub: 'Garden colourway',
          dot: '#8FBC5A',
          photo: '/images/srac01/celery.jpg',
          altPhoto: '/images/srac01/celery_m.jpg',
          pairing: 'Pairs with SR-01 and SR-02 Garden',
        },
        {
          key: 'cream',
          name: 'Cream',
          sub: 'Golden Hour colourway',
          dot: '#EDE0C8',
          dotBorder: '1px solid rgba(255,255,255,0.15)',
          photo: '/images/srac01/cream.jpg',
          altPhoto: '/images/srac01/cream_m.jpg',
          pairing: 'Pairs with SR-01 and SR-02 Golden Hour',
        },
      ],
    },
    {
      label: 'Standalone colourways',
      swatches: [
        {
          key: 'golden',
          name: 'Golden Caramel',
          sub: 'Honey colourway',
          dot: '#C4903A',
          photo: '/images/srac01/golden.jpg',
          altPhoto: '/images/srac01/golden_m.jpg',
          pairing: 'Cross-set accent - pairs with all ruffle tiers',
        },
        {
          key: 'cherry_red',
          name: 'Cherry Red',
          sub: 'Riot Red colourway',
          dot: '#9B1C2E',
          photo: '/images/srac01/cherry_red.jpg',
          altPhoto: '/images/srac01/cherry_m.jpg',
          pairing: 'Bold statement - standalone main character energy',
        },
        {
          key: 'cocoa',
          name: 'Cocoa',
          sub: 'Cocoa colourway',
          dot: '#6B3A1F',
          photo: '/images/srac01/cocoa.jpg',
          altPhoto: '/images/srac01/cocoa_m.jpg',
          pairing: 'Pairs beautifully with Golden Hour ruffle tones',
        },
        {
          key: 'charcoal',
          name: 'Charcoal Black',
          sub: 'Charcoal Black colourway',
          dot: '#111111',
          dotBorder: '2px solid rgba(255,255,255,0.35)',
          photo: '/images/srac01/charcoal.jpg',
          altPhoto: '/images/srac01/charcoal_m.jpg',
          pairing: 'Edgy contrast with any set',
        },
      ],
    },
  ],
  wearPills: { label: '02 - 3 ways to wear it', pills: ['Loose', 'Tied chin', 'Wrapped'] },
  yarnDefaultNote: 'No yarn selected - we will confirm via Instagram before starting.',
  leadTime: '7-10 days',
  trust: ['Handmade to order', '100% Cotton', 'Unisex fit', 'Photo approval'],
  details: [
    { label: 'Material', lines: ['100% Cotton DK', 'Open mesh weave', 'Mid-weight'] },
    { label: 'Fit', lines: ['One size fits most', 'Close-to-head', 'Unisex'] },
    { label: 'Details', lines: ['Braided tassel ties', '40-45 cm each', 'Seamless build'] },
    { label: 'Delivery', lines: ['7-10 days', 'Express delivery', 'Progress photos'] },
  ],
};

export const PRODUCTS: Record<string, ProductConfig> = {
  sr01: SR01,
  sr02: SR02,
  srac01: SRAC01,
};
