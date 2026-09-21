'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PROMO_CODES } from '@/data/products';
import { BRAND } from '@/data/site';
import { baht, bahtDiscount, generateOrderNumber } from '@/lib/format';
import { submitFormFields } from '@/lib/netlify';
import { resolveOrder } from '@/lib/order';
import s from './Configurator.module.css';
import c from './Checkout.module.css';

type SubmittedOrder = {
  orderNumber: string;
  colour: string;
  yarn: string | null;
  size: string | null;
  measurements: string;
  discount: string | null;
  total: string;
  name: string;
  email: string;
  address: string;
};

/** Shipping address, kept apart from who is ordering. */
type Shipping = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
};

const EMPTY_SHIPPING: Shipping = {
  line1: '',
  line2: '',
  city: '',
  postcode: '',
  country: 'Thailand',
};

/** Every field but line2, which is the "apartment, building" overflow. */
const REQUIRED_SHIPPING: (keyof Shipping)[] = ['line1', 'city', 'postcode', 'country'];

/** Flattens the address into the one line the summary and the email show. */
function formatAddress(shipping: Shipping): string {
  return [shipping.line1, shipping.line2, shipping.city, shipping.postcode, shipping.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * Step two of the order flow: the full summary, the customer's details and the
 * one button that actually sends the order. The configurator hands the chosen
 * colour and size over in the query string (see src/lib/order.ts).
 */
export default function Checkout() {
  const params = useSearchParams();
  const order = useMemo(() => resolveOrder(new URLSearchParams(params.toString())), [params]);

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<string | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [shipping, setShipping] = useState<Shipping>(EMPTY_SHIPPING);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedOrder | null>(null);

  // A truncated or hand-edited link, e.g. made-to-measure with no measurements
  // on it. Better to send the visitor back than to take half an order.
  const incomplete =
    !order ||
    Boolean(order.product.sizing && order.sizeLabel === 'Custom' && !order.measurements);

  if (!order || incomplete) {
    return (
      <div className={s.page}>
        <CheckoutNav backHref={order ? `/collection/${order.product.slug}` : '/#collection'} />
        <div className={c.emptyState}>
          <h1 className={c.emptyTitle}>We lost your order</h1>
          <p className={c.emptyText}>
            This checkout link is missing part of the piece you configured. Choose your colour and
            size again and we will bring you straight back here.
          </p>
          <Link
            href={order ? `/collection/${order.product.slug}` : '/#collection'}
            className={`${s.cta} ${s.ctaConfirm}`}
          >
            {order ? 'Back to the configurator' : 'Back to collection'}
          </Link>
        </div>
      </div>
    );
  }

  const { product, swatch, yarn, colourSummary, sizeLabel, measurements, price } = order;
  const measurementSummary = order.measurementSummary;

  const discount = promo ? Math.round(price * PROMO_CODES[promo].percent) : 0;
  const total = Math.max(price - discount, 0);
  const isCustomSize = sizeLabel === 'Custom';

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = PROMO_CODES[code];
    if (found) {
      setPromo(code);
      setPromoMsg({ text: `Code applied — ${found.label} ✓`, ok: true });
    } else {
      setPromo(null);
      setPromoMsg({ text: 'Invalid promo code', ok: false });
    }
  }

  async function submitOrder() {
    if (!name.trim() || !email.trim()) {
      alert('Please fill in your name and email before submitting.');
      return;
    }
    if (REQUIRED_SHIPPING.some((key) => !shipping[key].trim())) {
      alert('Please complete your shipping address before submitting.');
      return;
    }

    const orderNumber = generateOrderNumber();
    const yarnLabel = yarn ? `#${yarn.id} - ${yarn.name}` : null;
    const totalLabel = baht(total);
    const addressLabel = formatAddress(shipping);

    const payload: Record<string, string> = {
      'form-name': product.formName,
      orderNumber,
      product: product.productLabel,
      colour: colourSummary,
      yarn: yarnLabel ?? '',
      promo_code: promo ?? '',
      discount: discount ? bahtDiscount(discount) : '',
      total: totalLabel,
      name: name.trim(),
      email: email.trim(),
      address: addressLabel,
      address_line1: shipping.line1.trim(),
      address_line2: shipping.line2.trim(),
      city: shipping.city.trim(),
      postcode: shipping.postcode.trim(),
      country: shipping.country.trim(),
    };

    if (product.sizing) {
      payload.size = sizeLabel ?? '';
      payload.bust_cm = measurements?.bust ? String(measurements.bust) : '';
      payload.waist_cm = measurements?.waist ? String(measurements.waist) : '';
      payload.hips_cm = measurements?.hips ? String(measurements.hips) : '';
      payload.height_cm = measurements?.height ? String(measurements.height) : '';
    }

    setSending(true);
    setStatus('Submitting...');

    // Netlify Forms stays the durable record of every order, paid or not, so it
    // is filed before payment is attempted rather than after.
    //
    // Best-effort on purpose. Netlify only intercepts POSTs to /__forms.html on
    // a deployed site, so this always 405s in local dev — but more importantly,
    // losing the record must never cost a sale. Payment is the path that
    // matters; the webhook and /api/custom-order both email regardless.
    let redirecting = false;
    try {
      await submitFormFields(payload).catch((err) => {
        console.warn('Netlify Forms record failed — continuing to payment.', err);
      });

      const body = JSON.stringify({
        draft: params.toString(),
        orderNumber,
        customer: { name: name.trim(), email: email.trim(), address: addressLabel },
      });
      const headers = { 'Content-Type': 'application/json' };

      const res = await fetch('/api/create-checkout-session', { method: 'POST', headers, body });
      const data = await res.json().catch(() => ({}));

      // A preset size is priced, so it goes straight to Stripe.
      if (res.ok && data.url) {
        redirecting = true;
        setStatus('Taking you to payment...');
        window.location.href = data.url;
        return;
      }

      // A made-to-measure piece is quoted by hand first: acknowledge it, send
      // the order card, and follow up with a payment link by email.
      if (res.status === 409 && data.quoteOnly) {
        await fetch('/api/custom-order', { method: 'POST', headers, body });
        setStatus('');
        setSubmitted({
          orderNumber,
          colour: colourSummary,
          yarn: yarnLabel,
          size: product.sizing ? sizeLabel : null,
          measurements: measurementSummary,
          discount: discount ? `${bahtDiscount(discount)} (${promo})` : null,
          total: totalLabel,
          name: name.trim(),
          email: email.trim(),
          address: addressLabel,
        });
        return;
      }

      throw new Error(data.error ?? 'Checkout could not be started.');
    } catch {
      setStatus('');
      alert(
        'Something went wrong submitting your order. Please message us directly on Instagram @hello.youloop and we will sort it out.',
      );
    } finally {
      // Left disabled while the browser is on its way to Stripe, so the order
      // cannot be submitted twice.
      if (!redirecting) setSending(false);
    }
  }

  return (
    <div className={s.page}>
      <CheckoutNav backHref={`/collection/${product.slug}`} />

      <div className={c.wrap}>
        <span className={s.secLabel}>Checkout</span>
        <h1 className={c.title}>Review your order</h1>
        <p className={c.intro}>
          One last look before we start. We confirm every detail with you by email before a single
          stitch is made.
        </p>

        <div className={c.piece}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={c.pieceImg} src={swatch.photo} alt={`${product.name} — ${swatch.name}`} />
          <div className={c.pieceInfo}>
            <span className={s.skuTag}>{product.sku}</span>
            <div className={c.pieceName}>{product.name}</div>
            <div className={c.pieceSub}>{product.priceNote}</div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className={s.orderSummary}>
          <div className={s.orderSummaryHeader}>
            <h3>Your order summary</h3>
          </div>
          <div className={s.orderRows}>
            <div className={s.orderRow}>
              <span className={s.orderLabel}>Product</span>
              <span className={s.orderVal}>{product.name}</span>
            </div>
            <div className={s.orderRow}>
              <span className={s.orderLabel}>Colour</span>
              <span className={s.orderVal}>{colourSummary}</span>
            </div>
            {yarn && (
              <div className={s.orderRow}>
                <span className={s.orderLabel}>Yarn</span>
                <span className={s.orderVal}>
                  #{yarn.id} - {yarn.name}
                </span>
              </div>
            )}
            {product.sizing && (
              <>
                <div className={s.orderRow}>
                  <span className={s.orderLabel}>Size</span>
                  <span className={s.orderVal}>{sizeLabel}</span>
                </div>
                <div className={s.orderRow}>
                  <span className={s.orderLabel}>Measurements</span>
                  <span className={s.orderVal}>{measurementSummary}</span>
                </div>
              </>
            )}
            <div className={s.orderRow}>
              <span className={s.orderLabel}>Lead time</span>
              <span className={s.orderVal}>{product.leadTime}</span>
            </div>

            <div className={`${s.orderRow} ${s.promoRow}`}>
              <div className={s.promoInputWrap}>
                <input
                  type="text"
                  className={s.promoInput}
                  placeholder="Promo code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      applyPromo();
                    }
                  }}
                  aria-label="Promo code"
                />
                <button type="button" className={s.promoApply} onClick={applyPromo}>
                  Apply
                </button>
              </div>
              {promoMsg && (
                <div className={`${s.promoMsg} ${promoMsg.ok ? s.ok : s.err}`}>{promoMsg.text}</div>
              )}
            </div>

            {discount > 0 && (
              <div className={s.orderRow}>
                <span className={s.orderLabel}>Discount</span>
                <span className={`${s.orderVal} ${s.discountVal}`}>{bahtDiscount(discount)}</span>
              </div>
            )}

            <div className={`${s.orderRow} ${s.orderTotalRow}`}>
              <span className={s.orderTotalLabel}>Total</span>
              <span className={s.orderTotalVal}>{baht(total)}</span>
            </div>
          </div>
          {isCustomSize && (
            <p className={c.quoteNote}>
              Made to your measurements — this total is our starting quote. We confirm the final
              price with you before anything is cast on.
            </p>
          )}
        </div>

        <Link href={`/collection/${product.slug}`} className={c.editLink}>
          ← Change colour or size
        </Link>

        {/* PERSONAL DETAILS — who is ordering */}
        <div className={s.detailsPanel}>
          <span className={s.detailsTitle}>Personal details</span>
          <div className={s.detailsField}>
            <label className={s.detailsLabel} htmlFor="cust-name">
              Full name
            </label>
            <input
              className={s.detailsInput}
              id="cust-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className={s.detailsField}>
            <label className={s.detailsLabel} htmlFor="cust-email">
              Email
            </label>
            <input
              className={s.detailsInput}
              id="cust-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className={s.detailsNote}>
              We will send order updates and progress photos here.
            </p>
          </div>
        </div>

        {/* SHIPPING DETAILS — where it goes */}
        <div className={s.detailsPanel}>
          <span className={s.detailsTitle}>Shipping details</span>
          <div className={s.detailsField}>
            <label className={s.detailsLabel} htmlFor="ship-line1">
              Address
            </label>
            <input
              className={s.detailsInput}
              id="ship-line1"
              type="text"
              autoComplete="address-line1"
              placeholder="House number and street"
              value={shipping.line1}
              onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
            />
          </div>
          <div className={s.detailsField}>
            <label className={s.detailsLabel} htmlFor="ship-line2">
              Apartment, building, floor <span className={c.optional}>(optional)</span>
            </label>
            <input
              className={s.detailsInput}
              id="ship-line2"
              type="text"
              autoComplete="address-line2"
              placeholder="Unit 4B, Riverside Tower"
              value={shipping.line2}
              onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
            />
          </div>
          <div className={c.fieldRow}>
            <div className={s.detailsField}>
              <label className={s.detailsLabel} htmlFor="ship-city">
                City / Province
              </label>
              <input
                className={s.detailsInput}
                id="ship-city"
                type="text"
                autoComplete="address-level1"
                placeholder="Bangkok"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              />
            </div>
            <div className={s.detailsField}>
              <label className={s.detailsLabel} htmlFor="ship-postcode">
                Postcode
              </label>
              <input
                className={s.detailsInput}
                id="ship-postcode"
                type="text"
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="10110"
                value={shipping.postcode}
                onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
              />
            </div>
          </div>
          <div className={s.detailsField}>
            <label className={s.detailsLabel} htmlFor="ship-country">
              Country
            </label>
            <input
              className={s.detailsInput}
              id="ship-country"
              type="text"
              autoComplete="country-name"
              placeholder="Thailand"
              value={shipping.country}
              onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
            />
          </div>
        </div>

        <button
          type="button"
          className={`${s.cta} ${s.ctaConfirm}`}
          onClick={submitOrder}
          disabled={sending}
        >
          {isCustomSize ? 'Request your quote' : 'Continue to payment'}
        </button>
        <p className={s.submitStatus}>{status}</p>

        <div className={s.trust}>
          {product.trust.map((item) => (
            <span key={item} className={s.trustItem}>
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── CONFIRMATION MODAL ── */}
      <div className={`${s.modalOverlay} ${submitted ? s.open : ''}`}>
        {submitted && (
          <div className={s.modalCard}>
            {/* Only made-to-measure orders reach this modal — a preset size is
                redirected to Stripe and confirmed on /success instead. */}
            <div className={s.modalTitle}>&#10022; We&apos;re on it</div>
            <div className={s.modalSubtitle}>Nothing has been charged yet</div>
            <span className={s.modalOrderNum}>{submitted.orderNumber}</span>

            <div className={s.modalSummary}>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Product</span>
                <span className={s.modalRowVal}>{product.name}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Colour</span>
                <span className={s.modalRowVal}>{submitted.colour}</span>
              </div>
              {submitted.yarn && (
                <div className={s.modalRow}>
                  <span className={s.modalRowLabel}>Yarn</span>
                  <span className={s.modalRowVal}>{submitted.yarn}</span>
                </div>
              )}
              {submitted.size && (
                <>
                  <div className={s.modalRow}>
                    <span className={s.modalRowLabel}>Size</span>
                    <span className={s.modalRowVal}>{submitted.size}</span>
                  </div>
                  <div className={s.modalRow}>
                    <span className={s.modalRowLabel}>Measurements</span>
                    <span className={s.modalRowVal}>{submitted.measurements}</span>
                  </div>
                </>
              )}
              {submitted.discount && (
                <div className={s.modalRow}>
                  <span className={s.modalRowLabel}>Discount</span>
                  <span className={s.modalRowVal}>{submitted.discount}</span>
                </div>
              )}
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Starting quote</span>
                <span className={s.modalRowVal}>{submitted.total}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Name</span>
                <span className={s.modalRowVal}>{submitted.name}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Email</span>
                <span className={s.modalRowVal}>{submitted.email}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Ships to</span>
                <span className={s.modalRowVal}>{submitted.address}</span>
              </div>
            </div>

            <p className={s.modalInstruction}>
              We check every set of measurements by hand before quoting. You&apos;ll have a
              confirmation email shortly, and the final price with a secure payment link within
              one working day.
            </p>
            <Link href="/#collection" className={s.modalClose}>
              Done
            </Link>
          </div>
        )}
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

function CheckoutNav({ backHref = '/#collection' }: { backHref?: string }) {
  return (
    <nav className={s.nav}>
      <Link href={backHref} className={s.navBack}>
        <span className={s.navBackArrow}>&#8592;</span>
        <span>Back</span>
      </Link>
      <Link href="/" className={s.navLogo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BRAND.logo} alt={BRAND.name} className={s.navLogoImg} />
      </Link>
      <div className={s.navRight} />
    </nav>
  );
}
