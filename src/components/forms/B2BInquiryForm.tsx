'use client';

import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { submitFormData } from '@/lib/netlify';
import s from '@/app/b2b/b2b.module.css';

const CONTACTING_AS = [
  'Direct brand or company',
  'Corporate-gifting company',
  'Marketing or branding agency',
  'Event organizer',
  'NGO or community',
  'Retail or distribution partner',
  'Individual',
  'Other',
];

const QUANTITIES = [
  'Prototype only',
  '3–10 pieces',
  '11–30 pieces',
  '31–100 pieces',
  '101–300 pieces',
  'More than 300 pieces',
  'Quantity not confirmed',
];

const NEXT_STEPS = [
  '15-minute introductory call',
  'Indicative quotation',
  'Paid prototype or sample',
  'Product recommendations',
  'Production-feasibility discussion',
];

/** Radio group — the b2b form uses three of these with identical markup. */
function RadioGroup({ name, options }: { name: string; options: string[] }) {
  return (
    <div className={s.radioGroup}>
      {options.map((option, i) => (
        <label key={option} className={s.radio}>
          <input type="radio" name={name} value={option} required={i === 0} /> {option}
        </label>
      ))}
    </div>
  );
}

export default function B2BInquiryForm() {
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
        <label className={s.label} htmlFor="b2b-name">
          Your name *
        </label>
        <input className={s.input} type="text" id="b2b-name" name="name" required />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-email">
          Work email *
        </label>
        <input className={s.input} type="email" id="b2b-email" name="email" required />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-phone">
          Phone / WhatsApp *
        </label>
        <input className={s.input} type="tel" id="b2b-phone" name="phone" required />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-company">
          Company or organization *
        </label>
        <input className={s.input} type="text" id="b2b-company" name="company" required />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-website">
          Website or social profile *
        </label>
        <input className={s.input} type="text" id="b2b-website" name="website" required />
      </div>

      <div className={s.field}>
        <label className={s.label}>You are contacting us as *</label>
        <RadioGroup name="contacting_as" options={CONTACTING_AS} />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-develop">
          What would you like to develop? *
        </label>
        <input
          className={s.input}
          type="text"
          id="b2b-develop"
          name="develop"
          required
          placeholder="e.g. branded laptop sleeves, event merch, a new product"
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-project-for">
          What is this project for? *
        </label>
        <textarea
          className={`${s.input} ${s.textarea}`}
          id="b2b-project-for"
          name="project_for"
          rows={3}
          required
        />
      </div>

      <div className={s.field}>
        <label className={s.label}>Estimated quantity *</label>
        <RadioGroup name="quantity" options={QUANTITIES} />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-date">
          Target delivery date *
        </label>
        <input className={s.input} type="date" id="b2b-date" name="delivery_date" required />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-location">
          Where should the order be delivered? *
        </label>
        <input
          className={s.input}
          type="text"
          id="b2b-location"
          name="delivery_location"
          required
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-customize">
          What would you like to customize? *
        </label>
        <textarea
          className={`${s.input} ${s.textarea}`}
          id="b2b-customize"
          name="customize"
          rows={3}
          required
          placeholder="Logos, brand colours, names, motifs…"
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-brief">
          Tell us about the brief *
        </label>
        <textarea
          className={`${s.input} ${s.textarea}`}
          id="b2b-brief"
          name="brief"
          rows={4}
          required
        />
      </div>

      <div className={s.field}>
        <label className={s.label} htmlFor="b2b-references">
          Upload your references
        </label>
        <input
          className={s.input}
          type="file"
          id="b2b-references"
          name="references"
          accept="image/*,.pdf"
        />
        <div className={s.help}>Max 10MB</div>
      </div>

      <div className={s.field}>
        <label className={s.label}>What would you like from YOU LOOP next? *</label>
        <RadioGroup name="next_step" options={NEXT_STEPS} />
      </div>

      <div className={s.field} style={{ marginBottom: '0.5rem' }}>
        <label className={s.label} htmlFor="b2b-notes">
          Anything else we should know?
        </label>
        <textarea className={`${s.input} ${s.textarea}`} id="b2b-notes" name="notes" rows={3} />
      </div>

      <button type="submit" className={s.submit} disabled={sending}>
        {sending ? 'Sending…' : 'Submit inquiry'}
      </button>
    </form>
  );
}
