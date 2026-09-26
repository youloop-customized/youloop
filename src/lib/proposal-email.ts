/**
 * The design proposal sent to a customer after a Create Your Look request:
 * the mockup we have drawn up, the specification it locks in, and the price.
 *
 * The important constraint is that Gmail, Outlook and Apple Mail all block
 * remote images by default on a first email from an unknown sender. The
 * mockup carries the whole design, so if the specification only existed
 * inside that picture the email would arrive meaning nothing. Every detail in
 * the image is therefore repeated as text below it, and the image is framed
 * as confirmation of the spec rather than the spec itself.
 *
 * Sent by hand once a quote is agreed, like the payment email — automatic
 * checkout through Stripe is built but dormant.
 */

import { BRAND } from '@/data/site';
import { baht } from '@/lib/format';

export type ProposalSpec = { label: string; value: string };

export type ProposalEmailData = {
  customerName: string;
  /** e.g. "CR-4821" — ties back to the Create Your Look submission. */
  requestId: string;
  /** What we are making, e.g. "Custom Crochet Midi Dress". */
  pieceName: string;
  /** Site-relative path to the mockup, e.g. "/images/proposals/x.jpg". */
  mockupPath: string;
  /** Carries the design when images are blocked, so it is a real sentence. */
  mockupAlt: string;
  /** Everything visible in the mockup, repeated as text. */
  specs: ProposalSpec[];
  /** In baht, e.g. 3900. The template formats these and adds them up —
   *  passing preformatted strings would let the total drift from its parts. */
  price: number;
  /** In baht, e.g. 1500. */
  shipping: number;
  leadTime: string;
  /**
   * Order-specific small print, e.g. "Back view and shoes are not specified as
   * part of this order." Mockups usually carry these as text baked into the
   * image, which blocked images would hide — so they are repeated here.
   */
  caveats?: string[];
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

export type BuiltEmail = { subject: string; html: string; text: string };

export function proposalEmail(data: ProposalEmailData): BuiltEmail {
  const firstName = data.customerName.split(' ')[0] || 'there';
  const mockupUrl = BRAND.siteUrl + data.mockupPath;

  const caveatsBlock = (data.caveats ?? []).length
    ? `<div style="font-size:11.5px;color:${C.muted};line-height:1.6;margin-top:8px;">${(
        data.caveats ?? []
      )
        .map((c) => `• ${esc(c)}`)
        .join('<br>')}</div>`
    : '';

  const specRows = data.specs
    .map(
      (s) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid ${C.border};font-size:12px;font-weight:600;color:${C.label};white-space:nowrap;vertical-align:top;width:42%;">${esc(s.label)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid ${C.border};font-size:13.5px;color:${C.text};">${esc(s.value)}</td>
      </tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html>
<body style="margin:0;padding:0;background:${C.page};font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.card};border-radius:16px;overflow:hidden;border:1px solid ${C.border};">

        <tr><td style="background:${C.header};padding:22px 24px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.accent};font-weight:700;">YOU LOOP · Custom order proposal</div>
          <div style="font-size:22px;color:#ffffff;margin-top:4px;font-weight:700;">Here is your piece</div>
          <div style="font-size:13px;color:${C.headerSub};margin-top:2px;">${esc(data.pieceName)} · ${esc(data.requestId)}</div>
        </td></tr>

        <tr><td style="padding:22px 24px 4px;">
          <div style="font-size:14px;color:${C.text};line-height:1.65;">
            Hi ${esc(firstName)}, thank you for your brief — here is the design we made for you. Everything shown is listed underneath so you can check it line by line.
          </div>
        </td></tr>

        <tr><td style="padding:18px 24px 0;">
          <a href="${esc(mockupUrl)}" style="text-decoration:none;">
            <img src="${esc(mockupUrl)}" width="552" alt="${esc(data.mockupAlt)}" style="display:block;width:100%;max-width:552px;height:auto;border:1px solid ${C.border};border-radius:12px;">
          </a>
          <div style="font-size:11.5px;color:${C.muted};margin-top:8px;text-align:center;">
            Not showing? <a href="${esc(mockupUrl)}" style="color:${C.label};">Open the mockup in your browser</a>.
          </div>
        </td></tr>

        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};font-weight:700;margin-bottom:6px;">What we will make</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${specRows}
          </table>
        </td></tr>

        <tr><td style="padding:18px 24px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.panel};border-radius:10px;">
            <tr><td style="padding:14px 16px;">
              <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.label};font-weight:700;margin-bottom:8px;">Price</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:13.5px;color:${C.text};padding:3px 0;">Your piece</td>
                  <td align="right" style="font-size:13.5px;color:${C.text};padding:3px 0;">${esc(baht(data.price))}</td>
                </tr>
                <tr>
                  <td style="font-size:13.5px;color:${C.text};padding:3px 0;">Shipping</td>
                  <td align="right" style="font-size:13.5px;color:${C.text};padding:3px 0;">${esc(baht(data.shipping))}</td>
                </tr>
                <tr>
                  <td style="font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${C.label};padding:10px 0 0;border-top:1px solid ${C.border};">Total</td>
                  <td align="right" style="font-size:24px;font-weight:700;color:${C.text};padding:8px 0 0;border-top:1px solid ${C.border};">${esc(baht(data.price + data.shipping))}</td>
                </tr>
              </table>
              <div style="font-size:12px;color:${C.muted};margin-top:8px;">Made to order · ${esc(data.leadTime)} once confirmed</div>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:18px 24px 6px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.accent};font-weight:700;margin-bottom:6px;">Next</div>
          <div style="font-size:13.5px;color:${C.text};line-height:1.7;">
            Happy with it? Reply to <a href="mailto:${esc(BRAND.email)}" style="color:${C.label};">${esc(BRAND.email)}</a> and we will send payment details.<br>
            Want something changed? Tell us what to adjust — colour, length, neckline, anything.
          </div>
        </td></tr>

        <tr><td style="padding:6px 24px 22px;">
          <div style="font-size:11.5px;color:${C.muted};line-height:1.6;">
            The mockup is an illustration of the design. Your piece is crocheted by hand, so small variations in stitch and drape are part of it — the specification above is what we work to.
          </div>
          ${caveatsBlock}
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

  const text = [
    'YOU LOOP — CUSTOM ORDER PROPOSAL',
    `${data.pieceName} · ${data.requestId}`,
    '',
    `Hi ${firstName}, thank you for your brief — here is the design we made for you.`,
    '',
    `See the mockup: ${mockupUrl}`,
    '',
    'WHAT WE WILL MAKE',
    ...data.specs.map((s) => `  ${s.label}: ${s.value}`),
    '',
    `Your piece: ${baht(data.price)}`,
    `Shipping:   ${baht(data.shipping)}`,
    `TOTAL:      ${baht(data.price + data.shipping)}`,
    `Made to order · ${data.leadTime} once confirmed`,
    '',
    'NEXT',
    `Happy with it? Reply to ${BRAND.email} and we will send payment details.`,
    'Want something changed? Tell us what to adjust — colour, length, neckline, anything.',
    '',
    'The mockup is an illustration of the design. Your piece is crocheted by hand, so small',
    'variations in stitch and drape are part of it — the specification above is what we work to.',
    ...(data.caveats ?? []).map((c) => `• ${c}`),
    '',
    `${BRAND.name} · ${BRAND.siteUrl} · ${BRAND.email}`,
  ].join('\n');

  return {
    subject: `Your custom piece — proposal and price (${data.requestId})`,
    html,
    text,
  };
}
