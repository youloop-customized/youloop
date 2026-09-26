/**
 * The "here's how to pay" email, sent by hand once an order and its price are
 * agreed on chat.
 *
 * Automatic payment through Stripe is built but dormant (see
 * /api/create-checkout-session), so until it is switched on this is how money
 * actually gets collected. It deliberately carries all three methods in one
 * message rather than asking the customer which they prefer first — one
 * round-trip instead of two.
 *
 * Account details come from src/data/payment.ts. Anything still bracketed
 * there is rendered with a visible "to fill in" marker, so a test send of a
 * half-configured template cannot be mistaken for a finished one.
 */

import { BRAND } from '@/data/site';
import { PAYMENT_METHODS, isPlaceholder, type PaymentMethod } from '@/data/payment';

export type PaymentEmailData = {
  customerName: string;
  /** e.g. "YL-482913" */
  orderNumber: string;
  /** What the piece is, e.g. "SR-02 The Soft Riot Crop Set". */
  itemSummary: string;
  /** Preformatted and final, e.g. "฿1,990". */
  amount: string;
  /** How the order was agreed, e.g. "LINE". Used in the closing line. */
  contactMethod: string;
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
  headerSub: '#d9c3cc',
  todoBg: '#fdf3e7',
  todoText: '#7a4a12',
};

function esc(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/** Placeholders render highlighted so an unfinished config is unmissable. */
function fieldValue(value: string): string {
  if (!isPlaceholder(value)) return esc(value);
  return `<span style="background:${C.todoBg};color:${C.todoText};padding:1px 6px;border-radius:4px;font-weight:600;">${esc(value)}</span>`;
}

function methodCard(method: PaymentMethod): string {
  const rows = method.fields
    .map(
      (f) => `<tr>
        <td style="padding:7px 0;font-size:12px;color:${C.label};white-space:nowrap;vertical-align:top;width:40%;">${esc(f.label)}</td>
        <td style="padding:7px 0;font-size:13.5px;color:${C.text};font-family:'SFMono-Regular',Consolas,monospace;">${fieldValue(f.value)}</td>
      </tr>`,
    )
    .join('');

  const note = method.note
    ? `<div style="margin-top:12px;font-size:12px;line-height:1.55;color:${C.muted};">${esc(method.note)}</div>`
    : '';

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;border:1px solid ${C.border};border-radius:12px;background:${C.card};">
    <tr><td style="padding:16px 18px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td width="48" style="width:48px;vertical-align:middle;padding-right:12px;">
            <img src="${esc(BRAND.siteUrl + method.logo)}" width="48" height="48" alt="${esc(method.name)}" style="display:block;width:48px;height:48px;border:0;border-radius:11px;">
          </td>
          <td style="vertical-align:middle;">
            <div style="font-size:15px;font-weight:700;color:${C.text};">${esc(method.name)}</div>
            <div style="font-size:12px;color:${C.muted};margin-top:2px;">${esc(method.bestFor)}</div>
          </td>
        </tr>
      </table>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;border-top:1px solid ${C.border};">
        ${rows}
      </table>
      ${note}
    </td></tr>
  </table>`;
}

export type BuiltEmail = { subject: string; html: string; text: string };

export function paymentInstructionsEmail(data: PaymentEmailData): BuiltEmail {
  const firstName = data.customerName.split(' ')[0] || 'there';
  const cards = PAYMENT_METHODS.map(methodCard).join('');

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${C.page};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};">

        <tr><td style="background:${C.header};padding:22px 24px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.accent};font-weight:700;">YOU LOOP · Payment details</div>
          <div style="font-size:22px;color:#ffffff;margin-top:4px;font-weight:700;">Your request is accepted.</div>
          <div style="font-size:13px;color:${C.headerSub};margin-top:2px;">${esc(data.itemSummary)} · ${esc(data.orderNumber)}</div>
        </td></tr>

        <tr><td style="padding:22px 24px 4px;">
          <div style="font-size:14px;color:${C.text};line-height:1.65;">
            Dear ${esc(firstName)}, thank you for your order. It is confirmed and will enter our production queue once payment is received. We accept payment through the methods below; please use whichever is most convenient.
          </div>
        </td></tr>

        <tr><td style="padding:18px 24px 6px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel};border-radius:10px;">
            <tr><td style="padding:14px 16px;">
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.label};font-weight:700;">Amount due</div>
              <div style="font-size:26px;font-weight:700;color:${C.text};margin-top:4px;">${esc(data.amount)}</div>
              <div style="font-size:12px;color:${C.muted};margin-top:4px;">${esc(data.itemSummary)}</div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:18px 24px 0;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};font-weight:700;margin-bottom:10px;">Accepted payment methods</div>
          ${cards}
        </td></tr>

        <tr><td style="padding:4px 24px 22px;">
          <div style="font-size:13.5px;color:${C.text};line-height:1.65;">
            Once the payment has been made, please reply to this email or message us on ${esc(data.contactMethod)} with a copy of the payment confirmation. We will confirm receipt as soon as the funds arrive and begin work on your piece the same day.
          </div>
          <div style="font-size:12px;color:${C.muted};line-height:1.6;margin-top:12px;">
            Please quote <strong style="color:${C.text};">${esc(data.orderNumber)}</strong> as the payment reference so that we can match your payment to your order.
          </div>
        </td></tr>

        <tr><td style="background:${C.panel};padding:16px 24px;text-align:center;">
          <div style="font-size:12px;color:${C.muted};">
            ${esc(BRAND.name)} · <a href="${esc(BRAND.siteUrl)}" style="color:${C.label};">${esc(BRAND.siteUrl)}</a>
            · <a href="mailto:${esc(BRAND.email)}" style="color:${C.label};">${esc(BRAND.email)}</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const textMethods = PAYMENT_METHODS.map((m) => {
    const lines = m.fields.map((f) => `    ${f.label}: ${f.value}`).join('\n');
    return [`  ${m.name.toUpperCase()}`, `  ${m.bestFor}`, lines, m.note ? `  Note: ${m.note}` : '']
      .filter(Boolean)
      .join('\n');
  }).join('\n\n');

  const text = [
    `YOU LOOP — PAYMENT DETAILS`,
    `${data.itemSummary} · ${data.orderNumber}`,
    '',
    `Dear ${firstName}, thank you for your order. It is confirmed and will enter our production queue once payment is received.`,
    'We accept payment through the methods below; please use whichever is most convenient.',
    '',
    `AMOUNT DUE: ${data.amount}`,
    '',
    'ACCEPTED PAYMENT METHODS',
    '',
    textMethods,
    '',
    `Once the payment has been made, please reply to this email or message us on ${data.contactMethod} with a copy of the payment confirmation.`,
    `Please quote ${data.orderNumber} as the payment reference so that we can match your payment to your order.`,
    '',
    `${BRAND.name} · ${BRAND.siteUrl} · ${BRAND.email}`,
  ].join('\n');

  return {
    subject: `Payment details for your YOU LOOP order (${data.orderNumber})`,
    html,
    text,
  };
}
