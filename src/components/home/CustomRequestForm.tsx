'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { generateRequestId, todayISODate } from '@/lib/format';
import { submitFormData } from '@/lib/netlify';
import f from '@/components/forms/Form.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const OUTFIT_TYPES = [
  { value: 'dress', label: 'Dress' },
  { value: 'bodycon', label: 'Bodycon Dress' },
  { value: 'top', label: 'Top / Crop Top' },
  { value: 'skirt', label: 'Skirt' },
  { value: 'pants', label: 'Pants / Shorts' },
  { value: 'set', label: 'Set' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function CustomRequestForm() {
  const [requestId, setRequestId] = useState('');
  const [minDate, setMinDate] = useState('');
  const [outfitType, setOutfitType] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [noInspo, setNoInspo] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [dateError, setDateError] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Generated after mount: a value derived from Date.now()/Math.random() during
  // render would not match between the server and client HTML.
  useEffect(() => {
    setRequestId(generateRequestId());
    setMinDate(todayISODate());
  }, []);

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  // Object URLs are leaked unless they are revoked when the list changes.
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  function validateEmail(value: string): boolean {
    const raw = value.trim();
    if (!raw || !EMAIL_RE.test(raw)) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  }

  function validateDate(value: string): boolean {
    if (!value) return true;
    const picked = new Date(`${value}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (picked < today) {
      setDateError("That date's already passed — pick a day from today onward");
      return false;
    }
    setDateError('');
    return true;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (!outfitType) {
      alert("What do you want us to make? Pick one — that's how we know what to create ✨");
      return;
    }
    if (!size) {
      alert('Pick your size 📏');
      return;
    }

    const emailOk = validateEmail(String(data.get('email') ?? ''));
    const dateOk = validateDate(String(data.get('required_by') ?? ''));
    if (!emailOk || !dateOk) {
      form.querySelector<HTMLElement>(`.${f.invalid}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    // The <input type="file"> is uncontrolled and may have been cleared by the
    // "no inspo" checkbox, so the tracked list is the source of truth.
    data.delete('inspiration');
    if (!noInspo) files.forEach((file) => data.append('inspiration', file));

    data.set('submitted_at', new Date().toISOString());

    setSending(true);
    try {
      await submitFormData(data);
      setSubmitted(true);
    } catch {
      setSending(false);
      alert(
        'Something went wrong sending your idea. Please try again, or reach us directly on LINE.',
      );
    }
  }

  if (submitted) {
    return (
      <div className={f.success}>
        <p style={{ fontSize: '1.05rem', color: 'var(--cream)', marginBottom: '0.6rem' }}>
          Got it! Your idea is with YOU LOOP. ✨
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--mgray)', lineHeight: 1.7 }}>
          We&apos;ll review your design and fit, then reach out by email if we need to confirm
          anything.
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--mgray)', marginTop: '0.6rem' }}>
          See you in your moment. 🌸🗡️
        </p>
        <p
          style={{
            fontSize: '0.78rem',
            color: 'var(--rose)',
            marginTop: '1rem',
            letterSpacing: '0.05em',
          }}
        >
          Your request: {requestId}
        </p>
      </div>
    );
  }

  return (
    <form name="custom-request" onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
      <input type="hidden" readOnly name="form-name" value="custom-request" />
      <p style={{ display: 'none' }}>
        <label>
          Don&apos;t fill this out: <input name="bot-field" />
        </label>
      </p>
      <input type="hidden" readOnly name="request_id" value={requestId} />
      <input type="hidden" readOnly name="request_status" value="Needs Review" />
      <input type="hidden" readOnly name="fit_status" value="Fit Check Required" />
      <input type="hidden" readOnly name="submitted_at" value="" />
      <input type="hidden" readOnly name="sizing_method" value="Standard Size" />
      <input
        type="hidden"
        readOnly
        name="outfit_type"
        value={OUTFIT_TYPES.find((o) => o.value === outfitType)?.label ?? ''}
      />
      <input type="hidden" readOnly name="standard_size" value={size ?? ''} />

      {/* NAME */}
      <div className={f.field}>
        <label className={f.label} htmlFor="cr-name">
          Your name *
        </label>
        <input className={f.input} type="text" id="cr-name" name="name" required />
      </div>

      {/* OUTFIT TYPE */}
      <div className={f.field}>
        <label className={f.label}>What do you want us to make? *</label>
        <div className={f.chips}>
          {OUTFIT_TYPES.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`${f.chip} ${outfitType === option.value ? f.active : ''}`}
              onClick={() => setOutfitType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* INSPIRATION */}
      <div className={f.field}>
        <label className={f.label} htmlFor="cr-inspo">
          Show us your inspo 📌
        </label>
        <div className={noInspo ? f.hidden : undefined}>
          <input
            className={f.input}
            type="file"
            id="cr-inspo"
            name="inspiration"
            accept="image/*"
            multiple
            onChange={(e) => {
              setFiles((current) => [...current, ...Array.from(e.target.files ?? [])]);
              e.target.value = '';
            }}
          />
          <div className={f.help}>
            Upload as many reference photos as you like (max 10MB each)
          </div>
          <div className={f.filePreview}>
            {previews.map((preview, i) => (
              <div key={preview.url} className={f.thumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview.url} alt={`Inspiration photo ${i + 1}`} />
                <button
                  type="button"
                  className={f.thumbRemove}
                  aria-label="Remove photo"
                  onClick={() => setFiles((current) => current.filter((_, j) => j !== i))}
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>
        </div>
        <label className={f.checkline} style={{ marginTop: '0.6rem' }}>
          <input
            type="checkbox"
            checked={noInspo}
            onChange={(e) => {
              setNoInspo(e.target.checked);
              if (e.target.checked) setFiles([]);
            }}
          />{' '}
          I don&apos;t have inspo photos
        </label>
      </div>

      {/* CUSTOMIZATION */}
      <div className={f.field}>
        <label className={f.label} htmlFor="cr-notes">
          Tell us more about how you&apos;d like it made 🎨 *
        </label>
        <div className={f.help} style={{ marginBottom: '0.5rem' }}>
          Tell us what you want to keep, change or add. You don&apos;t need fashion words — just
          tell us how you want it.
        </div>
        <textarea
          className={`${f.input} ${f.textarea}`}
          id="cr-notes"
          name="customization_notes"
          rows={4}
          required
        />
        <div className={f.example}>
          &quot;I want it about 90% like my inspo. Make the V-neck wider but not too deep. Keep the
          sleeves, but make them slightly flared. Make the dress shorter, above my knees. Replace
          the front knot with a small bow. Keep the same colors.&quot;
        </div>
        <div className={f.help} style={{ marginTop: '0.4rem' }}>
          You can change as much or as little as you want. ✨
        </div>
      </div>

      {/* SIZE */}
      <div className={f.field}>
        <label className={f.label}>Size *</label>
        <div className={f.chips}>
          {SIZES.map((option) => (
            <button
              key={option}
              type="button"
              className={`${f.chip} ${size === option ? f.active : ''}`}
              onClick={() => setSize(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div className={f.help} style={{ marginTop: '0.5rem' }}>
          We&apos;ll review the design and let you know if we need any extra measurements.
        </div>
      </div>

      {/* REQUIRED BY */}
      <div className={f.field}>
        <label className={f.label} htmlFor="cr-date">
          When would you like your outfit ready? 🗓️ *
        </label>
        <input
          className={`${f.input} ${dateError ? f.invalid : ''}`}
          type="date"
          id="cr-date"
          name="required_by"
          min={minDate}
          required
          onChange={(e) => validateDate(e.target.value)}
        />
        {dateError && <div className={f.error}>{dateError}</div>}
        <div className={f.help}>We&apos;ll confirm what&apos;s possible after reviewing your request.</div>
      </div>

      {/* CONTACT */}
      <div className={f.field} style={{ marginBottom: '0.5rem' }}>
        <label className={f.label} htmlFor="cr-email">
          Your email *
        </label>
        <input
          className={`${f.input} ${emailError ? f.invalid : ''}`}
          type="email"
          id="cr-email"
          name="email"
          required
          onBlur={(e) => validateEmail(e.target.value)}
        />
        {emailError && <div className={f.error}>{emailError}</div>}
      </div>

      <button type="submit" className={f.submit} disabled={sending}>
        {sending ? 'Sending…' : 'Submit My Request ✨'}
      </button>

    </form>
  );
}
