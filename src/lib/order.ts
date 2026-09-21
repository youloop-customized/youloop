/**
 * The order draft that travels from the configurator to /checkout.
 *
 * The configurator no longer collects the customer's details or shows a
 * summary — it ends at "Proceed", which hands the chosen colour and size to
 * the checkout page. That handoff goes through the URL so the link is
 * shareable and survives a reload; the draft is small enough to encode as
 * plain query params.
 */

import { PRODUCTS, type Measurements, type ProductConfig, type Swatch } from '@/data/products';
import { YARNS, type Yarn } from '@/data/yarns';

/** A named colourway, or a single yarn picked from the 81-colour palette. */
export type ColourChoice = 'preset' | 'custom';
/** One of the product's size options, or measurements typed in by hand. */
export type SizeChoice = 'preset' | 'custom';

export type OrderDraft = {
  productSlug: string;
  colourChoice: ColourChoice;
  /** Swatch key — kept even for a custom colour, since it drives the photo. */
  swatchKey: string;
  yarnId: string | null;
  sizeChoice: SizeChoice;
  /** Null for the hood, which is one size. */
  sizeLabel: string | null;
  measurements: Measurements | null;
};

/** What a resolved draft looks like once the ids are turned back into data. */
export type ResolvedOrder = {
  product: ProductConfig;
  swatch: Swatch;
  yarn: Yarn | null;
  colourSummary: string;
  sizeLabel: string | null;
  measurements: Measurements | null;
  measurementSummary: string;
  price: number;
};

export const CHECKOUT_PATH = '/checkout';

/** "88 / 70 / 94 / 165 cm", or "-" while any of the four is still missing. */
export function measurementSummary(cm: Measurements | null): string {
  if (!cm || !cm.bust || !cm.waist || !cm.hips || !cm.height) return '-';
  return `${cm.bust} / ${cm.waist} / ${cm.hips} / ${cm.height} cm`;
}

export function isCompleteMeasurements(cm: Measurements): boolean {
  return Boolean(cm.bust && cm.waist && cm.hips && cm.height);
}

export function draftToQuery(draft: OrderDraft): string {
  const params = new URLSearchParams({ p: draft.productSlug, c: draft.swatchKey });
  if (draft.colourChoice === 'custom') params.set('custom', '1');
  if (draft.yarnId) params.set('y', draft.yarnId);
  if (draft.sizeChoice === 'custom') {
    params.set('s', 'custom');
  } else if (draft.sizeLabel) {
    params.set('s', draft.sizeLabel);
  }
  const cm = draft.measurements;
  if (cm && (draft.sizeChoice === 'custom' || !draft.sizeLabel)) {
    params.set('b', String(cm.bust));
    params.set('w', String(cm.waist));
    params.set('h', String(cm.hips));
    params.set('ht', String(cm.height));
  }
  return params.toString();
}

export function checkoutHref(draft: OrderDraft): string {
  return `${CHECKOUT_PATH}?${draftToQuery(draft)}`;
}

function readMeasurements(params: URLSearchParams): Measurements | null {
  const nums = ['b', 'w', 'h', 'ht'].map((key) => Number(params.get(key)));
  if (nums.some((n) => !Number.isFinite(n) || n <= 0)) return null;
  const [bust, waist, hips, height] = nums;
  return { bust, waist, hips, height };
}

/**
 * Rebuilds a full order from the checkout URL. Returns null when the product
 * is unknown — a hand-edited or stale link — so the page can send the visitor
 * back to the collection instead of rendering half an order.
 */
export function resolveOrder(params: URLSearchParams): ResolvedOrder | null {
  const product = PRODUCTS[params.get('p') ?? ''];
  if (!product) return null;

  const allSwatches = product.swatchGroups.flatMap((group) => group.swatches);
  const swatch = allSwatches.find((item) => item.key === params.get('c')) ?? allSwatches[0];

  const yarn = YARNS.find((item) => item.id === params.get('y')) ?? null;
  const isCustomColour = params.get('custom') === '1';

  const sizeParam = params.get('s');
  let sizeLabel: string | null = null;
  let measurements: Measurements | null = null;
  let price = product.basePrice;

  if (product.sizing) {
    if (sizeParam === 'custom') {
      sizeLabel = 'Custom';
      measurements = readMeasurements(params);
      // A made-to-measure piece is quoted from the base price; anything beyond
      // the standard chart is confirmed with the customer before production.
      price = product.basePrice;
    } else {
      const option =
        product.sizing.options.find((o) => o.label === sizeParam) ?? product.sizing.options[0];
      sizeLabel = option.label;
      measurements = product.sizing.measurements[option.label] ?? null;
      price = option.price;
    }
  }

  return {
    product,
    swatch,
    yarn,
    colourSummary: isCustomColour
      ? yarn
        ? `Custom — #${yarn.id} ${yarn.name}`
        : 'Custom (yarn to confirm)'
      : swatch.name,
    sizeLabel,
    measurements,
    measurementSummary: measurementSummary(measurements),
    price,
  };
}
