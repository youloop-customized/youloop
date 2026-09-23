'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CONTACT_METHODS } from '@/data/customRequest';
import { PROMO_CODES } from '@/data/products';
import { BRAND } from '@/data/site';
import { baht, bahtDiscount, generateOrderNumber } from '@/lib/format';
import { submitFormFields } from '@/lib/netlify';
import { resolveOrder } from '@/lib/order';
import s from './Configurator.module.css';
import c from './Checkout.module.css';

type SubmittedOrder = {
  orderNumber: string;
  color: string;
  yarn: string | null;
  size: string | null;
  measurements: string;
  discount: string | null;
  total: string;
  isCustomSize: boolean;
  name: string;
  email: string;
  address: string;
  contactMethod: string;
  contactHandle: string;
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

function isUsableHandle(value: string): boolean {
  return value.trim().length >= 3;
}

/** Same shape the Create Your Look wizard enforces, so the two order paths
 *  agree on what a usable email address looks like. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Step two of the order flow: the full summary, the customer's details and the
 * one button that actually sends the order. The configurator hands the chosen
 * color and size over in the query string (see src/lib/order.ts).
 */
export default function Checkout() {
  const params = useSearchParams();
  const order = useMemo(() => resolveOrder(new URLSearchParams(params.toString())), [params]);

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<string | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // No default: automatic payment being off means this is how payment
  // actually gets arranged, so it has to be a deliberate choice, not
  // whatever channel happened to be first in the list.
  const [contactMethod, setContactMethod] = useState<string | null>(null);
  const [contactHandle, setContactHandle] = useState('');
  const [shipping, setShipping] = useState<Shipping>(EMPTY_SHIPPING);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedOrder | null>(null);
  // Which fields the customer has actually left, so an untouched form is not
  // covered in red before anyone has typed anything.
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
            This checkout link is missing part of the piece you configured. Choose your color and
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
  const contact = CONTACT_METHODS.find((m) => m.value === contactMethod) ?? null;

  const nameValid = name.trim().length > 0;
  const emailValid = EMAIL_RE.test(email.trim());
  const handleValid = Boolean(contact) && isUsableHandle(contactHandle);
  const shippingInvalid = (key: keyof Shipping) => !shipping[key].trim();
  const canSubmit =
    nameValid && emailValid && handleValid && !REQUIRED_SHIPPING.some(shippingInvalid);

  const touch = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));
  /** An error only once the field has been left, never while still typing. */
  const errorFor = (key: string, invalid: boolean, message: string) =>
    touched[key] && invalid ? message : '';
  const fieldClass = (key: string, invalid: boolean) =>
    `${s.detailsInput} ${touched[key] && invalid ? s.detailsInputInvalid : ''}`;

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
    // This page used to stop on three browser alert() popups while the Create
    // Your Look wizard next door showed inline errors and kept its button
    // disabled until the form was valid. Same errors, shown the same way, in
    // both order paths — and an email typo is now caught here rather than
    // coming back as a 400 from the API.
    // `|| !contact` is redundant with canSubmit (handleValid requires one) but
    // narrows the type for the payload below.
    if (!canSubmit || !contact) {
      setTouched({
        name: true,
        email: true,
        contactHandle: true,
        ...Object.fromEntries(REQUIRED_SHIPPING.map((key) => [key, true])),
      });
      setStatus('Please complete the highlighted fields.');
      return;
    }
    setStatus('');

    const orderNumber = generateOrderNumber();
    const yarnLabel = yarn ? `#${yarn.id} - ${yarn.name}` : null;
    const totalLabel = baht(total);
    const addressLabel = formatAddress(shipping);
    const contactHandleTrimmed = contactHandle.trim();

    const payload: Record<string, string> = {
      'form-name': product.formName,
      orderNumber,
      product: product.productLabel,
      color: colourSummary,
      yarn: yarnLabel ?? '',
      promo_code: promo ?? '',
      discount: discount ? bahtDiscount(discount) : '',
      total: totalLabel,
      name: name.trim(),
      email: email.trim(),
      contact_method: contact.label,
      contact_handle: contactHandleTrimmed,
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

    // Netlify Forms stays the durable record of every order — filed before
    // the confirmation email is attempted, so losing that email never means
    // losing the order.
    //
    // Best-effort on purpose. Netlify only intercepts POSTs to /__forms.html on
    // a deployed site, so this always 405s in local dev.
    try {
      await submitFormFields(payload).catch((err) => {
        console.warn('Netlify Forms record failed — continuing anyway.', err);
      });

      // Automatic payment (Stripe) is built but dormant until the account is
      // verified — see /api/create-checkout-session. Every order goes through
      // the same manual-confirmation path for now, regardless of whether the
      // size is a preset or made-to-measure; /api/custom-order already tells
      // the customer and the studio, and picks its copy based on whether the
      // price is fixed or still needs confirming.
      const res = await fetch('/api/custom-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: params.toString(),
          orderNumber,
          // Only the code goes over the wire — the server re-reads the
          // percentage from PROMO_CODES so the emails cannot be talked into
          // quoting a discount that was never offered.
          promoCode: promo ?? '',
          customer: {
            name: name.trim(),
            email: email.trim(),
            address: addressLabel,
            contactMethod: contact.label,
            contactHandle: contactHandleTrimmed,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'Order could not be submitted.');

      setStatus('');
      setSubmitted({
        orderNumber,
        color: colourSummary,
        yarn: yarnLabel,
        size: product.sizing ? sizeLabel : null,
        measurements: measurementSummary,
        discount: discount ? `${bahtDiscount(discount)} (${promo})` : null,
        total: totalLabel,
        isCustomSize,
        name: name.trim(),
        email: email.trim(),
        address: addressLabel,
        contactMethod: contact.label,
        contactHandle: contactHandleTrimmed,
      });
    } catch {
      setStatus('');
      alert(
        'Something went wrong submitting your order. Please message us directly on Instagram @hello.youloop and we will sort it out.',
      );
    } finally {
      setSending(false);
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
              <span className={s.orderLabel}>Color</span>
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
          ← Change color or size
        </Link>

        {/* PERSONAL DETAILS — who is ordering */}
        <div className={s.detailsPanel}>
          <span className={s.detailsTitle}>Personal details</span>
          <div className={s.detailsField}>
            <label className={s.detailsLabel} htmlFor="cust-name">
              Full name
            </label>
            <input
              className={fieldClass('name', !nameValid)}
              id="cust-name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => touch('name')}
            />
            {errorFor('name', !nameValid, 'Please tell us your name.') && (
              <p className={s.detailsError}>{errorFor('name', !nameValid, 'Please tell us your name.')}</p>
            )}
          </div>
          <div className={s.detailsField}>
            <label className={s.detailsLabel} htmlFor="cust-email">
              Email
            </label>
            <input
              className={fieldClass('email', !emailValid)}
              id="cust-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => touch('email')}
            />
            {errorFor('email', !emailValid, 'Enter a valid email address, e.g. you@example.com.') ? (
              <p className={s.detailsError}>
                {errorFor('email', !emailValid, 'Enter a valid email address, e.g. you@example.com.')}
              </p>
            ) : (
              <p className={s.detailsNote}>We will send order updates here.</p>
            )}
          </div>

          <div className={s.detailsField}>
            <label className={s.detailsLabel}>Preferred chat channel</label>
            <div className={s.channelChips}>
              {CONTACT_METHODS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${s.channelChip} ${contactMethod === option.value ? s.active : ''}`}
                  onClick={() => {
                    setContactMethod(option.value);
                    setContactHandle('');
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {contact && (
              <input
                className={fieldClass('contactHandle', !handleValid)}
                type="text"
                inputMode={contact.value === 'whatsapp' ? 'tel' : 'text'}
                placeholder={contact.placeholder}
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
                onBlur={() => touch('contactHandle')}
                aria-label={contact.fieldLabel ?? 'Chat handle'}
                style={{ marginTop: 8 }}
              />
            )}
            {touched.contactHandle && !handleValid && (
              <p className={s.detailsError}>
                Pick a channel and add your {(contact?.fieldLabel ?? 'handle').toLowerCase()} — this is how we
                confirm your order and arrange payment.
              </p>
            )}
            <p className={s.detailsNote}>
              Online payment is on its way — for now, we confirm your order and arrange payment
              together here, so nothing is charged until you&apos;re both ready.
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
              className={fieldClass('line1', shippingInvalid('line1'))}
              id="ship-line1"
              type="text"
              autoComplete="address-line1"
              placeholder="House number and street"
              value={shipping.line1}
              onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
              onBlur={() => touch('line1')}
            />
            {touched.line1 && shippingInvalid('line1') && (
              <p className={s.detailsError}>Add your street address.</p>
            )}
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
                className={fieldClass('city', shippingInvalid('city'))}
                id="ship-city"
                type="text"
                autoComplete="address-level1"
                placeholder="Bangkok"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                onBlur={() => touch('city')}
              />
              {touched.city && shippingInvalid('city') && (
                <p className={s.detailsError}>Add your city or province.</p>
              )}
            </div>
            <div className={s.detailsField}>
              <label className={s.detailsLabel} htmlFor="ship-postcode">
                Postcode
              </label>
              <input
                className={fieldClass('postcode', shippingInvalid('postcode'))}
                id="ship-postcode"
                type="text"
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="10110"
                value={shipping.postcode}
                onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
                onBlur={() => touch('postcode')}
              />
              {touched.postcode && shippingInvalid('postcode') && (
                <p className={s.detailsError}>Add your postcode.</p>
              )}
            </div>
          </div>
          <div className={s.detailsField}>
            <label className={s.detailsLabel} htmlFor="ship-country">
              Country
            </label>
            <input
              className={fieldClass('country', shippingInvalid('country'))}
              id="ship-country"
              type="text"
              autoComplete="country-name"
              placeholder="Thailand"
              value={shipping.country}
              onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
              onBlur={() => touch('country')}
            />
            {touched.country && shippingInvalid('country') && (
              <p className={s.detailsError}>Add your country.</p>
            )}
          </div>
        </div>

        <button
          type="button"
          className={`${s.cta} ${s.ctaConfirm}`}
          onClick={submitOrder}
          disabled={sending || !canSubmit}
        >
          {isCustomSize ? 'Request your quote' : 'Confirm My Order'}
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
            {/* Every order reaches this modal while automatic payment is off —
                see the comment on /api/custom-order for why. */}
            <div className={s.modalTitle}>&#10022; We&apos;re on it</div>
            <div className={s.modalSubtitle}>Nothing has been charged yet</div>
            <span className={s.modalOrderNum}>{submitted.orderNumber}</span>

            <div className={s.modalSummary}>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Product</span>
                <span className={s.modalRowVal}>{product.name}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Color</span>
                <span className={s.modalRowVal}>{submitted.color}</span>
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
                <span className={s.modalRowLabel}>
                  {submitted.isCustomSize ? 'Starting quote' : 'Total'}
                </span>
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
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Reach us on</span>
                <span className={s.modalRowVal}>
                  {submitted.contactMethod} — {submitted.contactHandle}
                </span>
              </div>
            </div>

            <p className={s.modalInstruction}>
              {submitted.isCustomSize
                ? `We check every set of measurements by hand before confirming the price. You'll have a confirmation email shortly, and we'll message you on ${submitted.contactMethod} within one working day to confirm everything and arrange payment.`
                : `You'll have a confirmation email shortly, and we'll message you on ${submitted.contactMethod} to confirm everything and arrange payment — online payment is on its way, but for now this is how we take care of it.`}
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
