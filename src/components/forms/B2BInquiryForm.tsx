'use client';

import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { submitFormData } from '@/lib/netlify';
import s from '@/app/b2b/b2b.module.css';

/**
 * YOU LOOP Creation's project inquiry.
 *
 * This replaced a sixteen-field questionnaire (contacting_as, project_for,
 * delivery_location, next_step and so on) with the shorter /bulk-inquiry field
 * set. A corporate enquiry only has to tell us who they are, what they want
 * made, how many and by when — everything else is a conversation, not a form,
 * and asking for it up front was the surest way to lose the lead.
 *
 * Company comes before the contact's name because that is what identifies a
 * B2B enquiry, and email is the only channel asked for: this arm follows up by
 * email, so offering WhatsApp here promised a channel nobody was watching.
 *
 * It keeps the b2b stylesheet rather than Form.module.css — this page is white
 * and blush where the rest of the site is near-black, so the shared form
 * styles would render unreadable here.
 */
export default function B2BInquiryForm() {
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // The form is tall; the success message that replaces it is short. Without
  // this, the page keeps whatever scroll position the visitor was at, which
  // after a long form lands them well past the now-shorter card.
  useEffect(() => {
    if (submitted) successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [submitted]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSending(true);
    try {
      await submitFormData(data);
      setSubmitted(true);
    } catch {
      setSending(false);
      alert(
        'Something went wrong sending your inquiry. Please try again, or reach us directly at hello.youloop@gmail.com.',
      );
    }
  }

  if (submitted) {
    return (
      <div ref={successRef} className={s.success}>
        <p className={s.successTitle}>Thank you — got it.</p>
        <p className={s.successBody}>
          We&apos;ll review your project and follow up by email within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form name="b2b-inquiry" onSubmit={handleSubmit} encType="multipart/form-data">
      <input type="hidden" readOnly name="form-name" value="b2b-inquiry" />
      <p style={{ display: 'none' }}>
        <label>
          Don&apos;t fill this out: <input name="bot-field" />
        </label>
      </p>

      <div className={s.field}>
        <label className={s.label} htmlFor="bi-company">
          Company / brand name *
        </label>
        <input
          className={s.input}
          type="text"
          id="bi-company"
          name="company"
          required
          placeholder="Your company or brand"
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="bi-email">
          Email *
        </label>
        <input
          className={s.input}
          type="email"
          id="bi-email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
        <div className={s.help}>We reply to every project inquiry by email.</div>
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="bi-name">
          Your name *
        </label>
        <input
          className={s.input}
          type="text"
          id="bi-name"
          name="name"
          required
          autoComplete="name"
          placeholder="Who we should address this to"
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="bi-product">
          What would you like to produce? *
        </label>
        <input
          className={s.input}
          type="text"
          id="bi-product"
          name="product_interest"
          required
          placeholder="e.g. branded crochet tote bags"
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="bi-quantity">
          Estimated quantity *
        </label>
        <input
          className={s.input}
          type="text"
          id="bi-quantity"
          name="quantity"
          required
          placeholder="e.g. 25 pieces"
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="bi-timeline">
          Target timeline *
        </label>
        <input
          className={s.input}
          type="text"
          id="bi-timeline"
          name="timeline"
          required
          placeholder="e.g. needed by mid-October"
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="bi-brief">
          Project brief or anything else we should know?
        </label>
        <textarea
          className={`${s.input} ${s.textarea}`}
          id="bi-brief"
          name="brief"
          rows={4}
          placeholder="Colors, logo placement, the occasion, budget range — whatever you already know."
        />
      </div>

      {/* Directly under the brief on purpose: a reference image is the same
          thought as the brief, just shown instead of written, and people who
          have one reach for it while describing the project. Optional and
          single-file — Netlify Forms maps one file per input, and anyone with
          a whole deck can reply to our email with it. */}
      <div className={s.field} style={{ marginBottom: '0.5rem' }}>
        <label className={s.label} htmlFor="bi-inspo">
          Inspiration or reference <span style={{ fontWeight: 400 }}>(optional)</span>
        </label>
        <input
          className={s.input}
          type="file"
          id="bi-inspo"
          name="inspo"
          accept="image/*,.pdf"
        />
        <div className={s.help}>
          One image or PDF — a moodboard, a logo, a product you like. Got more? Send them with your
          reply to our email.
        </div>
      </div>

      <button type="submit" className={s.submit} disabled={sending}>
        {sending ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  );
}
