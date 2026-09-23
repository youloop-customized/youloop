'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BASE_STYLES,
  CONTACT_METHODS,
  CUSTOM_STARTING_PRICE,
  DETAILS,
  ENTRY_PATHS,
  LENGTHS,
  LOVED_ELEMENTS,
  MAX_YARNS,
  NECKLINES,
  PATH_STEPS,
  REFERENCE_TARGETS,
  SILHOUETTES,
  SIZES,
  SLEEVES,
  STEP_COPY,
  tweaksFor,
  type EntryPath,
} from '@/data/customRequest';
import { STANDARD_MEASUREMENTS } from '@/data/products';
import { YARNS } from '@/data/yarns';
import { baht, generateRequestId } from '@/lib/format';
import { submitFormData } from '@/lib/netlify';
import f from '@/components/forms/Form.module.css';
import w from './CustomRequest.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Mostly digits, with room for +, spaces, dashes and parentheses. */
const WHATSAPP_RE = /^[+\d][\d\s()-]{6,}$/;
/** Instagram's own rules: letters, numbers, periods, underscores; @ optional. */
const INSTAGRAM_RE = /^@?[a-zA-Z0-9._]{1,30}$/;

const MIN_HEIGHT_CM = 120;
const MAX_HEIGHT_CM = 220;
const MIN_MEASURE_CM = 40;
const MAX_MEASURE_CM = 200;
/** Matches the "max 10MB each" already promised in the upload help text. */
const MAX_FILE_BYTES = 10 * 1024 * 1024;
/** A sane ceiling so nobody accidentally attaches fifty photos to an email. */
const MAX_FILES = 10;

/**
 * The mark on each entry card. Line icons rather than emoji: emoji are
 * rendered by the OS, so they arrive full-colour and differently shaped on
 * every device — three sizes of cartoon next to serif type. These inherit
 * the rose the rest of the wizard uses and stay on-brand everywhere.
 */
function PathIcon({ path }: { path: EntryPath }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  // A framed photo with a sparkle — "the picture you already have".
  if (path === 'reference') {
    return (
      <svg {...common}>
        <rect x="2.2" y="5.2" width="14.6" height="14.6" rx="2.6" />
        <circle cx="7.1" cy="10.1" r="1.5" />
        <path d="M2.2 16.4l4-3.4 3.6 3 2.9-2.3 4.1 3.3" />
        <path d="M19.4 2.6l.85 2.15 2.15.85-2.15.85-.85 2.15-.85-2.15L16.4 5.6l2.15-.85z" />
      </svg>
    );
  }

  // A dress silhouette — "the shape we start from".
  return (
    <svg {...common}>
      <path d="M9 3h6l-.6 2.4a1 1 0 00.2.9l2.5 3a1 1 0 01.2.9l-.7 3a1 1 0 01-1 .8h-.8l.5 6.2a.8.8 0 01-.8.8H9.5a.8.8 0 01-.8-.8l.5-6.2h-.8a1 1 0 01-1-.8l-.7-3a1 1 0 01.2-.9l2.5-3a1 1 0 00.2-.9z" />
      <path d="M9 3c.9.9 2.1 1.4 3 1.4S14.1 3.9 15 3" />
    </svg>
  );
}

/** Rejects "asdf" and typos, accepts anything genuinely link-shaped. */
function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isInRange(value: string, min: number, max: number): boolean {
  if (!value.trim()) return false;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max;
}

/**
 * Each chat platform has its own real shape — a WhatsApp number is mostly
 * digits, an Instagram handle is a fixed character set. LINE stays loose
 * (an @id or a phone number, both legitimate) rather than guessing wrong and
 * rejecting something real.
 */
function isValidHandle(method: string | undefined, value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (method === 'whatsapp') return WHATSAPP_RE.test(v);
  if (method === 'instagram') return INSTAGRAM_RE.test(v);
  return v.length >= 3;
}

function imageFileError(file: File): string | null {
  if (!file.type.startsWith('image/')) return `${file.name} isn't an image — only photos are accepted.`;
  if (file.size > MAX_FILE_BYTES) return `${file.name} is over 10MB — try a smaller photo.`;
  return null;
}

type Measurements = { bust: string; waist: string; hips: string };

/** Same shape as the collection checkout's shipping form, so both flows
 * record an order the same way. */
type Shipping = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  country: string;
};

const EMPTY_SHIPPING: Shipping = { line1: '', line2: '', city: '', postcode: '', country: 'Thailand' };
const REQUIRED_SHIPPING: (keyof Shipping)[] = ['line1', 'city', 'postcode', 'country'];

/** Flattens the address into the one line the record and the email show. */
function formatAddress(shipping: Shipping): string {
  return [shipping.line1, shipping.line2, shipping.city, shipping.postcode, shipping.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * A pending upload and its preview URL, created together.
 *
 * The URL is deliberately not derived with useMemo: StrictMode double-invokes
 * effects in development, so a revoke-on-cleanup effect would tear down URLs
 * that the memo then never recreates, and every thumbnail would break. Creating
 * on add and revoking on remove keeps each URL's life tied to its file.
 */
type Upload = { file: File; url: string };

/**
 * The custom request wizard.
 *
 * It opens on a path chooser rather than a first question, because the two
 * kinds of customer want opposite things: one arrives with a screenshot and
 * wants it made, the other has a shape in mind and wants to be walked through
 * it. Asking either to answer the other's questions is what loses the form.
 *
 * The chooser is deliberately unnumbered — the two paths are different lengths,
 * so the counter only starts once there is a known total to count towards.
 */
export default function CustomRequestForm() {
  const [entryPath, setEntryPath] = useState<EntryPath | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [requestId, setRequestId] = useState('');

  // Reference path
  const [referenceUrl, setReferenceUrl] = useState('');
  const [referenceTarget, setReferenceTarget] = useState<string | null>(null);
  const [lovedElements, setLovedElements] = useState<string[]>([]);
  const [tweakNote, setTweakNote] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const dropInputRef = useRef<HTMLInputElement>(null);

  // Shape path
  const [baseStyle, setBaseStyle] = useState<string | null>(null);
  const [neckline, setNeckline] = useState<string | null>(null);
  const [sleeves, setSleeves] = useState<string | null>(null);
  const [silhouette, setSilhouette] = useState<string | null>(null);
  const [details, setDetails] = useState<string[]>([]);
  const [yarnIds, setYarnIds] = useState<string[]>([]);
  const [length, setLength] = useState<string | null>(null);
  const [useMeasurements, setUseMeasurements] = useState(false);
  const [cm, setCm] = useState<Measurements>({ bust: '', waist: '', hips: '' });

  // Shared
  const [size, setSize] = useState<string | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // No default: a silently pre-picked channel is exactly how this ends up
  // unset in practice. The customer has to actually choose one.
  const [contactMethod, setContactMethod] = useState<string | null>(null);
  const [contactHandle, setContactHandle] = useState('');
  const [shipping, setShipping] = useState<Shipping>(EMPTY_SHIPPING);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [urlError, setUrlError] = useState('');
  const [heightError, setHeightError] = useState('');
  const [measureError, setMeasureError] = useState('');
  const [handleError, setHandleError] = useState('');
  const [fileError, setFileError] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Generated after mount: a value derived from Date.now()/Math.random() during
  // render would not match between the server and client HTML.
  useEffect(() => setRequestId(generateRequestId()), []);

  // Revoke any still-open preview URLs when the form goes away. The ref keeps
  // this effect off the uploads dependency, so it only ever runs on unmount.
  const uploadsRef = useRef<Upload[]>([]);
  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);
  useEffect(() => () => uploadsRef.current.forEach((u) => URL.revokeObjectURL(u.url)), []);

  // The wizard is tall by the last step, and the success screen that replaces
  // it is short — without this, the page keeps whatever scroll position the
  // customer was at, which after a long form is usually past the now-shorter
  // card, down among the footer. Bring the confirmation to them instead.
  useEffect(() => {
    if (submitted) successRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [submitted]);

  const labelOf = (list: { value: string; label: string }[], value: string | null) =>
    list.find((o) => o.value === value)?.label ?? '';
  const labelsOf = (list: { value: string; label: string }[], values: string[]) =>
    values.map((v) => labelOf(list, v)).join(', ');

  const steps = entryPath ? PATH_STEPS[entryPath] : [];
  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const shows = tweaksFor(baseStyle);
  const chosenYarns = yarnIds
    .map((id) => YARNS.find((y) => y.id === id))
    .filter((y): y is (typeof YARNS)[number] => Boolean(y));
  // No fallback: null here means "not chosen yet," and that has to stay
  // visible rather than quietly resolving to some default channel.
  const contact = CONTACT_METHODS.find((m) => m.value === contactMethod) ?? null;

  // The `accept="image/*"` attribute only filters the file picker dialog —
  // drag-and-drop bypasses it entirely, so a non-image or oversized file can
  // still reach here and has to be caught explicitly.
  function addFiles(list: FileList | null) {
    const incoming = Array.from(list ?? []);
    if (!incoming.length) return;

    const errors: string[] = [];
    const accepted = incoming.filter((file) => {
      const reason = imageFileError(file);
      if (reason) errors.push(reason);
      return !reason;
    });

    const room = Math.max(0, MAX_FILES - uploads.length);
    if (accepted.length > room) {
      errors.push(`Only ${MAX_FILES} photos at a time — the rest were skipped.`);
    }
    const toAdd = accepted.slice(0, room);

    setFileError(errors.join(' '));
    if (toAdd.length) {
      setUploads((current) => [
        ...current,
        ...toAdd.map((file) => ({ file, url: URL.createObjectURL(file) })),
      ]);
    }
  }

  function removeUpload(index: number) {
    setUploads((current) => {
      const target = current[index];
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((_, i) => i !== index);
    });
  }

  function toggle(setter: (fn: (c: string[]) => string[]) => void, value: string) {
    setter((c) => (c.includes(value) ? c.filter((v) => v !== value) : [...c, value]));
  }

  function toggleYarn(id: string) {
    setYarnIds((c) => {
      if (c.includes(id)) return c.filter((v) => v !== id);
      if (c.length >= MAX_YARNS) return c;
      return [...c, id];
    });
  }

  /** Each step gates the next, so nothing is validated twice at the end. */
  function canAdvance(): boolean {
    switch (current) {
      case 'reference':
        // A photo alone is enough — the link only needs to be well-formed
        // when it's the sole reference, not when a photo already covers it.
        return uploads.length > 0 || (referenceUrl.trim().length > 0 && isValidUrl(referenceUrl));
      case 'refine':
        return Boolean(referenceTarget);
      case 'shape':
        return Boolean(baseStyle);
      // Both size steps share one table (see renderSizeSection) and so share
      // one rule: either a standard size, or the table's own Custom row with
      // valid measurements under it — plus a height in range either way.
      case 'fit':
      case 'simpleFit':
        return (
          (Boolean(size) ||
            (useMeasurements &&
              isInRange(cm.bust, MIN_MEASURE_CM, MAX_MEASURE_CM) &&
              isInRange(cm.waist, MIN_MEASURE_CM, MAX_MEASURE_CM) &&
              isInRange(cm.hips, MIN_MEASURE_CM, MAX_MEASURE_CM))) &&
          isInRange(heightCm, MIN_HEIGHT_CM, MAX_HEIGHT_CM)
        );
      case 'tweaks':
        // Neckline, sleeves and silhouette are required, but "Not Sure" is
        // always a valid answer for each — so this never blocks someone who
        // genuinely doesn't know, only someone who hasn't answered at all.
        // Yarn follows the same shape via its own not-sure toggle. Either
        // way we end up with real data instead of silence. The description
        // needs a little more than one character too — "ok" technically
        // isn't blank, but it isn't a description either.
        return (
          (!shows.neckline || Boolean(neckline)) &&
          (!shows.sleeves || Boolean(sleeves)) &&
          Boolean(silhouette) &&
          yarnIds.length > 0 &&
          tweakNote.trim().length >= 10
        );
      default:
        return true;
    }
  }

  function next() {
    if (canAdvance()) setStepIndex((s) => Math.min(s + 1, steps.length - 1));
  }

  /** Back off the first step returns to the chooser rather than dead-ending. */
  function back() {
    if (stepIndex === 0) setEntryPath(null);
    else setStepIndex((s) => s - 1);
  }

  function choosePath(path: EntryPath) {
    setEntryPath(path);
    setStepIndex(0);
  }

  const fitSummary = useMeasurements
    ? `${cm.bust} / ${cm.waist} / ${cm.hips} cm`
    : (size ?? '');
  const yarnSummary = chosenYarns.map((y) => `#${y.id} ${y.name}`).join(', ');

  // Every other step disables Continue until it's satisfied; Submit was the
  // one place that instead let the click through and interrupted it with an
  // alert. This makes the last step behave like every step before it.
  // Every remaining chat channel needs a real, correctly-shaped handle to be
  // worth anything — a chosen channel we can't actually reach is the same as
  // no channel at all.
  const canSubmit =
    name.trim().length >= 2 &&
    EMAIL_RE.test(email.trim()) &&
    Boolean(contact) &&
    isValidHandle(contact?.value, contactHandle) &&
    REQUIRED_SHIPPING.every((key) => shipping[key].trim());

  /**
   * The size chart, shared by both paths (see 'simpleFit' and 'fit' below).
   * Reads the exact same STANDARD_MEASUREMENTS chart the collection
   * configurator uses, so a size means the same thing everywhere on the
   * site — and its "Custom" row is what makes the exact-measurement panel
   * beneath it a real feature on the reference path too, not just the
   * guided one.
   */
  function renderSizeSection() {
    return (
      <>
        <div className={f.field}>
          <label className={f.label}>Your size *</label>
          <div className={w.sizeTableWrap}>
            <table className={w.sizeTable}>
              <thead>
                <tr>
                  <th scope="col">Size</th>
                  <th scope="col">Bust</th>
                  <th scope="col">Waist</th>
                  <th scope="col">Hips</th>
                  <th scope="col">Height</th>
                </tr>
              </thead>
              <tbody>
                {SIZES.map((label) => {
                  const row = STANDARD_MEASUREMENTS[label];
                  const checked = !useMeasurements && size === label;
                  const pick = () => {
                    setSize(label);
                    setUseMeasurements(false);
                  };
                  return (
                    <tr key={label} className={checked ? w.sizeRowActive : ''} onClick={pick}>
                      <th scope="row" className={w.sizeCell}>
                        <input
                          type="radio"
                          name="cr-size"
                          className={w.sizeRadio}
                          value={label}
                          checked={checked}
                          onChange={pick}
                        />
                        <span>{label}</span>
                      </th>
                      <td>{row.bust}</td>
                      <td>{row.waist}</td>
                      <td>{row.hips}</td>
                      <td>{row.height}</td>
                    </tr>
                  );
                })}
                <tr
                  className={useMeasurements ? w.sizeRowActive : ''}
                  onClick={() => {
                    setUseMeasurements(true);
                    setSize(null);
                  }}
                >
                  <th scope="row" className={w.sizeCell}>
                    <input
                      type="radio"
                      name="cr-size"
                      className={w.sizeRadio}
                      value="custom"
                      checked={useMeasurements}
                      onChange={() => {
                        setUseMeasurements(true);
                        setSize(null);
                      }}
                    />
                    <span>Custom</span>
                  </th>
                  <td className={w.sizeCustomCell} colSpan={4}>
                    Your own measurements
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={f.help}>All measurements in cm.</div>
        </div>

        {useMeasurements && (
          <div className={f.field} style={{ marginTop: '0.6rem' }}>
            <label className={f.label}>Bust / waist / hips, in cm *</label>
            <div className={w.measureRow}>
              {(['bust', 'waist', 'hips'] as const).map((key) => (
                <div key={key} className={f.field} style={{ marginBottom: '0.6rem' }}>
                  <input
                    className={`${f.input} ${measureError ? f.invalid : ''}`}
                    type="number"
                    inputMode="numeric"
                    min={MIN_MEASURE_CM}
                    max={MAX_MEASURE_CM}
                    placeholder={key[0].toUpperCase() + key.slice(1)}
                    value={cm[key]}
                    onChange={(e) => setCm({ ...cm, [key]: e.target.value })}
                    onBlur={() => {
                      const bad = (['bust', 'waist', 'hips'] as const).filter(
                        (k) => cm[k] && !isInRange(cm[k], MIN_MEASURE_CM, MAX_MEASURE_CM),
                      );
                      setMeasureError(
                        bad.length
                          ? `Enter a realistic number in cm (${MIN_MEASURE_CM}–${MAX_MEASURE_CM})`
                          : '',
                      );
                    }}
                    aria-label={`${key} in cm`}
                  />
                </div>
              ))}
            </div>
            {measureError && <div className={f.error}>{measureError}</div>}
          </div>
        )}

        <div className={f.field} style={{ marginTop: '1rem' }}>
          <label className={f.label} htmlFor="cr-height">
            Your height *
          </label>
          <div className={w.heightRow}>
            <input
              className={`${f.input} ${heightError ? f.invalid : ''}`}
              type="number"
              id="cr-height"
              inputMode="numeric"
              min={MIN_HEIGHT_CM}
              max={MAX_HEIGHT_CM}
              placeholder="160"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              onBlur={() =>
                setHeightError(
                  isInRange(heightCm, MIN_HEIGHT_CM, MAX_HEIGHT_CM)
                    ? ''
                    : `Enter a height between ${MIN_HEIGHT_CM} and ${MAX_HEIGHT_CM} cm`,
                )
              }
            />
            <span className={w.heightUnit}>cm</span>
          </div>
          {heightError && <div className={f.error}>{heightError}</div>}
          <div className={f.help}>This is what gets dress and trouser lengths right.</div>
        </div>
      </>
    );
  }

  async function handleSubmit() {
    if (name.trim().length < 2) {
      alert('We need a name to put on your request ✨');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Enter a valid email address — we send your order confirmation there');
      return;
    }
    setEmailError('');
    if (!contact || !isValidHandle(contact.value, contactHandle)) {
      alert('Pick a chat channel and add a valid handle — that is how we talk through the design.');
      return;
    }
    if (REQUIRED_SHIPPING.some((key) => !shipping[key].trim())) {
      alert('Please complete your shipping address before submitting.');
      return;
    }

    const addressLabel = formatAddress(shipping);
    const data = new FormData();
    data.set('form-name', 'custom-request');
    // Netlify's honeypot: declared on the form in public/__forms.html, and only
    // ever spam if it arrives with a value.
    data.set('bot-field', '');
    data.set('request_id', requestId);
    data.set('request_status', 'Needs Review');
    // Every custom piece gets its measurements confirmed on chat before we
    // cast on, whether the size came from the table or the Custom row.
    data.set('fit_status', 'Fit Check Required');
    data.set('submitted_at', new Date().toISOString());

    data.set('name', name.trim());
    data.set('email', email.trim());
    data.set('entry_path', entryPath === 'reference' ? 'Started with inspo' : 'Guided build');

    // Reference path
    data.set('reference_url', referenceUrl.trim());
    data.set('reference_target', labelOf(REFERENCE_TARGETS, referenceTarget));
    data.set('loved_elements', labelsOf(LOVED_ELEMENTS, lovedElements));

    // Shape path
    data.set('base_style', baseStyle ?? '');
    data.set('length', shows.length ? labelOf(LENGTHS, length) : '');
    data.set('neckline', shows.neckline ? labelOf(NECKLINES, neckline) : '');
    data.set('sleeves', shows.sleeves ? labelOf(SLEEVES, sleeves) : '');
    data.set('silhouette', labelOf(SILHOUETTES, silhouette));
    data.set('details', labelsOf(DETAILS, details));
    data.set('yarn_colours', yarnSummary);

    // Whichever the path, this is the line that says what is being made.
    data.set(
      'outfit_type',
      labelOf(BASE_STYLES, baseStyle) || labelOf(REFERENCE_TARGETS, referenceTarget) || '—',
    );

    data.set('sizing_method', useMeasurements ? 'Custom Measurements' : 'Standard Size');
    data.set('standard_size', size ?? '');
    data.set('height_cm', heightCm.trim());
    data.set('bust_cm', useMeasurements ? cm.bust : '');
    data.set('waist_cm', useMeasurements ? cm.waist : '');
    data.set('hips_cm', useMeasurements ? cm.hips : '');

    data.set('contact_method', contact?.label ?? '');
    data.set('contact_handle', contact ? contactHandle.trim() : '');
    data.set('customization_notes', tweakNote.trim() || '(no extra notes)');
    data.set('starting_price', baht(CUSTOM_STARTING_PRICE));

    data.set('address', addressLabel);
    data.set('address_line1', shipping.line1.trim());
    data.set('address_line2', shipping.line2.trim());
    data.set('city', shipping.city.trim());
    data.set('postcode', shipping.postcode.trim());
    data.set('country', shipping.country.trim());

    uploads.forEach((upload) => data.append('inspiration', upload.file));

    // Read back from `data` rather than the raw state, so the email says
    // exactly what was actually recorded — one source of truth for both.
    const field = (key: string) => String(data.get(key) ?? '');
    const emailPayload = {
      requestId: field('request_id'),
      name: name.trim(),
      email: email.trim(),
      making: field('outfit_type'),
      enteredVia: field('entry_path'),
      referenceUrl: field('reference_url'),
      keepAsShown: field('loved_elements'),
      size: fitSummary,
      height: heightCm.trim() ? `${heightCm.trim()} cm` : '',
      silhouette: field('silhouette'),
      details: field('details'),
      yarns: yarnSummary,
      notes: field('customization_notes'),
      startingPrice: field('starting_price'),
      contactMethod: field('contact_method'),
      contactHandle: field('contact_handle'),
      address: addressLabel,
    };

    setSending(true);
    try {
      // Best-effort, same as the collection checkout: Netlify Forms only
      // intercepts this POST on a deployed site (it always 405s locally), and
      // a hiccup there must not cost the customer their confirmation email —
      // that's the more important side effect and does not depend on this
      // succeeding.
      await submitFormData(data).catch((err) => {
        console.warn('Netlify Forms record failed — continuing anyway.', err);
      });
      setSubmitted(true);

      // The studio's internal notice fires separately, from
      // netlify/functions/submission-created.js — a Netlify Forms hook, so it
      // only runs once deployed and only if the submission above succeeded.
      fetch('/api/custom-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailPayload),
      }).catch((err) => console.warn('Request confirmation email failed to send.', err));
    } catch {
      setSending(false);
      alert(
        'Something went wrong sending your idea. Please try again, or reach us directly on Instagram.',
      );
    }
  }

  if (submitted) {
    return (
      <div ref={successRef} className={f.success}>
        <p style={{ fontSize: '1.05rem', color: 'var(--cream)', marginBottom: '0.6rem' }}>
          Got it! Your idea is with YOU LOOP. ✨
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--mgray)', lineHeight: 1.7 }}>
          We&apos;ll review your design and fit, then reach out to confirm everything before we
          start.
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

  /* ── THE CHOOSER ── */
  if (!entryPath) {
    return (
      <div>
        <h3 className={w.stepTitle}>Where should we start?</h3>
        <div className={w.pathGrid}>
          {ENTRY_PATHS.map((path) => (
            <button
              key={path.value}
              type="button"
              className={w.pathCard}
              onClick={() => choosePath(path.value)}
            >
              <span className={w.pathIcon} aria-hidden="true">
                <PathIcon path={path.value} />
              </span>
              <span className={w.pathBody}>
                <span className={w.pathTitle}>{path.title}</span>
                <span className={w.pathMicro}>{path.micro}</span>
                <span className={w.pathMeta}>{path.meta}</span>
              </span>
              <span className={w.pathArrow} aria-hidden="true">
                &#8594;
              </span>
            </button>
          ))}
        </div>

        {/* The only place this figure is shown on screen — it no longer
            repeats at the end of the form, which just states that the final
            quote depends on the piece. Still recorded in starting_price for
            the record and the confirmation email. */}
        <p className={w.chooserTeaser}>
          Custom pieces start from {baht(CUSTOM_STARTING_PRICE)} · nothing is charged until we agree
          the piece with you.
        </p>
      </div>
    );
  }

  const copy = STEP_COPY[current];

  return (
    <div>
      {/* PROGRESS */}
      <div className={w.progress}>
        {steps.map((key, i) => (
          <span key={key} className={`${w.tick} ${i <= stepIndex ? w.tickDone : ''}`} />
        ))}
        <span className={w.stepCount}>
          {stepIndex + 1} / {steps.length}
        </span>
      </div>

      <h3 className={w.stepTitle}>{copy.title}</h3>
      <p className={w.stepIntro}>{copy.intro}</p>

      {/* ── REFERENCE: photo or link ── */}
      {current === 'reference' && (
        <>
          <div className={f.field}>
            <div
              className={`${w.dropzone} ${dragOver ? w.dropzoneOver : ''}`}
              onClick={() => dropInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addFiles(e.dataTransfer.files);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  dropInputRef.current?.click();
                }
              }}
            >
              <div className={w.dropzoneTitle}>Drop your photo here</div>
              <div className={w.dropzoneHint}>or tap to choose from your camera roll</div>
            </div>
            <input
              ref={dropInputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = '';
              }}
            />
            {fileError && <div className={f.error}>{fileError}</div>}
            <div className={f.filePreview}>
              {uploads.map((upload, i) => (
                <div key={upload.url} className={f.thumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={upload.url} alt={`Reference ${i + 1}`} />
                  <button
                    type="button"
                    className={f.thumbRemove}
                    aria-label="Remove photo"
                    onClick={() => removeUpload(i)}
                  >
                    &#10005;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={w.orRule}>or paste a link</div>

          <div className={f.field}>
            <input
              className={`${f.input} ${urlError ? f.invalid : ''}`}
              type="url"
              inputMode="url"
              maxLength={500}
              placeholder="Paste a TikTok, Instagram or Pinterest link"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              onBlur={() =>
                setUrlError(
                  !referenceUrl.trim() || isValidUrl(referenceUrl)
                    ? ''
                    : "That doesn't look like a valid link",
                )
              }
              aria-label="Link to a photo or post"
            />
            {urlError && <div className={f.error}>{urlError}</div>}
            <div className={f.help}>
              Whichever you have — a photo, a link, or both. At least one is needed to continue.
            </div>
          </div>
        </>
      )}

      {/* ── REFERENCE: three questions ── */}
      {current === 'refine' && (
        <>
          <div className={f.field}>
            <label className={f.label}>What part of this are we making for you? *</label>
            <div className={f.chips}>
              {REFERENCE_TARGETS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${f.chip} ${referenceTarget === option.value ? f.active : ''}`}
                  onClick={() => setReferenceTarget(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={f.help}>
              A photo often shows a whole outfit — tell us which piece you want.
            </div>
          </div>

          <div className={f.field}>
            <label className={f.label}>
              What do you love most about it?{' '}
              <span style={{ color: 'var(--mgray)', fontWeight: 400 }}>(optional)</span>
            </label>
            <div className={f.chips}>
              {LOVED_ELEMENTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${f.chip} ${lovedElements.includes(option.value) ? f.active : ''}`}
                  onClick={() => toggle(setLovedElements, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={f.help}>Whatever you tick, we keep exactly as it is.</div>
          </div>

          <div className={f.field}>
            <label className={f.label} htmlFor="cr-tweaks">
              Any tweaks?{' '}
              <span style={{ color: 'var(--mgray)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              className={f.input}
              type="text"
              id="cr-tweaks"
              maxLength={600}
              value={tweakNote}
              onChange={(e) => setTweakNote(e.target.value)}
              placeholder="e.g., Make the skirt longer, change colour to cream…"
            />
          </div>
        </>
      )}

      {/* ── SHAPE ── */}
      {current === 'shape' && (
        <div className={f.field}>
          <label className={f.label}>Start from a shape *</label>
          <div className={w.styleGrid}>
            {BASE_STYLES.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${w.styleCard} ${baseStyle === option.value ? w.styleCardActive : ''}`}
                onClick={() => setBaseStyle(option.value)}
              >
                <span className={w.styleName}>{option.label}</span>
                <span className={w.styleHint}>{option.hint}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── SIMPLE FIT (reference path) ── */}
      {current === 'simpleFit' && renderSizeSection()}

      {/* ── FIT (shape path) ── */}
      {current === 'fit' && (
        <>
          {renderSizeSection()}

          {shows.length && (
            <div className={f.field} style={{ marginTop: '0.8rem' }}>
              <label className={f.label}>Preferred length</label>
              <div className={f.chips}>
                {LENGTHS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${f.chip} ${length === option.value ? f.active : ''}`}
                    onClick={() => setLength(length === option.value ? null : option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TWEAKS (shape path) ── */}
      {current === 'tweaks' && (
        <>
          {shows.neckline && (
            <div className={f.field}>
              <label className={f.label}>Neckline *</label>
              <div className={f.chips}>
                {NECKLINES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${f.chip} ${neckline === option.value ? f.active : ''}`}
                    onClick={() => setNeckline(neckline === option.value ? null : option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {shows.sleeves && (
            <div className={f.field}>
              <label className={f.label}>Sleeves *</label>
              <div className={f.chips}>
                {SLEEVES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`${f.chip} ${sleeves === option.value ? f.active : ''}`}
                    onClick={() => setSleeves(sleeves === option.value ? null : option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={f.field}>
            <label className={f.label}>Silhouette *</label>
            <div className={f.chips}>
              {SILHOUETTES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${f.chip} ${silhouette === option.value ? f.active : ''}`}
                  onClick={() => setSilhouette(silhouette === option.value ? null : option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={f.help}>Pick one — how close to the body it sits.</div>
          </div>

          <div className={f.field}>
            <label className={f.label}>Details</label>
            <div className={f.chips}>
              {DETAILS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${f.chip} ${details.includes(option.value) ? f.active : ''}`}
                  onClick={() => toggle(setDetails, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className={f.help}>Pick as many as you like — these combine.</div>
          </div>

          <div className={f.field}>
            <label className={f.label}>
              Yarn colours *{' '}
              <span style={{ color: 'var(--mgray)', fontWeight: 400 }}>(up to {MAX_YARNS})</span>
            </label>
            <div className={w.yarnGrid}>
              {YARNS.map((yarn) => {
                const picked = yarnIds.includes(yarn.id);
                return (
                  <button
                    key={yarn.id}
                    type="button"
                    className={`${w.yarnBall} ${picked ? w.yarnBallActive : ''}`}
                    onClick={() => toggleYarn(yarn.id)}
                    disabled={!picked && yarnIds.length >= MAX_YARNS}
                    title={`#${yarn.id} ${yarn.name}`}
                    aria-label={`${yarn.name}, yarn number ${yarn.id}`}
                    aria-pressed={picked}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={yarn.img} alt="" loading="lazy" />
                  </button>
                );
              })}
            </div>
            {chosenYarns.length > 0 && (
              <div className={w.yarnChosen}>
                {chosenYarns.map((yarn) => (
                  <button
                    key={yarn.id}
                    type="button"
                    className={w.yarnChip}
                    onClick={() => toggleYarn(yarn.id)}
                    aria-label={`Remove ${yarn.name}`}
                  >
                    <span className={w.yarnChipDot} style={{ background: yarn.hex }} />
                    #{yarn.id} {yarn.name}
                    <span className={w.yarnChipX}>&#10005;</span>
                  </button>
                ))}
              </div>
            )}
            <div className={f.help}>
              Our full palette — {YARNS.length} shades of 100% cotton. Pick up to {MAX_YARNS}.
            </div>
          </div>

          {/* Required — every choice above it can honestly be "Not Sure,"
              so this is the only thing on this path that guarantees an
              actual description exists to work from. */}
          <div className={f.field}>
            <label className={f.label} htmlFor="cr-vision">
              Describe what you have in mind *
            </label>
            <div className={f.help} style={{ marginBottom: '0.5rem' }}>
              The choices above cover the shape — this is what our artisan actually reads first,
              so the more specific, the better we get it on the first try.
            </div>
            <textarea
              className={`${f.input} ${f.textarea}`}
              id="cr-vision"
              rows={4}
              maxLength={600}
              value={tweakNote}
              onChange={(e) => setTweakNote(e.target.value)}
              placeholder="e.g., For a friend's wedding, something that photographs well outdoors. I love a fitted waist with movement in the skirt…"
            />
          </div>
        </>
      )}

      {/* ── INSPO (shape path) ── */}
      {current === 'inspo' && (
        <div className={f.field}>
          <label className={f.label} htmlFor="cr-inspo">
            Reference photos
          </label>
          <input
            className={f.input}
            type="file"
            id="cr-inspo"
            accept="image/*"
            multiple
            onChange={(e) => {
              addFiles(e.target.files);
              e.target.value = '';
            }}
          />
          {fileError && <div className={f.error}>{fileError}</div>}
          <div className={f.help}>Upload as many as you like (max 10MB each).</div>
          <div className={f.filePreview}>
            {uploads.map((upload, i) => (
              <div key={upload.url} className={f.thumb}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={upload.url} alt={`Inspiration photo ${i + 1}`} />
                <button
                  type="button"
                  className={f.thumbRemove}
                  aria-label="Remove photo"
                  onClick={() => removeUpload(i)}
                >
                  &#10005;
                </button>
              </div>
            ))}
          </div>
          {uploads.length === 0 && (
            <div className={f.example}>
              No photos? That&apos;s fine — you&apos;ve already told us the shape, fit and colours.
              Skip straight on.
            </div>
          )}
        </div>
      )}

      {/* ── CONTACT ── */}
      {current === 'contact' && (
        <>
          <div className={w.review}>
            {[
              { label: 'Making', value: labelOf(REFERENCE_TARGETS, referenceTarget) || labelOf(BASE_STYLES, baseStyle) },
              { label: 'Reference', value: uploads.length ? `${uploads.length} photo${uploads.length > 1 ? 's' : ''}` : '' },
              { label: 'Link', value: referenceUrl.trim() },
              { label: 'Keep as shown', value: labelsOf(LOVED_ELEMENTS, lovedElements) },
              { label: 'Your notes', value: tweakNote.trim() },
              { label: 'Size', value: fitSummary },
              { label: 'Height', value: heightCm ? `${heightCm} cm` : '' },
              { label: 'Length', value: shows.length ? labelOf(LENGTHS, length) : '' },
              { label: 'Neckline', value: shows.neckline ? labelOf(NECKLINES, neckline) : '' },
              { label: 'Sleeves', value: shows.sleeves ? labelOf(SLEEVES, sleeves) : '' },
              { label: 'Silhouette', value: labelOf(SILHOUETTES, silhouette) },
              { label: 'Details', value: labelsOf(DETAILS, details) },
              { label: 'Yarns', value: yarnSummary },
            ]
              .filter((row) => row.value)
              .map((row) => (
                <div key={row.label} className={w.reviewRow}>
                  <span className={w.reviewLabel}>{row.label}</span>
                  <span className={w.reviewValue}>{row.value}</span>
                </div>
              ))}
          </div>

          <div className={f.field}>
            <label className={f.label} htmlFor="cr-name">
              Your name *
            </label>
            <input
              className={`${f.input} ${nameError ? f.invalid : ''}`}
              type="text"
              id="cr-name"
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() =>
                setNameError(name.trim().length >= 2 ? '' : 'Enter your name')
              }
              autoComplete="name"
            />
            {nameError && <div className={f.error}>{nameError}</div>}
          </div>

          <div className={f.field}>
            <label className={f.label} htmlFor="cr-email">
              Your email *
            </label>
            <input
              className={`${f.input} ${emailError ? f.invalid : ''}`}
              type="email"
              id="cr-email"
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                setEmailError(EMAIL_RE.test(email.trim()) ? '' : 'Enter a valid email address')
              }
              autoComplete="email"
            />
            {emailError && <div className={f.error}>{emailError}</div>}
            <div className={f.help}>Required — this is where your order confirmation goes.</div>
          </div>

          <div className={f.field}>
            <label className={f.label}>Preferred chat channel *</label>
            <div className={f.help} style={{ marginBottom: '0.5rem' }}>
              We&apos;ll talk through fit and design details here — faster than going back and
              forth by email.
            </div>
            <div className={f.chips}>
              {CONTACT_METHODS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${f.chip} ${contactMethod === option.value ? f.active : ''}`}
                  onClick={() => {
                    setContactMethod(option.value);
                    setContactHandle('');
                    // Each channel has its own valid shape, so an error about
                    // yesterday's channel has nothing useful to say here.
                    setHandleError('');
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Each platform asks for what that platform actually uses, and a
                correctly-shaped handle is required once a channel is picked —
                a "preferred channel" we can't actually reach you on isn't a
                preference, it's a dead end. */}
            {contact ? (
              <>
                <label className={f.label} htmlFor="cr-handle" style={{ marginTop: '0.7rem' }}>
                  {contact.fieldLabel} *
                </label>
                <input
                  className={`${f.input} ${handleError ? f.invalid : ''}`}
                  type="text"
                  id="cr-handle"
                  maxLength={50}
                  inputMode={contact.value === 'whatsapp' ? 'tel' : 'text'}
                  placeholder={contact.placeholder}
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                  onBlur={() =>
                    setHandleError(
                      isValidHandle(contact.value, contactHandle)
                        ? ''
                        : `That doesn't look like a valid ${(contact.fieldLabel ?? 'handle').toLowerCase()}`,
                    )
                  }
                />
                {handleError && <div className={f.error}>{handleError}</div>}
                <div className={f.help}>{contact.help}</div>
              </>
            ) : (
              <div className={f.help}>Pick one to continue.</div>
            )}
          </div>

          {/* SHIPPING DETAILS — where it goes, same fields as the collection
              checkout so both flows record an order the same way. */}
          <div className={f.field}>
            <label className={f.label}>Shipping details</label>
          </div>
          <div className={f.field}>
            <label className={f.label} htmlFor="cr-ship-line1">
              Address
            </label>
            <input
              className={f.input}
              type="text"
              id="cr-ship-line1"
              autoComplete="address-line1"
              placeholder="House number and street"
              value={shipping.line1}
              onChange={(e) => setShipping({ ...shipping, line1: e.target.value })}
            />
          </div>
          <div className={f.field}>
            <label className={f.label} htmlFor="cr-ship-line2">
              Apartment, building, floor{' '}
              <span style={{ color: 'var(--mgray)', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              className={f.input}
              type="text"
              id="cr-ship-line2"
              autoComplete="address-line2"
              placeholder="Unit 4B, Riverside Tower"
              value={shipping.line2}
              onChange={(e) => setShipping({ ...shipping, line2: e.target.value })}
            />
          </div>
          <div className={w.shipRow}>
            <div className={f.field}>
              <label className={f.label} htmlFor="cr-ship-city">
                City / Province
              </label>
              <input
                className={f.input}
                type="text"
                id="cr-ship-city"
                autoComplete="address-level1"
                placeholder="Bangkok"
                value={shipping.city}
                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
              />
            </div>
            <div className={f.field}>
              <label className={f.label} htmlFor="cr-ship-postcode">
                Postcode
              </label>
              <input
                className={f.input}
                type="text"
                id="cr-ship-postcode"
                autoComplete="postal-code"
                inputMode="numeric"
                placeholder="10110"
                value={shipping.postcode}
                onChange={(e) => setShipping({ ...shipping, postcode: e.target.value })}
              />
            </div>
          </div>
          <div className={f.field}>
            <label className={f.label} htmlFor="cr-ship-country">
              Country
            </label>
            <input
              className={f.input}
              type="text"
              id="cr-ship-country"
              autoComplete="country-name"
              placeholder="Thailand"
              value={shipping.country}
              onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
            />
          </div>

          <div className={w.priceNote}>
            <span className={w.priceCaveat}>
              Your final quote depends on yarn, size and detail. We confirm it with you before
              anything is cast on — nothing is charged now.
            </span>
          </div>
        </>
      )}

      {/* ── NAVIGATION ── */}
      <div className={w.nav}>
        <button type="button" className={w.back} onClick={back}>
          ← Back
        </button>
        {isLast ? (
          <button
            type="button"
            className={`${f.submit} ${w.next}`}
            onClick={handleSubmit}
            disabled={sending || !canSubmit}
          >
            {sending ? 'Sending…' : 'Submit My Request ✨'}
          </button>
        ) : (
          <button
            type="button"
            className={`${f.submit} ${w.next}`}
            onClick={next}
            disabled={!canAdvance()}
          >
            {current === 'inspo' && uploads.length === 0 ? 'Skip & continue' : 'Continue'}
          </button>
        )}
      </div>
    </div>
  );
}
