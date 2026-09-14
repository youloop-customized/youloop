// Fires automatically after every Netlify Forms submission on this site
// (Netlify's naming convention: a function literally named "submission-created"
// is invoked as a background function with the submission payload).
//
// Scoped to the "custom-request" form only — sends a branded notification
// email to hello.youloop@gmail.com formatted per the YOU LOOP custom-order spec.
//
// Requires a Netlify environment variable: RESEND_API_KEY
// Optional overrides: NOTIFY_EMAIL, RESEND_FROM

const MEASURE_LABELS = {
  bust: 'Bust',
  underbust: 'Underbust',
  bra_size: 'Usual Bra Size',
  waist: 'Waist',
  hips: 'Hips',
  shoulder_width: 'Shoulder Width',
  shoulder_to_waist: 'Shoulder to Waist',
  armhole: 'Armhole',
  upper_arm: 'Upper Arm',
  sleeve_length: 'Arm / Sleeve Length',
  wrist: 'Wrist',
  top_length: 'Desired Top Length',
  dress_length: 'Desired Dress Length',
  skirt_length: 'Desired Skirt Length',
  rise: 'Rise',
  inseam: 'Inseam / Desired Bottom Length',
};
const MEASURE_ORDER = Object.keys(MEASURE_LABELS);

const CONTACT_LABELS = {
  instagram: 'Instagram DM',
  facebook: 'Facebook Messenger',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  viber: 'Viber',
  email: 'Email',
};

function val(v) {
  if (v === undefined || v === null) return '';
  if (Array.isArray(v)) return v.filter(Boolean).join(', ');
  return String(v).trim();
}

function fileLinks(v) {
  // Netlify replaces file inputs with an object/URL (or array for multi-file) in the submission payload.
  if (!v) return '';
  if (Array.isArray(v)) {
    return v.map((f) => (typeof f === 'string' ? f : (f && f.url) || '')).filter(Boolean).join('\n');
  }
  if (typeof v === 'object') return v.url || '';
  return String(v);
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const payload = body.payload || {};
    const data = payload.data || {};

    // Only handle the YOU LOOP custom-order/request form — other forms on the site are ignored.
    if (payload.form_name !== 'custom-request') {
      return { statusCode: 200, body: 'skipped (not custom-request form)' };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('submission-created: RESEND_API_KEY is not set — skipping email notification. Submission is still saved in Netlify Forms.');
      return { statusCode: 200, body: 'no RESEND_API_KEY configured, skipped email' };
    }

    const notifyTo = process.env.NOTIFY_EMAIL || 'hello.youloop@gmail.com';
    const from = process.env.RESEND_FROM || 'YOU LOOP <onboarding@resend.dev>';

    const name = val(data.name) || 'Unknown';
    const moment = val(data.moment) || '—';
    let outfitTypes = val(data.outfit_types) || '—';
    if (val(data.outfit_other)) outfitTypes += ` (Other: ${val(data.outfit_other)})`;

    const sizingMethod = val(data.sizing_method) || '—';
    const standardSize = val(data.standard_size);
    const measurementSource = val(data.measurement_source);

    const measureLines = MEASURE_ORDER
      .map((key) => {
        const v = val(data['measure_' + key]);
        return v ? `  ${MEASURE_LABELS[key]}: ${v}` : null;
      })
      .filter(Boolean);

    const contactKey = val(data.preferred_contact);
    const contactLabel = CONTACT_LABELS[contactKey] || contactKey || '—';

    const inspirationLinks = fileLinks(data.inspiration) || 'None uploaded';

    const submittedAt = val(data.submitted_at) || payload.created_at || new Date().toISOString();
    const requestId = val(data.request_id) || '—';

    const lines = [
      `Customer: ${name}`,
      '',
      `Moment: ${moment}`,
      '',
      `Outfit Type: ${outfitTypes}`,
      '',
      `Inspiration:`,
      inspirationLinks,
      '',
      `Customization Notes:`,
      val(data.customization_notes) || '(none provided)',
      '',
      `Sizing Method: ${sizingMethod}`,
      standardSize ? `Standard Size: ${standardSize}` : null,
      measureLines.length ? `Measurements:\n${measureLines.join('\n')}` : null,
      measurementSource ? `Measurement Source: ${measurementSource}` : null,
      '',
      `Required By: ${val(data.required_by) || '—'}`,
      '',
      `Preferred Contact: ${contactLabel}`,
      `Contact: ${val(data.contact_detail) || '—'}`,
      `Email: ${val(data.email_optional) || '(not provided)'}`,
      '',
      `Fit Status: ${val(data.fit_status) || 'Fit Check Required'}`,
      `Request Status: ${val(data.request_status) || 'Needs Review'}`,
      '',
      `Request ID: ${requestId}`,
      `Submitted: ${submittedAt}`,
      '',
      'View all submissions: your Netlify dashboard → Site → Forms → custom-request',
    ].filter((l) => l !== null);

    const subject = `✨ New Custom Look — ${name} — ${moment}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from,
        to: [notifyTo],
        subject,
        text: lines.join('\n'),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('submission-created: Resend API error', res.status, errText);
      return { statusCode: 200, body: 'email send failed, see function logs' };
    }

    return { statusCode: 200, body: 'notification sent' };
  } catch (err) {
    console.error('submission-created: unexpected error', err);
    return { statusCode: 200, body: 'unexpected error, see function logs' };
  }
};
