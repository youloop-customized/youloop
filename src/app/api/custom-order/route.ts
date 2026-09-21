/**
 * The made-to-measure path: acknowledge, do not charge.
 *
 * A custom-size order cannot go through Stripe Checkout, because the price on
 * screen is a starting quote rather than a total (see the 409 in
 * /api/create-checkout-session). This endpoint tells the customer we have it
 * and are checking, and sends YOU LOOP the order card to quote from. Payment
 * follows by hand, as a Stripe payment link.
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
  const { order, customer } = parsed.value;

  // The checkout page has already filed this order number with Netlify Forms.
  // Reusing it keeps the record, the customer's email and our copy on one
  // reference; generating a second one here would split them.
  const orderNumber =
    String((body as { orderNumber?: unknown }).orderNumber ?? '').trim() || generateOrderNumber();

  const data = orderEmailData(order, customer, orderNumber, { priced: false });

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
