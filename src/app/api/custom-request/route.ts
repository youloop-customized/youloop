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
import { sendCustomerEmail } from '@/lib/email';
import { customerRequestEmail } from '@/lib/custom-request-email';

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

  const sent = await sendCustomerEmail({
    ...customerRequestEmail({
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
    }),
    to: email,
  });

  return NextResponse.json({ emailed: sent });
}
