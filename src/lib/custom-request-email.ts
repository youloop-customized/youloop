/**
 * The "we have your request" email for the Create Your Look wizard.
 *
 * Distinct from src/lib/order-emails.ts: those are built around a resolved
 * catalogue order (SKU, price, size) that Stripe already trusts. A custom
 * request has no such fixed shape — its fields differ by path (reference vs.
 * guided) and nothing is charged yet — so this gets its own template rather
 * than being forced into OrderEmailData. The visual language (colors, table
 * layout, esc/row helpers) is kept identical to order-emails.ts on purpose,
 * so every YOU LOOP email reads as one system.
 */

import { BRAND } from '@/data/site';

export type CustomRequestEmailData = {
  requestId: string;
  customerName: string;
  /** What the studio is making — the reference target or the base shape. */
  making: string;
  enteredVia: string;
  referenceUrl: string;
  keepAsShown: string;
  size: string;
  height: string;
  silhouette: string;
  details: string;
  yarns: string;
  notes: string;
  /** Preformatted, e.g. "฿2,490" — the starting quote, not a final price. */
  startingPrice: string;
  contactMethod: string;
  contactHandle: string;
  /** The flattened one-line shipping address, same shape as the checkout flow. */
  address: string;
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

/** Only the rows this particular request actually has something to say. */
function requestRows(d: CustomRequestEmailData): string {
  return [
    row('Making', d.making),
    d.referenceUrl ? row('Reference link', d.referenceUrl) : '',
    d.keepAsShown ? row('Keep exactly as shown', d.keepAsShown) : '',
    d.silhouette ? row('Silhouette', d.silhouette) : '',
    d.details ? row('Details', d.details) : '',
    d.yarns ? row('Yarn colors', d.yarns) : '',
    d.size ? row('Size', d.size) : '',
    d.height ? row('Height', d.height) : '',
    d.notes && d.notes !== '(no extra notes)' ? row('Notes', d.notes) : '',
    d.address ? row('Ships to', d.address) : '',
  ]
    .filter(Boolean)
    .join('');
}

export type BuiltEmail = { subject: string; html: string; text: string };

export function customerRequestEmail(d: CustomRequestEmailData): BuiltEmail {
  const firstName = d.customerName.split(' ')[0] || 'there';
  // Warm and unhurried, the way we'd actually talk to someone about a piece
  // being made by hand — not a payment receipt. Whether or how payment gets
  // arranged is already covered by the note under the chat-channel field on
  // the form, so it doesn't need repeating here.
  const intro = `Hi ${firstName}, thank you — we've received your idea and we're looking it over now.`;
  const reachOut = d.contactHandle
    ? `We'll reach out to you on ${d.contactMethod} (${d.contactHandle}) within one working day to confirm every detail before we start creating.`
    : `We'll reply by email within one working day to confirm every detail before we start creating.`;

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${C.page};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};">
        <tr><td style="background:${C.header};padding:22px 24px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.accent};font-weight:700;">YOU LOOP · Request received</div>
          <div style="font-size:22px;color:#ffffff;margin-top:4px;font-weight:700;">✦ Your idea is with us</div>
          <div style="font-size:13px;color:${C.headerSub};margin-top:2px;">${esc(d.making)} · ${esc(d.enteredVia)}</div>
        </td></tr>

        <tr><td style="padding:22px 24px 4px;">
          <div style="font-size:14px;color:${C.text};line-height:1.65;">${esc(intro)}</div>
        </td></tr>

        <tr><td style="padding:18px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};font-weight:700;margin-bottom:6px;">Your request</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${requestRows(d)}
          </table>
        </td></tr>

        <tr><td style="padding:18px 24px 22px;">
          <div style="background:${C.panel};border-radius:10px;padding:12px 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:12px;color:${C.label};font-weight:700;padding:2px 0;">Starting quote</td>
                <td style="font-size:12px;color:${C.text};text-align:right;padding:2px 0;">${esc(d.startingPrice)}</td>
              </tr>
              <tr>
                <td style="font-size:12px;color:${C.label};font-weight:700;padding:2px 0;">Request number</td>
                <td style="font-size:12px;color:${C.text};text-align:right;padding:2px 0;">${esc(d.requestId)}</td>
              </tr>
            </table>
          </div>
          <div style="font-size:13px;color:${C.text};line-height:1.65;margin-top:16px;">
            Your final price depends on yarn, size and detail — we confirm it with you before anything is cast on. ${esc(reachOut)}
          </div>
          <div style="font-size:11px;color:${C.muted};margin-top:18px;border-top:1px solid ${C.border};padding-top:14px;">
            ${esc(BRAND.name)} · <a href="${esc(BRAND.siteUrl)}" style="color:${C.label};">youloop.co</a>
            · <a href="mailto:${BRAND.email}" style="color:${C.label};">${BRAND.email}</a>
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    intro,
    '',
    `Making: ${d.making}`,
    d.referenceUrl && `Reference link: ${d.referenceUrl}`,
    d.keepAsShown && `Keep exactly as shown: ${d.keepAsShown}`,
    d.silhouette && `Silhouette: ${d.silhouette}`,
    d.details && `Details: ${d.details}`,
    d.yarns && `Yarn colors: ${d.yarns}`,
    d.size && `Size: ${d.size}`,
    d.height && `Height: ${d.height}`,
    d.notes && d.notes !== '(no extra notes)' && `Notes: ${d.notes}`,
    d.address && `Ships to: ${d.address}`,
    '',
    `Starting quote: ${d.startingPrice}`,
    `Request number: ${d.requestId}`,
    '',
    'Your final price depends on yarn, size and detail — we confirm it with you before anything is cast on.',
    reachOut,
    '',
    `${BRAND.name} · ${BRAND.siteUrl} · ${BRAND.email}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');

  return {
    subject: `We have your idea — ${d.making} (${d.requestId})`,
    html,
    text,
  };
}

/**
 * The studio's copy of a Create Your Look request — a fallback, not the norm.
 *
 * Normally the internal notice comes from netlify/functions/submission-created.js,
 * which fires off the Netlify Forms record and can therefore include the
 * customer's uploaded inspiration images. That submission is filed
 * best-effort (a failure must not cost the customer their confirmation), which
 * left a hole: if it failed, the customer was told "we have your idea" and the
 * studio was never told anything at all.
 *
 * This is sent only when the browser reports that the Netlify record did not
 * file, so the request still reaches someone. It carries every field except
 * the uploads, which only exist inside the submission that failed — hence the
 * warning banner telling whoever reads it to ask the customer for the photos.
 */
export function internalRequestFallbackEmail(d: CustomRequestEmailData): BuiltEmail {
  const contact = d.contactHandle
    ? `${d.contactMethod}: ${d.contactHandle}`
    : d.contactMethod || 'not given';

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${C.page};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};">
        <tr><td style="background:${C.header};padding:22px 24px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.accent};font-weight:700;">YOU LOOP · Custom request</div>
          <div style="font-size:22px;color:#ffffff;margin-top:4px;font-weight:700;">New request — action needed</div>
          <div style="font-size:13px;color:${C.headerSub};margin-top:2px;">${esc(d.making)} · ${esc(d.requestId)}</div>
        </td></tr>

        <tr><td style="padding:18px 24px 0;">
          <div style="background:#fdf3e7;border:1px solid #e8c89a;border-radius:10px;padding:12px 14px;font-size:13px;color:#7a4a12;line-height:1.6;">
            <strong>This did not reach Netlify Forms.</strong> It is not in your dashboard and any
            inspiration photos the customer uploaded were not saved — ask them to resend the
            images on ${esc(d.contactMethod || 'chat')}. The customer has already had their
            confirmation, so they are expecting a reply.
          </div>
        </td></tr>

        <tr><td style="padding:18px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};font-weight:700;margin-bottom:6px;">Customer</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', d.customerName)}
            ${row('Contact', contact)}
            ${d.address ? row('Ships to', d.address) : ''}
          </table>
        </td></tr>

        <tr><td style="padding:18px 24px 22px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};font-weight:700;margin-bottom:6px;">The request</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${requestRows(d)}
            ${row('Starting quote', d.startingPrice)}
            ${row('Entered via', d.enteredVia)}
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `NEW CUSTOM REQUEST — ${d.requestId}`,
    '',
    'WARNING: this did not reach Netlify Forms. It is not in your dashboard and any',
    'uploaded inspiration photos were not saved — ask the customer to resend them.',
    'The customer has already had their confirmation and is expecting a reply.',
    '',
    `Name: ${d.customerName}`,
    `Contact: ${contact}`,
    d.address && `Ships to: ${d.address}`,
    '',
    `Making: ${d.making}`,
    `Entered via: ${d.enteredVia}`,
    d.referenceUrl && `Reference link: ${d.referenceUrl}`,
    d.keepAsShown && `Keep exactly as shown: ${d.keepAsShown}`,
    d.silhouette && `Silhouette: ${d.silhouette}`,
    d.details && `Details: ${d.details}`,
    d.yarns && `Yarn colors: ${d.yarns}`,
    d.size && `Size: ${d.size}`,
    d.height && `Height: ${d.height}`,
    d.notes && d.notes !== '(no extra notes)' && `Notes: ${d.notes}`,
    '',
    `Starting quote: ${d.startingPrice}`,
  ]
    .filter((line): line is string => Boolean(line) || line === '')
    .join('\n');

  return {
    subject: `[Action needed] Custom request ${d.requestId} — ${d.making}`,
    html,
    text,
  };
}
