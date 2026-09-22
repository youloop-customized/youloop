/**
 * Shared parsing for the two order endpoints.
 *
 * /api/create-checkout-session and /api/custom-order receive the same payload —
 * the checkout draft plus who is ordering — and both need it turned into a
 * resolved order and an email-ready summary. Keeping that in one place means
 * the paid path and the quote path can never drift apart on what they record.
 */

import { baht } from '@/lib/format';
import { resolveOrder, type ResolvedOrder } from '@/lib/order';
import type { OrderEmailData } from '@/lib/order-emails';

export type CustomerDetails = {
  name: string;
  email: string;
  /** The flattened one-line address the checkout page builds. */
  address: string;
  /** How the studio reaches the customer to confirm and arrange payment. */
  contactMethod: string;
  contactHandle: string;
};

export type OrderRequest = {
  draft: string;
  order: ResolvedOrder;
  customer: CustomerDetails;
};

/** Deliberately loose — the real check is whether Stripe and Resend accept it. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseOrderRequest(
  body: unknown,
): { ok: true; value: OrderRequest } | { ok: false; error: string } {
  const input = (body ?? {}) as Record<string, unknown>;
  const draft = String(input.draft ?? '');

  const order = resolveOrder(new URLSearchParams(draft));
  if (!order) return { ok: false, error: 'Unknown or incomplete order.' };

  const raw = (input.customer ?? {}) as Record<string, unknown>;
  const name = String(raw.name ?? '').trim();
  const email = String(raw.email ?? '').trim();
  const address = String(raw.address ?? '').trim();
  const contactMethod = String(raw.contactMethod ?? '').trim();
  const contactHandle = String(raw.contactHandle ?? '').trim();

  if (!name) return { ok: false, error: 'A name is required.' };
  if (!EMAIL_SHAPE.test(email)) return { ok: false, error: 'A valid email is required.' };
  // With automatic payment off, this is the only way the studio can reach the
  // customer to confirm the order and arrange payment — as required as email.
  if (!contactMethod || !contactHandle) {
    return { ok: false, error: 'A chat channel to reach you on is required.' };
  }

  return {
    ok: true,
    value: { draft, order, customer: { name, email, address, contactMethod, contactHandle } },
  };
}

/**
 * Builds the summary the email templates render. `total` is left blank for a
 * made-to-measure order, where the figure on screen is only a starting quote
 * and showing it as a total would imply a price we have not agreed to.
 */
export function orderEmailData(
  order: ResolvedOrder,
  customer: CustomerDetails,
  orderNumber: string,
  options: { priced: boolean },
): OrderEmailData {
  return {
    orderNumber,
    sku: order.product.sku,
    productName: order.product.name,
    colour: order.colourSummary,
    yarn: order.yarn ? `#${order.yarn.id} ${order.yarn.name}` : null,
    size: order.sizeLabel,
    measurements: order.measurementSummary,
    total: options.priced ? baht(order.price) : '',
    leadTime: order.product.leadTime,
    customerName: customer.name,
    customerEmail: customer.email,
    address: customer.address,
    contactMethod: customer.contactMethod,
    contactHandle: customer.contactHandle,
  };
}
