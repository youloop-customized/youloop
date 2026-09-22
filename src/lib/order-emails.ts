/**
 * The order emails, in the same table-based HTML that
 * netlify/functions/submission-created.js already uses.
 *
 * Email clients are not browsers: no flexbox, no grid, no external CSS. Nested
 * tables with inline styles are the only layout that survives Gmail, Outlook
 * and Apple Mail alike, and every message carries a plain-text twin for clients
 * that strip HTML entirely.
 *
 * Two customer-facing messages, mirroring the two checkout paths:
 *   - paid          a preset size went through Stripe and is confirmed
 *   - quote         a made-to-measure piece needs pricing before payment
 * Plus the internal notice that tells YOU LOOP an order has landed.
 */

import { BRAND } from '@/data/site';

export type OrderEmailData = {
  orderNumber: string;
  sku: string;
  productName: string;
  colour: string;
  yarn: string | null;
  size: string | null;
  measurements: string;
  /** Preformatted, e.g. "฿2,890". Empty for a quote, where nothing is owed yet. */
  total: string;
  leadTime: string;
  customerName: string;
  customerEmail: string;
  address: string;
  /** How to reach the customer to arrange payment — e.g. "WhatsApp". */
  contactMethod: string;
  contactHandle: string;
};

const C = {
  page: '#f7f0eb',
  card: '#ffffff',
  header: '#2a1a2e',
  accent: '#c4708a',
  text: '#3a1f2b',
  border: '#eadde2',
  label: '#8f4a63',
  panel: '#faf2f5',
  muted: '#a3899a',
  soft: '#8a7080',
  headerSub: '#d9c3cc',
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #f0e2e6;font-size:12px;font-weight:600;color:${C.label};white-space:nowrap;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #f0e2e6;font-size:13px;color:${C.text};">${esc(value)}</td>
  </tr>`;
}

/** The order rows every message shares, minus whatever does not apply. */
function orderRows(data: OrderEmailData): string {
  const rows = [
    row('Piece', `${data.sku} ${data.productName}`),
    row('Colour', data.colour),
    data.yarn ? row('Yarn', data.yarn) : '',
    data.size ? row('Size', data.size) : '',
    data.size && data.measurements !== '-' ? row('Measurements', data.measurements) : '',
    row('Lead time', data.leadTime),
    data.total ? row('Total', data.total) : '',
  ];
  return rows.filter(Boolean).join('');
}

function shell(opts: {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  data: OrderEmailData;
  closing: string;
  showAddress: boolean;
}): string {
  const { eyebrow, title, subtitle, intro, data, closing, showAddress } = opts;

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${C.page};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};">
        <tr><td style="background:${C.header};padding:22px 24px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.accent};font-weight:700;">${esc(eyebrow)}</div>
          <div style="font-size:22px;color:#ffffff;margin-top:4px;font-weight:700;">${esc(title)}</div>
          <div style="font-size:13px;color:${C.headerSub};margin-top:2px;">${esc(subtitle)}</div>
        </td></tr>

        <tr><td style="padding:22px 24px 4px;">
          <div style="font-size:14px;color:${C.text};line-height:1.65;">${esc(intro)}</div>
        </td></tr>

        <tr><td style="padding:18px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};font-weight:700;margin-bottom:6px;">Your order</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${orderRows(data)}
          </table>
        </td></tr>

        ${
          showAddress
            ? `<tr><td style="padding:18px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};font-weight:700;margin-bottom:6px;">Ships to</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', data.customerName)}
            ${row('Address', data.address)}
          </table>
        </td></tr>`
            : ''
        }

        <tr><td style="padding:18px 24px 22px;">
          <div style="background:${C.panel};border-radius:10px;padding:12px 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:${C.label};font-weight:700;padding:2px 0;">Order number</td>
                <td style="font-size:12px;color:${C.text};text-align:right;padding:2px 0;">${esc(data.orderNumber)}</td>
              </tr>
            </table>
          </div>
          <div style="font-size:13px;color:${C.text};line-height:1.65;margin-top:16px;">${esc(closing)}</div>
          <div style="font-size:11px;color:${C.muted};margin-top:18px;border-top:1px solid ${C.border};padding-top:14px;">
            ${esc(BRAND.name)} · <a href="${esc(BRAND.siteUrl)}" style="color:${C.label};">youloop.co</a>
            · <a href="mailto:hello@youloop.co" style="color:${C.label};">hello@youloop.co</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function textBlock(lines: (string | false | null)[]): string {
  return lines.filter((line) => line !== false && line !== null).join('\n');
}

function orderTextLines(data: OrderEmailData): (string | false)[] {
  return [
    `Piece: ${data.sku} ${data.productName}`,
    `Colour: ${data.colour}`,
    Boolean(data.yarn) && `Yarn: ${data.yarn}`,
    Boolean(data.size) && `Size: ${data.size}`,
    Boolean(data.size && data.measurements !== '-') && `Measurements: ${data.measurements}`,
    `Lead time: ${data.leadTime}`,
    Boolean(data.total) && `Total: ${data.total}`,
  ];
}

export type BuiltEmail = { subject: string; html: string; text: string };

/** Sent to the customer once Stripe confirms a preset-size order is paid. */
export function customerPaidEmail(data: OrderEmailData): BuiltEmail {
  const intro = `Thank you, ${data.customerName.split(' ')[0] || 'there'} — your payment came through and your piece is now in the making queue. Everything below is exactly what we will make.`;
  const closing = `We will send you progress photos as it comes together, and let you know the moment it ships. Your lead time is ${data.leadTime} from today. Just reply to this email if anything needs changing.`;

  return {
    subject: `Order confirmed — ${data.sku} ${data.productName} (${data.orderNumber})`,
    html: shell({
      eyebrow: 'YOU LOOP · Order confirmed',
      title: '✦ Your piece is on the hook',
      subtitle: `${data.sku} ${data.productName}`,
      intro,
      data,
      closing,
      showAddress: true,
    }),
    text: textBlock([
      intro,
      '',
      ...orderTextLines(data),
      '',
      `Ships to: ${data.customerName}, ${data.address}`,
      `Order number: ${data.orderNumber}`,
      '',
      closing,
      '',
      `${BRAND.name} · ${BRAND.siteUrl} · hello@youloop.co`,
    ]),
  };
}

/**
 * Sent to the customer for every order placed through the configurator while
 * automatic payment is unavailable. Nothing is charged at this point — every
 * order is confirmed and paid by hand, over the customer's chosen channel.
 *
 * Two cases share this one email: a preset size, where `data.total` is
 * already the real price, and a made-to-measure order, where it is blank and
 * still needs confirming. The copy branches on that so a preset-size customer
 * isn't told we're "quoting" a number they already agreed to on screen.
 */
export function customerQuoteEmail(data: OrderEmailData): BuiltEmail {
  const firstName = data.customerName.split(' ')[0] || 'there';
  const isPriced = Boolean(data.total);

  // Warm and unhurried, the way we'd actually talk to someone about a piece
  // being made by hand — not a payment receipt. Whether or how payment gets
  // arranged is already covered by the note under the chat-channel field on
  // the checkout page, so it doesn't need repeating here.
  const intro = isPriced
    ? `Hi ${firstName}, thank you — we've received your order and we're getting it ready.`
    : `Hi ${firstName}, thank you — we've received your made-to-measure order and we're looking it over now.`;

  const closing = isPriced
    ? `We'll reach out to you on ${data.contactMethod} to confirm every detail before we start creating. Your piece goes into the queue as soon as that's settled.`
    : `We check every set of measurements by hand, so the fit is right from the first stitch. We'll reach out to you on ${data.contactMethod} within one working day to confirm the details and your final price before we start creating.`;

  return {
    subject: `We have your order — ${data.sku} ${data.productName} (${data.orderNumber})`,
    html: shell({
      eyebrow: isPriced ? 'YOU LOOP · Order received' : 'YOU LOOP · Made to measure',
      title: '✦ We are on it',
      subtitle: `${data.sku} ${data.productName}`,
      intro,
      data,
      closing,
      showAddress: true,
    }),
    text: textBlock([
      intro,
      '',
      ...orderTextLines(data),
      '',
      `Ships to: ${data.customerName}, ${data.address}`,
      `Reach us on: ${data.contactMethod} — ${data.contactHandle}`,
      `Order number: ${data.orderNumber}`,
      '',
      closing,
      '',
      `${BRAND.name} · ${BRAND.siteUrl} · hello@youloop.co`,
    ]),
  };
}

/**
 * The internal order card.
 *   paid   money has settled — start making it
 *   quote  made to measure — price it, then send a payment link
 *   failed a delayed payment (PromptPay QR) expired or was declined
 */
export type InternalKind = 'paid' | 'quote' | 'failed';

const INTERNAL_COPY: Record<
  InternalKind,
  { subject: string; eyebrow: string; title: string; intro: (d: OrderEmailData) => string }
> = {
  paid: {
    subject: 'PAID',
    eyebrow: 'YOU LOOP · Paid order',
    title: '✦ New paid order',
    intro: () => 'Paid in full through Stripe. Ready to start.',
  },
  quote: {
    subject: 'ORDER — ARRANGE PAYMENT MANUALLY',
    eyebrow: 'YOU LOOP · Manual order',
    title: '✦ New order — pay by hand',
    intro: (d) =>
      Boolean(d.total)
        ? `Priced order — NOT paid. Automatic payment is off for now, so reach out on ${d.contactMethod} (${d.contactHandle}) to confirm and take payment there.`
        : `Made-to-measure order — NOT paid and not yet priced. Confirm the measurements, then reach out on ${d.contactMethod} (${d.contactHandle}) with the final price and take payment there.`,
  },
  failed: {
    subject: 'PAYMENT FAILED',
    eyebrow: 'YOU LOOP · Payment failed',
    title: '✦ Payment did not go through',
    intro: (d) =>
      `This order reached checkout but the payment failed or expired — a PromptPay QR left unscanned does this. Nothing has been charged. Worth following up with ${d.customerEmail}.`,
  },
};

export function internalOrderEmail(data: OrderEmailData, kind: InternalKind): BuiltEmail {
  const copy = INTERNAL_COPY[kind];
  const intro = copy.intro(data);
  const closing =
    kind === 'quote'
      ? `Contact: ${data.customerName} · ${data.customerEmail} · ${data.contactMethod}: ${data.contactHandle}. Confirm the order and take payment there — bank transfer or whatever you've agreed works, no Stripe link needed.`
      : `Contact: ${data.customerName} · ${data.customerEmail}`;

  return {
    subject: `✦ ${copy.subject} — ${data.sku} ${data.productName} — ${data.customerName} (${data.orderNumber})`,
    html: shell({
      eyebrow: copy.eyebrow,
      title: copy.title,
      subtitle: `${data.customerName} — ${data.sku} ${data.productName}`,
      intro,
      data,
      closing,
      showAddress: true,
    }),
    text: textBlock([
      intro,
      '',
      ...orderTextLines(data),
      '',
      `Customer: ${data.customerName} <${data.customerEmail}>`,
      `Ships to: ${data.address}`,
      `Order number: ${data.orderNumber}`,
      '',
      closing,
    ]),
  };
}
