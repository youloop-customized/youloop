/**
 * Sends the payment-details email to yourself so you can see how it looks.
 *
 * Development only — it 404s in production, because it takes a recipient from
 * the request and an endpoint that mails arbitrary addresses has no business
 * on a live site.
 *
 * Run the dev server, then:
 *   curl -X POST "http://localhost:3000/api/dev/payment-preview?to=you@example.com"
 *
 * Optional query params override the sample order: amount, order, item, name,
 * contact. Re-run it after filling in the real account details in
 * src/data/payment.ts to check nothing is left bracketed.
 */

import { NextResponse } from 'next/server';
import { BRAND } from '@/data/site';
import { PAYMENT_METHODS, isPlaceholder } from '@/data/payment';
import { sendEmail } from '@/lib/email';
import { paymentInstructionsEmail } from '@/lib/payment-email';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const url = new URL(request.url);
  const to = (url.searchParams.get('to') ?? '').trim();
  if (!to.includes('@')) {
    return NextResponse.json({ error: 'Pass ?to=your@email.com' }, { status: 400 });
  }

  const email = paymentInstructionsEmail({
    customerName: url.searchParams.get('name') ?? 'Yu',
    orderNumber: url.searchParams.get('order') ?? 'YL-482913',
    itemSummary: url.searchParams.get('item') ?? 'SR-02 The Soft Riot Crop Set · Size M',
    amount: url.searchParams.get('amount') ?? '฿1,990',
    contactMethod: url.searchParams.get('contact') ?? 'LINE',
  });

  // Previews all carry the same subject and a near-identical body, so Gmail
  // threads them and hides the repeated parts behind its "..." expander —
  // which makes a fresh preview look like it is missing the sections that did
  // not change. A per-send timestamp keeps each one its own message. The
  // customer-facing subject in payment-email.ts stays clean.
  const stamp = new Date().toTimeString().slice(0, 8);
  const subject = `${email.subject} · preview ${stamp}`;
  const sent = await sendEmail({ ...email, subject, to, replyTo: BRAND.email });

  // Counted so a preview of a half-filled config says so in the response
  // rather than only in the rendered email.
  const stillPlaceholder = PAYMENT_METHODS.flatMap((m) =>
    m.fields.filter((f) => isPlaceholder(f.value)).map((f) => `${m.name}: ${f.label}`),
  );

  return NextResponse.json({
    sent,
    to,
    // The stamped subject actually sent, not the clean template one.
    subject,
    placeholdersRemaining: stillPlaceholder.length,
    placeholders: stillPlaceholder,
  });
}
