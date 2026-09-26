/**
 * Renders one email as a web page so it can be looked at without sending.
 * Development only.
 *
 *   /api/dev/email-preview?t=proposal
 *   /api/dev/email-preview?t=proposal&as=text   (the plain-text half)
 *
 * Images in these templates carry absolute production URLs, which is correct
 * for a real send but 404s until the site is deployed. For a local preview
 * those are rewritten to same-origin paths so the pictures actually appear;
 * pass &live=1 to see exactly what a recipient would get instead.
 */

import { NextResponse } from 'next/server';
import { BRAND } from '@/data/site';
import { EMAIL_SAMPLES } from '@/lib/email-samples';

export async function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const q = new URL(request.url).searchParams;
  const key = q.get('t') ?? '';
  const sample = EMAIL_SAMPLES.find((s) => s.key === key);
  if (!sample) {
    return NextResponse.json(
      { error: `Unknown template "${key}"`, available: EMAIL_SAMPLES.map((s) => s.key) },
      { status: 404 },
    );
  }

  const built = sample.build();

  if (q.get('as') === 'text') {
    return new NextResponse(`Subject: ${built.subject}\n\n${built.text}`, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const html =
    q.get('live') === '1' ? built.html : built.html.split(BRAND.siteUrl).join('');

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
