/**
 * Acknowledge an order, do not charge.
 *
 * Every configurator order goes through here for now — automatic payment via
 * Stripe is built (see /api/create-checkout-session and /api/stripe/webhook)
 * but dormant until the Stripe account is verified. This endpoint tells the
 * customer we have their order and sends YOU LOOP the order card; payment and
 * final confirmation happen by hand, over the chat channel the customer chose
 * at checkout.
 *
 * A preset size arrives already priced (order.price is the real total); a
 * made-to-measure order does not (the on-screen figure is a starting quote).
 * `priced` below reflects that distinction so the emails never claim a number
 * that has not actually been agreed.
 *
 * The Netlify Forms submission the checkout page also makes is what keeps the
 * durable record — this endpoint only sends mail.
 */

import { NextResponse } from 'next/server';
import { generateOrderNumber } from '@/lib/format';
import { internalRecipient, sendCustomerEmail, sendEmail } from '@/lib/email';
import { customerQuoteEmail, internalOrderEmail } from '@/lib/order-emails';
import { orderEmailData, parseOrderRequest } from '@/lib/order-request';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = parseOrderRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { order, customer, promo } = parsed.value;

  // The checkout page has already filed this order number with Netlify Forms.
  // Reusing it keeps the record, the customer's email and our copy on one
  // reference; generating a second one here would split them.
  const orderNumber =
    String((body as { orderNumber?: unknown }).orderNumber ?? '').trim() || generateOrderNumber();

  const data = orderEmailData(order, customer, orderNumber, {
    priced: order.sizeLabel !== 'Custom',
    promo,
  });

  // The customer's acknowledgement matters more than our own copy, but neither
  // failing should lose the order — the Netlify Forms record already exists.
  const [customerSent, internalSent] = await Promise.all([
    sendCustomerEmail({ ...customerQuoteEmail(data), to: customer.email }),
    sendEmail({ ...internalOrderEmail(data, 'quote'), to: internalRecipient() }),
  ]);

  if (!internalSent) {
    console.error('Custom order notice failed to send.', orderNumber, customer.email);
  }

  return NextResponse.json({ orderNumber, customerNotified: customerSent });
}
