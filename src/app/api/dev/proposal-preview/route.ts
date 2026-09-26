/**
 * Emails a custom-order proposal to yourself so you can see it in a real
 * inbox. Development only — it 404s in production, for the same reason as the
 * payment preview: an endpoint that mails arbitrary addresses does not belong
 * on a live site.
 *
 *   curl -X POST ".../api/dev/proposal-preview?to=you@example.com"
 *   curl -X POST ".../api/dev/proposal-preview?to=you@example.com&design=proposal-plum"
 *
 * The designs themselves live in src/lib/email-samples.ts, so the gallery at
 * /dev/emails and this endpoint always show the same thing — there is no
 * second copy of the spec to keep in step. `to` is the only required param;
 * `design` picks which proposal, defaulting to the first one.
 */

import { NextResponse } from 'next/server';
import { BRAND } from '@/data/site';
import { sendEmail } from '@/lib/email';
import { EMAIL_SAMPLES } from '@/lib/email-samples';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const q = new URL(request.url).searchParams;
  const to = (q.get('to') ?? '').trim();
  if (!to.includes('@')) {
    return NextResponse.json({ error: 'Pass ?to=your@email.com' }, { status: 400 });
  }

  const proposals = EMAIL_SAMPLES.filter((s) => s.key.startsWith('proposal'));
  const key = q.get('design') ?? proposals[0]?.key;
  const sample = proposals.find((s) => s.key === key);
  if (!sample) {
    return NextResponse.json(
      { error: `Unknown design "${key}"`, available: proposals.map((s) => s.key) },
      { status: 404 },
    );
  }

  const email = sample.build();

  // Previews share a subject and body, which makes Gmail thread them and hide
  // the repeated parts — a fresh one then looks like it is missing sections.
  const stamp = new Date().toTimeString().slice(0, 8);
  const subject = `${email.subject} · preview ${stamp}`;
  const sent = await sendEmail({ ...email, subject, to, replyTo: BRAND.email });

  return NextResponse.json({ sent, to, design: sample.key, subject });
}
