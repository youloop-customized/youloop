/**
 * Sends the "we have your idea" confirmation for the Create Your Look wizard.
 *
 * The Netlify Forms submission (public/__forms.html) is still the durable
 * record and the trigger for the internal order-card email — that flow
 * already works via netlify/functions/submission-created.js and is untouched
 * here. This route only adds what was missing: a customer-facing receipt,
 * mirroring how the collection checkout confirms a paid or quoted order.
 *
 * Nothing is charged from a custom request, so — unlike the checkout session
 * route — there is no price to protect from a tampered client payload. The
 * display text is trusted the same way the Netlify submission already is.
 */

import { NextResponse } from 'next/server';
import { internalRecipient, sendCustomerEmail, sendEmail } from '@/lib/email';
import { customerRequestEmail, internalRequestFallbackEmail } from '@/lib/custom-request-email';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();

  if (!name) {
    return NextResponse.json({ error: 'A name is required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
  }

  const str = (key: string) => String(body[key] ?? '').trim();

  const data = {
      requestId: str('requestId') || '—',
      customerName: name,
      making: str('making') || 'Your custom piece',
      enteredVia: str('enteredVia'),
      referenceUrl: str('referenceUrl'),
      keepAsShown: str('keepAsShown'),
      size: str('size'),
      height: str('height'),
      silhouette: str('silhouette'),
      details: str('details'),
      yarns: str('yarns'),
      notes: str('notes'),
      startingPrice: str('startingPrice'),
      contactMethod: str('contactMethod'),
    contactHandle: str('contactHandle'),
    address: str('address'),
  };

  // The studio's normal notice comes from the Netlify Forms hook
  // (netlify/functions/submission-created.js), which has the uploaded images
  // and so makes the better order card. The browser tells us whether that
  // record actually filed; only when it did not do we send our own copy, so a
  // healthy submission never produces two emails.
  const recorded = body.netlifyRecorded !== false;

  const [sent, internalSent] = await Promise.all([
    sendCustomerEmail({ ...customerRequestEmail(data), to: email }),
    recorded
      ? Promise.resolve(true)
      : sendEmail({
          ...internalRequestFallbackEmail(data),
          to: internalRecipient(),
          replyTo: email,
        }),
  ]);

  if (!recorded && !internalSent) {
    // Both records failed. Log loudly — this is the only trace left that the
    // request existed at all.
    console.error(
      'CUSTOM REQUEST NOT RECORDED ANYWHERE — Netlify Forms failed and the fallback email did not send.',
      JSON.stringify({ requestId: data.requestId, name, email, making: data.making }),
    );
  }

  return NextResponse.json({ emailed: sent, internalNotified: recorded || internalSent });
}
