/**
 * Stripe webhook endpoint.
 *
 * Stripe signs every event and the signature is verified against the raw
 * request body, so request.text() has to be read before anything parses it.
 * checkout.session.completed is the event that means "the customer paid" —
 * fulfilment hangs off that, not off the success_url redirect, which a
 * customer can close before it ever loads.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = secretKey ? new Stripe(secretKey) : null;

export async function POST(request: Request) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !endpointSecret) {
    return NextResponse.json({ error: 'Stripe environment variables are not set.' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      // TODO: fulfil the order — session.metadata carries the configured piece
      // (sku, colour, yarn, size, measurements) set in create-checkout-session.
      console.log('Checkout completed:', session.id, session.metadata);
      break;
    }
    default:
      console.log('Unhandled event type:', event.type);
  }

  return NextResponse.json({ received: true });
}
