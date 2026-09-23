/**
 * Creates the Stripe Checkout Session the browser is redirected to.
 *
 * The order is never trusted from the client: the checkout page posts the same
 * query string that /checkout itself renders from, and resolveOrder() turns it
 * back into a product, color, size and price here on the server. Those details
 * ride along as session metadata, so the Stripe dashboard and the webhook both
 * see exactly what was configured — the webhook rebuilds the whole order from
 * metadata.draft when it sends the confirmation email.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { generateOrderNumber } from '@/lib/format';
import { parseOrderRequest } from '@/lib/order-request';

// The API version is deliberately not pinned — the SDK follows the default
// version set on the Stripe account.
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = secretKey ? new Stripe(secretKey) : null;

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not set.' }, { status: 500 });
  }

  const parsed = parseOrderRequest(await request.json().catch(() => ({})));
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { draft, order, customer, promo } = parsed.value;

  // The amount actually charged. Resolved from PROMO_CODES server-side, never
  // from a figure the browser sent, and applied to line_items rather than via
  // allow_promotion_codes so the customer is charged exactly what the checkout
  // page and the confirmation email both show.
  const payable = promo ? order.price - promo.amount : order.price;

  // Made-to-measure pieces are quoted, not priced: resolveOrder() falls back to
  // the base price, and the checkout page tells the customer we confirm the
  // final figure before anything is cast on. Charging a card here would take a
  // number nobody has agreed to yet, so the client sends these to
  // /api/custom-order instead.
  if (order.sizeLabel === 'Custom') {
    return NextResponse.json(
      { error: 'Made-to-measure orders are quoted before payment.', quoteOnly: true },
      { status: 409 },
    );
  }

  const orderNumber = generateOrderNumber();

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
      // Prefills Stripe with the address they just typed, so they are not asked twice.
      customer_email: customer.email,
      client_reference_id: orderNumber,
      line_items: [
        {
          price_data: {
            currency: 'thb',
            // Stripe charges in the smallest currency unit — satang, so baht × 100.
            unit_amount: payable * 100,
            product_data: {
              name: `${order.product.sku} ${order.product.name}`,
              description: [order.colourSummary, order.sizeLabel, promo ? promo.label : '']
                .filter(Boolean)
                .join(' · '),
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_number: orderNumber,
        // The webhook re-resolves the full order from this rather than trusting
        // the flattened copies below.
        draft,
        sku: order.product.sku,
        product: order.product.productLabel,
        color: order.colourSummary,
        yarn: order.yarn ? `#${order.yarn.id} ${order.yarn.name}` : '',
        size: order.sizeLabel ?? '',
        measurements: order.measurementSummary,
        // Baht, resolved server-side — the same figure line_items charges.
        price_thb: String(payable),
        list_price_thb: String(order.price),
        promo_code: promo ? promo.code : '',
        promo_discount_thb: promo ? String(promo.amount) : '',
        customer_name: customer.name,
        customer_email: customer.email,
        shipping_address: customer.address,
      },
    });

    return NextResponse.json({ url: session.url, orderNumber });
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
