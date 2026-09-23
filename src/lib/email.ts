/**
 * Transactional email through Resend.
 *
 * Deliberately a plain fetch rather than the SDK: netlify/functions/
 * submission-created.js already talks to this same REST endpoint the same way,
 * and it runs outside the Next bundle, so an SDK would have to be installed and
 * kept in step twice.
 *
 * Every send is a no-op when RESEND_API_KEY is unset, and a failed send never
 * throws. An order must not be lost because the mail provider had a bad minute
 * — the payment has already succeeded by the time most of these are sent.
 */

import { BRAND } from '@/data/site';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/** Resend's sandbox sender, which can only deliver to your own account email. */
const SANDBOX_FROM = 'YOU LOOP <onboarding@resend.dev>';

export type Email = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /**
   * Stripe retries a webhook on any non-2xx reply, so the same event can arrive
   * more than once. A stable key here lets Resend collapse those retries into a
   * single delivery rather than mailing the customer twice.
   */
  idempotencyKey?: string;
  /**
   * Where a reply should go. Without it a reply lands on RESEND_FROM, which is
   * a send-only address — so every 'just reply to this email' in these
   * templates was a dead end. Customer mail points at the studio inbox;
   * internal notices point at the customer, so answering a lead is one tap.
   */
  replyTo?: string;
};

/** Where the internal "new order" notices go. */
export function internalRecipient(): string {
  return process.env.NOTIFY_EMAIL || 'hello.youloop@gmail.com';
}

/**
 * True once RESEND_FROM points at a verified domain. Until then Resend only
 * delivers to the account owner, so customer-facing mail is skipped rather
 * than silently dropped by the API.
 */
export function canEmailCustomers(): boolean {
  const from = process.env.RESEND_FROM;
  return Boolean(from && !from.includes('onboarding@resend.dev'));
}

export async function sendEmail(email: Email): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set — skipped email:', email.subject);
    return false;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  if (email.idempotencyKey) headers['Idempotency-Key'] = email.idempotencyKey;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        from: process.env.RESEND_FROM || SANDBOX_FROM,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      console.error('Resend API error', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('Could not reach Resend.', err);
    return false;
  }
}

/**
 * Sends to the customer only when the from-address is a verified domain.
 * Returns false (without erroring) while RESEND_FROM is still the sandbox.
 */
export async function sendCustomerEmail(email: Email): Promise<boolean> {
  if (!canEmailCustomers()) {
    console.warn(
      'RESEND_FROM is still the Resend sandbox sender — customer email not sent:',
      email.subject,
    );
    return false;
  }
  // Default rather than require: the one thing a customer email must never do
  // is invite a reply that goes nowhere, so this cannot be forgotten at a
  // call site. BRAND.email is the published, monitored address.
  return sendEmail({ replyTo: BRAND.email, ...email });
}
