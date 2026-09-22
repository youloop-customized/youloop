'use client';

import { useEffect, useRef, useState } from 'react';
import {
  BASE_PRICES,
  BASE_STYLES,
  CONTACT_METHODS,
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
import { YARNS } from '@/data/yarns';
import { baht, generateRequestId } from '@/lib/format';
import { submitFormData } from '@/lib/netlify';
import f from '@/components/forms/Form.module.css';
import w from './CustomRequest.module.css';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Measurements = { bust: string; waist: string; hips: string };

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
  const [measureLater, setMeasureLater] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState('email');
  const [contactHandle, setContactHandle] = useState('');

  const [emailError, setEmailError] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const labelOf = (list: { value: string; label: string }[], value: string | null) =>
    list.find((o) => o.value === value)?.label ?? '';
  const labelsOf = (list: { value: string; label: string }[], values: string[]) =>
    values.map((v) => labelOf(list, v)).join(', ');

  const steps = entryPath ? PATH_STEPS[entryPath] : [];
  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const shows = tweaksFor(baseStyle);
  // A reference-led request has no silhouette yet, so it is quoted against the
  // open-ended "something unique" figure until we have seen the photo.
  const basePrice = BASE_PRICES[baseStyle ?? 'unique'];
  const priceLabel = baseStyle ? labelOf(BASE_STYLES, baseStyle).toLowerCase() : 'piece';
  const chosenYarns = yarnIds
    .map((id) => YARNS.find((y) => y.id === id))
    .filter((y): y is (typeof YARNS)[number] => Boolean(y));
  const contact = CONTACT_METHODS.find((m) => m.value === contactMethod) ?? CONTACT_METHODS[0];

  function addFiles(list: FileList | null) {
    const added = Array.from(list ?? []).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    if (added.length) setUploads((current) => [...current, ...added]);
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
        return uploads.length > 0 || referenceUrl.trim().length > 0;
      case 'refine':
        return Boolean(referenceTarget);
      case 'shape':
        return Boolean(baseStyle);
      case 'fit':
        return useMeasurements ? Boolean(cm.bust && cm.waist && cm.hips) : Boolean(size);
      case 'simpleFit':
        return Boolean(size) || measureLater;
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

  const fitSummary = measureLater
    ? 'Measurements to follow'
    : useMeasurements
      ? `${cm.bust} / ${cm.waist} / ${cm.hips} cm`
      : (size ?? '');
  const yarnSummary = chosenYarns.map((y) => `#${y.id} ${y.name}`).join(', ');

  async function handleSubmit() {
    if (!name.trim()) {
      alert('We need a name to put on your request ✨');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError('Enter a valid email address — we send your order confirmation there');
      return;
    }
    setEmailError('');

    const data = new FormData();
    data.set('form-name', 'custom-request');
    // Netlify's honeypot: declared on the form in public/__forms.html, and only
    // ever spam if it arrives with a value.
    data.set('bot-field', '');
    data.set('request_id', requestId);
    data.set('request_status', 'Needs Review');
    data.set('fit_status', measureLater ? 'Measurements To Follow' : 'Fit Check Required');
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

    data.set(
      'sizing_method',
      measureLater ? 'Sending measurements later' : useMeasurements ? 'Custom Measurements' : 'Standard Size',
    );
    data.set('standard_size', size ?? '');
    data.set('height_cm', heightCm.trim());
    data.set('measurements_later', measureLater ? 'Yes' : '');
    data.set('bust_cm', useMeasurements ? cm.bust : '');
    data.set('waist_cm', useMeasurements ? cm.waist : '');
    data.set('hips_cm', useMeasurements ? cm.hips : '');

    data.set('contact_method', contact.label);
    data.set('contact_handle', contact.fieldLabel ? contactHandle.trim() : '');
    data.set('customization_notes', tweakNote.trim() || '(no extra notes)');
    data.set('starting_price', baht(basePrice));

    uploads.forEach((upload) => data.append('inspiration', upload.file));

    setSending(true);
    try {
      await submitFormData(data);
      setSubmitted(true);
    } catch {
      setSending(false);
      alert(
        'Something went wrong sending your idea. Please try again, or reach us directly on Instagram.',
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
        <p className={w.chooseIntro}>
          Either way takes a couple of minutes, and nothing is charged until we have agreed the
          piece and the price with you.
        </p>
        <div className={w.pathGrid}>
          {ENTRY_PATHS.map((path) => (
            <button
              key={path.value}
              type="button"
              className={w.pathCard}
              onClick={() => choosePath(path.value)}
            >
              <span className={w.pathBody}>
                <span className={w.pathName}>{path.label}</span>
                <span className={w.pathQuote}>{path.quote}</span>
                <span className={w.pathHint}>{path.hint}</span>
              </span>
              <span className={w.pathArrow} aria-hidden="true">
                &#8594;
              </span>
            </button>
          ))}
        </div>
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
              className={f.input}
              type="url"
              inputMode="url"
              placeholder="Paste a TikTok, Instagram or Pinterest link"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              aria-label="Link to a photo or post"
            />
            <div className={f.help}>Whichever you have — a photo, a link, or both.</div>
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
      {current === 'simpleFit' && (
        <>
          <div className={f.field}>
            <label className={f.label}>Your usual size</label>
            <div className={f.chips}>
              {SIZES.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${f.chip} ${size === option ? f.active : ''}`}
                  onClick={() => {
                    setSize(size === option ? null : option);
                    setMeasureLater(false);
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <label className={f.checkline}>
            <input
              type="checkbox"
              checked={measureLater}
              onChange={(e) => {
                setMeasureLater(e.target.checked);
                if (e.target.checked) setSize(null);
              }}
            />{' '}
            I&apos;ll send my exact measurements on chat later
          </label>

          <div className={f.field} style={{ marginTop: '1rem' }}>
            <label className={f.label} htmlFor="cr-height">
              Your height
            </label>
            <div className={w.heightRow}>
              <input
                className={f.input}
                type="number"
                id="cr-height"
                inputMode="numeric"
                min={120}
                max={220}
                placeholder="160"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
              <span className={w.heightUnit}>cm</span>
            </div>
            <div className={f.help}>
              This is what gets dress and trouser lengths right — worth 10 seconds.
            </div>
          </div>
        </>
      )}

      {/* ── FIT (shape path) ── */}
      {current === 'fit' && (
        <>
          {!useMeasurements && (
            <div className={f.field}>
              <label className={f.label}>Your size *</label>
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
            </div>
          )}

          <label className={f.checkline}>
            <input
              type="checkbox"
              checked={useMeasurements}
              onChange={(e) => {
                setUseMeasurements(e.target.checked);
                if (e.target.checked) setSize(null);
              }}
            />{' '}
            I&apos;d rather give my measurements
          </label>

          {useMeasurements && (
            <div className={f.field} style={{ marginTop: '0.8rem' }}>
              <label className={f.label}>Bust / waist / hips, in cm *</label>
              <div className={w.measureRow}>
                {(['bust', 'waist', 'hips'] as const).map((key) => (
                  <div key={key} className={f.field} style={{ marginBottom: '0.6rem' }}>
                    <input
                      className={f.input}
                      type="number"
                      inputMode="numeric"
                      min={40}
                      max={200}
                      placeholder={key[0].toUpperCase() + key.slice(1)}
                      value={cm[key]}
                      onChange={(e) => setCm({ ...cm, [key]: e.target.value })}
                      aria-label={`${key} in cm`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={f.field} style={{ marginTop: '0.8rem' }}>
            <label className={f.label} htmlFor="cr-height-b">
              Your height
            </label>
            <div className={w.heightRow}>
              <input
                className={f.input}
                type="number"
                id="cr-height-b"
                inputMode="numeric"
                min={120}
                max={220}
                placeholder="160"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
              <span className={w.heightUnit}>cm</span>
            </div>
          </div>

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
              <label className={f.label}>Neckline</label>
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
              <label className={f.label}>Sleeves</label>
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
            <label className={f.label}>Silhouette</label>
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
              Yarn colours{' '}
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
              Our full palette — {YARNS.length} shades of 100% cotton. Pick up to {MAX_YARNS}, or
              skip and we&apos;ll suggest a combination.
            </div>
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
              { label: 'Tweaks', value: tweakNote.trim() },
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
              className={f.input}
              type="text"
              id="cr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className={f.field}>
            <label className={f.label} htmlFor="cr-email">
              Your email *
            </label>
            <input
              className={`${f.input} ${emailError ? f.invalid : ''}`}
              type="email"
              id="cr-email"
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
            <label className={f.label}>Preferred chat channel</label>
            <div className={f.chips}>
              {CONTACT_METHODS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${f.chip} ${contactMethod === option.value ? f.active : ''}`}
                  onClick={() => {
                    setContactMethod(option.value);
                    setContactHandle('');
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Each platform asks for what that platform actually uses. */}
            {contact.fieldLabel ? (
              <>
                <label className={f.label} htmlFor="cr-handle" style={{ marginTop: '0.7rem' }}>
                  {contact.fieldLabel}
                </label>
                <input
                  className={f.input}
                  type="text"
                  id="cr-handle"
                  inputMode={contact.value === 'whatsapp' ? 'tel' : 'text'}
                  placeholder={contact.placeholder}
                  value={contactHandle}
                  onChange={(e) => setContactHandle(e.target.value)}
                />
                <div className={f.help}>{contact.help}</div>
              </>
            ) : (
              <div className={f.help}>{contact.help}</div>
            )}
          </div>

          <div className={w.priceNote}>
            <span className={w.priceFrom}>A custom {priceLabel} starts at</span>
            <span className={w.priceValue}>{baht(basePrice)}</span>
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
            disabled={sending}
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
