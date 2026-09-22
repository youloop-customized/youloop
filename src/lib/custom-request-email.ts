/**
 * The "we have your request" email for the Create Your Look wizard.
 *
 * Distinct from src/lib/order-emails.ts: those are built around a resolved
 * catalogue order (SKU, price, size) that Stripe already trusts. A custom
 * request has no such fixed shape — its fields differ by path (reference vs.
 * guided) and nothing is charged yet — so this gets its own template rather
 * than being forced into OrderEmailData. The visual language (colours, table
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
    d.yarns ? row('Yarn colours', d.yarns) : '',
    d.size ? row('Size', d.size) : '',
    d.height ? row('Height', d.height) : '',
    d.notes && d.notes !== '(no extra notes)' ? row('Notes', d.notes) : '',
  ]
    .filter(Boolean)
    .join('');
}

export type BuiltEmail = { subject: string; html: string; text: string };

export function customerRequestEmail(d: CustomRequestEmailData): BuiltEmail {
  const firstName = d.customerName.split(' ')[0] || 'there';
  const intro = `Thank you, ${firstName} — we have your idea and we're reviewing it now. Nothing has been charged.`;
  const reachOut = d.contactHandle
    ? `We'll reach out on ${d.contactMethod} (${d.contactHandle}) within one working day with your quote and next steps.`
    : `We'll reply by email within one working day with your quote and next steps.`;

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
            · <a href="mailto:hello@youloop.co" style="color:${C.label};">hello@youloop.co</a>
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
    d.yarns && `Yarn colours: ${d.yarns}`,
    d.size && `Size: ${d.size}`,
    d.height && `Height: ${d.height}`,
    d.notes && d.notes !== '(no extra notes)' && `Notes: ${d.notes}`,
    '',
    `Starting quote: ${d.startingPrice}`,
    `Request number: ${d.requestId}`,
    '',
    'Your final price depends on yarn, size and detail — we confirm it with you before anything is cast on.',
    reachOut,
    '',
    `${BRAND.name} · ${BRAND.siteUrl} · hello@youloop.co`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');

  return {
    subject: `We have your idea — ${d.making} (${d.requestId})`,
    html,
    text,
  };
}
