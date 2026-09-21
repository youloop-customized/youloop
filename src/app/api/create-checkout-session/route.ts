/**
 * Creates the Stripe Checkout Session the browser is redirected to.
 *
 * The order is never trusted from the client: the checkout page posts the same
 * query string that /checkout itself renders from, and resolveOrder() turns it
 * back into a product, colour, size and price here on the server. Those details
 * ride along as session metadata, so both the Stripe dashboard and the webhook
 * see exactly what was configured.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { resolveOrder } from '@/lib/order';

// The API version is deliberately not pinned — the SDK follows the default
// version set on the Stripe account.
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = secretKey ? new Stripe(secretKey) : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not set.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const draft = String(body.draft ?? '');
  const order = resolveOrder(new URLSearchParams(draft));
  if (!order) {
    return NextResponse.json({ error: 'Unknown or incomplete order.' }, { status: 400 });
  }

  // Made-to-measure pieces are quoted, not priced: resolveOrder() falls back to
  // the base price, and the checkout page tells the customer we confirm the
  // final figure before anything is cast on. Charging a card here would take a
  // number nobody has agreed to yet, so those orders stay on the enquiry flow.
  if (order.sizeLabel === 'Custom') {
    return NextResponse.json(
      { error: 'Made-to-measure orders are quoted before payment.', quoteOnly: true },
      { status: 409 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'hosted_page',
      mode: 'payment',
      billing_address_collection: 'auto',
      phone_number_collection: { enabled: false },
      automatic_tax: { enabled: false },
      allow_promotion_codes: false,
      submit_type: 'auto',
      integration_identifier: 'hosted_web_0001',
      origin_context: 'web',
      success_url: `${process.env.DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      // Carries the draft back so an abandoned checkout lands on the order the
      // customer had already configured, rather than an empty page.
      cancel_url: `${process.env.DOMAIN}/checkout?${draft}`,
      line_items: [
        {
          price_data: {
            currency: 'thb',
            // Stripe charges in the smallest currency unit — satang, so baht × 100.
            unit_amount: order.price * 100,
            product_data: {
              name: `${order.product.sku} ${order.product.name}`,
              description: [order.colourSummary, order.sizeLabel].filter(Boolean).join(' · '),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        sku: order.product.sku,
        product: order.product.productLabel,
        colour: order.colourSummary,
        yarn: order.yarn ? `#${order.yarn.id} ${order.yarn.name}` : '',
        size: order.sizeLabel ?? '',
        measurements: order.measurementSummary,
        // Baht, resolved server-side — the same figure line_items charges.
        price_thb: String(order.price),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // A Stripe-side failure (bad key, declined request, outage) must still come
    // back as JSON — the checkout page parses this response to show an error.
    console.error('Could not create Checkout Session.', err);
    return NextResponse.json(
      { error: 'Could not start checkout. Please try again.' },
      { status: 502 },
    );
  }
}
