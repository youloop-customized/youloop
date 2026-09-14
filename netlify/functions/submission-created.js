// Fires automatically after every Netlify Forms submission on this site
// (Netlify's naming convention: a function literally named "submission-created"
// is invoked as a background function with the submission payload).
//
// Scoped to the "custom-request" form only — sends a branded HTML "order card"
// notification email to hello.youloop@gmail.com, forward-able as-is to the
// production team, plus a plain-text fallback for clients that strip HTML.
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
  // Netlify replaces file inputs with a URL (or array of URLs for multi-file) in the submission payload.
  if (!v) return [];
  if (Array.isArray(v)) {
    return v.map((f) => (typeof f === 'string' ? f : (f && f.url) || '')).filter(Boolean);
  }
  if (typeof v === 'object') return v.url ? [v.url] : [];
  return [String(v)];
}

function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildFields(data) {
  const name = val(data.name) || 'Unknown';
  const moment = val(data.moment) || '—';
  let outfitTypes = val(data.outfit_types) || '—';
  if (val(data.outfit_other)) outfitTypes += ` (Other: ${val(data.outfit_other)})`;

  const sizingMethod = val(data.sizing_method) || '—';
  const standardSize = val(data.standard_size);
  const measurementSource = val(data.measurement_source);

  const measureRows = MEASURE_ORDER
    .map((key) => {
      const v = val(data['measure_' + key]);
      return v ? { label: MEASURE_LABELS[key], value: v } : null;
    })
    .filter(Boolean);

  const contactKey = val(data.preferred_contact);
  const contactLabel = CONTACT_LABELS[contactKey] || contactKey || '—';
  const images = fileLinks(data.inspiration);
  const submittedAt = val(data.submitted_at) || new Date().toISOString();
  const requestId = val(data.request_id) || '—';

  return {
    name, moment, outfitTypes, sizingMethod, standardSize, measurementSource,
    measureRows, contactKey, contactLabel, images, submittedAt, requestId,
    notes: val(data.customization_notes) || '(none provided)',
    requiredBy: val(data.required_by) || '—',
    contactDetail: val(data.contact_detail) || '—',
    emailOptional: val(data.email_optional) || '(not provided)',
    fitStatus: val(data.fit_status) || 'Fit Check Required',
    requestStatus: val(data.request_status) || 'Needs Review',
  };
}

function buildText(f) {
  const lines = [
    `Customer: ${f.name}`,
    '',
    `Moment: ${f.moment}`,
    '',
    `Outfit Type: ${f.outfitTypes}`,
    '',
    `Inspiration:`,
    f.images.length ? f.images.join('\n') : 'None uploaded',
    '',
    `Customization Notes:`,
    f.notes,
    '',
    `Sizing Method: ${f.sizingMethod}`,
    f.standardSize ? `Standard Size: ${f.standardSize}` : null,
    f.measureRows.length ? `Measurements:\n${f.measureRows.map((m) => `  ${m.label}: ${m.value}`).join('\n')}` : null,
    f.measurementSource ? `Measurement Source: ${f.measurementSource}` : null,
    '',
    `Required By: ${f.requiredBy}`,
    '',
    `Preferred Contact: ${f.contactLabel}`,
    `Contact: ${f.contactDetail}`,
    `Email: ${f.emailOptional}`,
    '',
    `Fit Status: ${f.fitStatus}`,
    `Request Status: ${f.requestStatus}`,
    '',
    `Request ID: ${f.requestId}`,
    `Submitted: ${f.submittedAt}`,
    '',
    'View all submissions: your Netlify dashboard → Site → Forms → custom-request',
  ].filter((l) => l !== null);
  return lines.join('\n');
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #f0e2e6;font-size:12px;font-weight:600;color:#8f4a63;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #f0e2e6;font-size:13px;color:#3a1f2b;">${value}</td>
  </tr>`;
}

function buildHtml(f) {
  const measureBlock = f.measureRows.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
        ${f.measureRows.map((m) => row(m.label, esc(m.value) + ' cm')).join('')}
      </table>`
    : '<div style="font-size:13px;color:#8a7080;">No measurements submitted.</div>';

  const imagesBlock = f.images.length
    ? `<table role="presentation" cellpadding="0" cellspacing="0"><tr>
        ${f.images.map((url) => `<td style="padding:4px;"><a href="${esc(url)}"><img src="${esc(url)}" width="110" height="110" style="width:110px;height:110px;object-fit:cover;border-radius:8px;display:block;border:1px solid #eadde2;"></a></td>`).join('')}
      </tr></table>`
    : '<div style="font-size:13px;color:#8a7080;">No inspiration photos uploaded.</div>';

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f7f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0eb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eadde2;">
        <tr><td style="background:#2a1a2e;padding:22px 24px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c4708a;font-weight:700;">YOU LOOP · Custom Order</div>
          <div style="font-size:22px;color:#ffffff;margin-top:4px;font-weight:700;">✨ New Custom Look</div>
          <div style="font-size:13px;color:#d9c3cc;margin-top:2px;">${esc(f.name)} — ${esc(f.moment)}</div>
        </td></tr>
        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:6px;">Customer &amp; Contact</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', esc(f.name))}
            ${row('Preferred Contact', esc(f.contactLabel))}
            ${row('Contact', esc(f.contactDetail))}
            ${row('Email', esc(f.emailOptional))}
          </table>
        </td></tr>
        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:6px;">The Look</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Outfit Type', esc(f.outfitTypes))}
            ${row('Moment', esc(f.moment))}
            ${row('Required By', esc(f.requiredBy))}
            ${row('Customization Notes', esc(f.notes).replace(/\n/g, '<br>'))}
          </table>
        </td></tr>
        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:6px;">Sizing</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Sizing Method', esc(f.sizingMethod))}
            ${f.standardSize ? row('Standard Size', esc(f.standardSize)) : ''}
            ${f.measurementSource ? row('Measurement Source', esc(f.measurementSource)) : ''}
          </table>
          ${measureBlock}
        </td></tr>
        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:8px;">Inspiration</div>
          ${imagesBlock}
        </td></tr>
        <tr><td style="padding:18px 24px 22px;">
          <div style="background:#faf2f5;border-radius:10px;padding:12px 14px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-size:12px;color:#8f4a63;font-weight:700;padding:2px 0;">Fit Status</td><td style="font-size:12px;color:#3a1f2b;text-align:right;padding:2px 0;">${esc(f.fitStatus)}</td></tr>
              <tr><td style="font-size:12px;color:#8f4a63;font-weight:700;padding:2px 0;">Request Status</td><td style="font-size:12px;color:#3a1f2b;text-align:right;padding:2px 0;">${esc(f.requestStatus)}</td></tr>
              <tr><td style="font-size:12px;color:#8f4a63;font-weight:700;padding:2px 0;">Request ID</td><td style="font-size:12px;color:#3a1f2b;text-align:right;padding:2px 0;">${esc(f.requestId)}</td></tr>
              <tr><td style="font-size:12px;color:#8f4a63;font-weight:700;padding:2px 0;">Submitted</td><td style="font-size:12px;color:#3a1f2b;text-align:right;padding:2px 0;">${esc(f.submittedAt)}</td></tr>
            </table>
          </div>
          <div style="font-size:11px;color:#a3899a;margin-top:14px;">Forward this email to your production team, or view every submission and export CSV from your Netlify dashboard → Site → Forms → custom-request.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
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

    const f = buildFields(data);
    const subject = `✨ New Custom Look — ${f.name} — ${f.moment}`;

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
        html: buildHtml(f),
        text: buildText(f),
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
