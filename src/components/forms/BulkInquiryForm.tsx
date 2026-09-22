'use client';

import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { submitFormData } from '@/lib/netlify';
import f from './Form.module.css';

export default function BulkInquiryForm() {
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // The form is tall; the success message that replaces it is short. Without
  // this, the page keeps whatever scroll position the customer was at, which
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
        'Something went wrong sending your inquiry. Please try again, or reach us directly on LINE.',
      );
    }
  }

  if (submitted) {
    return (
      <div ref={successRef} className={f.success}>
        <p style={{ fontSize: '1.05rem', color: 'var(--cream)', marginBottom: '0.5rem' }}>
          ✦ Got it — thank you!
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--mgray)' }}>
          We&apos;ll get back to you within 24 hours with a quote and timeline.
        </p>
      </div>
    );
  }

  return (
    <form name="bulk-inquiry" onSubmit={handleSubmit}>
      <input type="hidden" readOnly name="form-name" value="bulk-inquiry" />
      <p style={{ display: 'none' }}>
        <label>
          Don&apos;t fill this out: <input name="bot-field" />
        </label>
      </p>

      <div className={f.field}>
        <label className={f.label} htmlFor="bi-name">
          Your Name *
        </label>
        <input className={f.input} type="text" id="bi-name" name="name" required />
      </div>

      <div className={f.field}>
        <label className={f.label} htmlFor="bi-contact">
          Email or WhatsApp *
        </label>
        <input
          className={f.input}
          type="text"
          id="bi-contact"
          name="contact"
          required
          placeholder="you@company.com or +66 xx xxx xxxx"
        />
      </div>

      <div className={f.field}>
        <label className={f.label} htmlFor="bi-company">
          Company / Brand Name
        </label>
        <input className={f.input} type="text" id="bi-company" name="company" />
      </div>

      <div className={f.field}>
        <label className={f.label} htmlFor="bi-product">
          What would you like to order? *
        </label>
        <input
          className={f.input}
          type="text"
          id="bi-product"
          name="product_interest"
          required
          placeholder="e.g. branded crochet tote bags"
        />
      </div>

      <div className={f.field}>
        <label className={f.label} htmlFor="bi-quantity">
          Estimated Quantity *
        </label>
        <input
          className={f.input}
          type="text"
          id="bi-quantity"
          name="quantity"
          required
          placeholder="e.g. 25 pieces"
        />
      </div>

      <div className={f.field}>
        <label className={f.label} htmlFor="bi-timeline">
          Target Timeline *
        </label>
        <input
          className={f.input}
          type="text"
          id="bi-timeline"
          name="timeline"
          required
          placeholder="e.g. needed by mid-October"
        />
      </div>

      <div className={f.field} style={{ marginBottom: '0.5rem' }}>
        <label className={f.label} htmlFor="bi-notes">
          Anything else we should know?
        </label>
        <textarea
          className={`${f.input} ${f.textarea}`}
          id="bi-notes"
          name="notes"
          rows={4}
        />
      </div>

      <button type="submit" className={f.submit} disabled={sending}>
        {sending ? 'Sending…' : 'Send inquiry'}
      </button>
    </form>
  );
}
