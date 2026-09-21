/**
 * Stripe webhook endpoint.
 *
 * Stripe signs every event and the signature is verified against the raw
 * request body, so request.text() has to be read before anything parses it.
 *
 * Payment confirmation hangs off webhooks rather than the success_url redirect,
 * which a customer can close before it loads. Two events can mean "paid":
 *
 *   checkout.session.completed              cards — settled by the time it fires
 *   checkout.session.async_payment_succeeded  PromptPay and other methods that
 *                                             complete the Session first and
 *                                             settle afterwards
 *
 * So `completed` is gated on payment_status rather than assumed to mean paid.
 * Telling a customer their payment came through while a PromptPay QR is still
 * sitting unscanned would be worse than saying nothing.
 */

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { internalRecipient, sendCustomerEmail, sendEmail } from '@/lib/email';
import { customerPaidEmail, internalOrderEmail } from '@/lib/order-emails';
import { orderEmailData } from '@/lib/order-request';
import { resolveOrder } from '@/lib/order';

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
      if (session.payment_status === 'paid') {
        await onPaid(session);
      } else {
        // PromptPay: the QR has been shown but not yet scanned. Nothing to
        // confirm — async_payment_succeeded or _failed decides it.
        console.log('Session completed, payment pending:', session.id, session.payment_status);
      }
      break;
    }

    case 'checkout.session.async_payment_succeeded':
      await onPaid(event.data.object);
      break;

    case 'checkout.session.async_payment_failed':
      await onPaymentFailed(event.data.object);
      break;

    default:
      console.log('Unhandled event type:', event.type);
  }

  return NextResponse.json({ received: true });
}

/** Everything the emails need, rebuilt from the metadata set at session creation. */
function readSession(session: Stripe.Checkout.Session) {
  const metadata = session.metadata ?? {};
  const order = resolveOrder(new URLSearchParams(metadata.draft ?? ''));
  if (!order) return null;

  return {
    order,
    orderNumber: metadata.order_number || session.client_reference_id || session.id,
    customer: {
      name: metadata.customer_name || session.customer_details?.name || 'there',
      email: metadata.customer_email || session.customer_details?.email || '',
      address: metadata.shipping_address || '',
    },
  };
}

/**
 * Sends the confirmation pair for a paid order.
 *
 * Anything thrown here would make Stripe retry the whole event, so failures are
 * logged and swallowed instead. The sends are keyed on the session id, which
 * also means the card path and the async path cannot both mail the same
 * customer if Stripe ever delivers both.
 */
async function onPaid(session: Stripe.Checkout.Session) {
  const context = readSession(session);
  if (!context) {
    // Nothing to describe in an email, but the money is real — say so loudly.
    console.error('Paid session has no resolvable order draft:', session.id, session.metadata);
    return;
  }

  const { order, orderNumber, customer } = context;
  if (!customer.email) console.error('Paid session has no customer email:', session.id);

  const data = orderEmailData(order, customer, orderNumber, { priced: true });

  const results = await Promise.allSettled([
    customer.email
      ? sendCustomerEmail({
          ...customerPaidEmail(data),
          to: customer.email,
          idempotencyKey: `paid-customer-${session.id}`,
        })
      : Promise.resolve(false),
    sendEmail({
      ...internalOrderEmail(data, 'paid'),
      to: internalRecipient(),
      idempotencyKey: `paid-internal-${session.id}`,
    }),
  ]);

  results.forEach((result) => {
    if (result.status === 'rejected') {
      console.error('Order confirmation email threw:', session.id, result.reason);
    }
  });

  console.log('Paid:', session.id, orderNumber);
}

/**
 * A delayed payment that never landed — most often a PromptPay QR that expired
 * unscanned. The customer is not emailed: they abandoned the payment and know
 * it. YOU LOOP is told, because the Netlify Forms record already shows an order
 * that will otherwise look real and unfulfilled.
 */
async function onPaymentFailed(session: Stripe.Checkout.Session) {
  const context = readSession(session);
  if (!context) {
    console.error('Failed session has no resolvable order draft:', session.id, session.metadata);
    return;
  }

  const { order, orderNumber, customer } = context;
  const data = orderEmailData(order, customer, orderNumber, { priced: true });

  await sendEmail({
    ...internalOrderEmail(data, 'failed'),
    to: internalRecipient(),
    idempotencyKey: `failed-internal-${session.id}`,
  }).catch((err) => console.error('Payment-failed notice threw:', session.id, err));

  console.log('Payment failed:', session.id, orderNumber);
}
