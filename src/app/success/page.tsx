/**
 * Where Stripe sends a customer after checkout.
 *
 * The session is read back from Stripe rather than trusted from the query
 * string, so the page cannot be faked by editing the URL. It is only ever a
 * receipt: the confirmation email and the order itself are driven by the
 * webhook, because a customer can close this tab before it loads.
 *
 * Three states, because PromptPay settles after the redirect: paid, still
 * pending, or no readable session at all.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import Stripe from 'stripe';
import { BRAND } from '@/data/site';
import s from '@/components/configurator/Configurator.module.css';
import c from '@/components/configurator/Checkout.module.css';

export const metadata: Metadata = {
  title: 'Order confirmed | YOU LOOP',
  description: 'Your YOU LOOP order is confirmed.',
  robots: { index: false, follow: false },
};

const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = secretKey ? new Stripe(secretKey) : null;

type State = 'paid' | 'pending' | 'unknown';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  let session: Stripe.Checkout.Session | null = null;
  if (stripe && sessionId) {
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      console.error('Could not read Checkout Session on the success page.', err);
    }
  }

  const state: State = !session
    ? 'unknown'
    : session.payment_status === 'paid'
      ? 'paid'
      : 'pending';

  const meta = session?.metadata ?? {};
  const orderNumber = meta.order_number || session?.client_reference_id || '';
  const email = meta.customer_email || session?.customer_details?.email || '';

  const rows = [
    { label: 'Piece', value: [meta.sku, meta.product].filter(Boolean).join(' ') },
    { label: 'Colour', value: meta.colour ?? '' },
    { label: 'Yarn', value: meta.yarn ?? '' },
    { label: 'Size', value: meta.size ?? '' },
    { label: 'Measurements', value: meta.measurements === '-' ? '' : (meta.measurements ?? '') },
    { label: 'Ships to', value: meta.shipping_address ?? '' },
  ].filter((row) => row.value);

  const heading =
    state === 'paid'
      ? 'Your piece is on the hook'
      : state === 'pending'
        ? 'Waiting on your payment'
        : 'We could not confirm this order';

  return (
    <div className={s.page}>
      <nav className={s.nav}>
        <div className={s.navRight} />
        <Link href="/" className={s.navLogo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.logo} alt={BRAND.name} className={s.navLogoImg} />
        </Link>
        <div className={s.navRight} />
      </nav>

      <div className={c.wrap}>
        <span className={s.secLabel}>
          {state === 'paid' ? 'Order confirmed' : state === 'pending' ? 'Almost there' : 'Checkout'}
        </span>
        <h1 className={c.title}>{heading}</h1>

        <p className={c.intro}>
          {state === 'paid' && (
            <>
              Thank you — your payment came through and your order is in the making queue.
              {email ? ` We have sent the confirmation to ${email}.` : ''} We will send progress
              photos as it comes together.
            </>
          )}
          {state === 'pending' && (
            <>
              Your order is with us, but your bank has not confirmed the payment yet. This is
              normal with PromptPay and usually takes a moment.
              {email ? ` We will email ${email} the second it clears` : ' We will email you the second it clears'}
              {' '}— no need to pay again or refresh this page.
            </>
          )}
          {state === 'unknown' && (
            <>
              If you were charged, nothing is lost — message us at{' '}
              <a href="mailto:hello@youloop.co">hello@youloop.co</a> or on Instagram and we will
              track it down straight away.
            </>
          )}
        </p>

        {state !== 'unknown' && orderNumber && (
          <span className={s.modalOrderNum}>{orderNumber}</span>
        )}

        {state !== 'unknown' && rows.length > 0 && (
          <div className={s.orderSummary}>
            <div className={s.orderSummaryHeader}>
              <h3>What we are making</h3>
            </div>
            <div className={s.orderRows}>
              {rows.map((row) => (
                <div key={row.label} className={s.orderRow}>
                  <span className={s.orderLabel}>{row.label}</span>
                  <span className={s.orderVal}>{row.value}</span>
                </div>
              ))}
              {session?.amount_total != null && (
                <div className={`${s.orderRow} ${s.orderTotalRow}`}>
                  <span className={s.orderTotalLabel}>{state === 'paid' ? 'Paid' : 'Total'}</span>
                  <span className={s.orderTotalVal}>
                    {'฿' + (session.amount_total / 100).toLocaleString('en-US')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <Link href="/#collection" className={`${s.cta} ${s.ctaConfirm}`}>
          Back to the collection
        </Link>
      </div>

      <footer className={s.footer}>
        <div className={s.footerLogo}>✦ YOU LOOP ✦</div>
        <p>Made slow. Worn long. Keep it Soft Riot.</p>
        <p style={{ marginTop: 6 }}>
          <Link href="/">youloop.co</Link>
          &nbsp;·&nbsp;
          <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer">
            @hello.youloop
          </a>
          &nbsp;·&nbsp;
          <a href="mailto:hello@youloop.co">hello@youloop.co</a>
        </p>
      </footer>
    </div>
  );
}
