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
  const outfitType = val(data.outfit_type) || '—';
  const sizingMethod = val(data.sizing_method) || 'Standard Size';
  const standardSize = val(data.standard_size) || '—';
  const images = fileLinks(data.inspiration);
  const submittedAt = val(data.submitted_at) || new Date().toISOString();
  const requestId = val(data.request_id) || '—';

  // Custom measurements replace the standard size when the customer gives them.
  const measurements = [val(data.bust_cm), val(data.waist_cm), val(data.hips_cm)].filter(Boolean);

  return {
    name, outfitType, sizingMethod, standardSize, images, submittedAt, requestId,
    notes: val(data.customization_notes) || '(none provided)',
    email: val(data.email) || '—',
    fitStatus: val(data.fit_status) || 'Fit Check Required',
    requestStatus: val(data.request_status) || 'Needs Review',
    // Structured choices from the wizard. Each is '—' when the step did not
    // apply to the chosen garment, or the customer left it to us.
    measurements: measurements.length === 3 ? `${measurements.join(' / ')} cm` : '—',
    length: val(data.length) || '—',
    neckline: val(data.neckline) || '—',
    sleeves: val(data.sleeves) || '—',
    entryPath: val(data.entry_path) || 'Guided build',
    referenceUrl: val(data.reference_url),
    referenceTarget: val(data.reference_target) || '—',
    lovedElements: val(data.loved_elements) || '—',
    height: val(data.height_cm) ? `${val(data.height_cm)} cm` : '—',
    measurementsLater: val(data.measurements_later) === 'Yes',
    silhouette: val(data.silhouette) || '—',
    details: val(data.details) || '—',
    yarns: val(data.yarn_colours) || '(our choice)',
    contact: [val(data.contact_method), val(data.contact_handle)].filter(Boolean).join(' · ') || '—',
    startingPrice: val(data.starting_price) || '—',
    address: val(data.address) || '—',
  };
}

function buildText(f) {
  const lines = [
    `Customer: ${f.name}`,
    '',
    `Started from: ${f.entryPath}`,
    f.referenceUrl ? `Reference link: ${f.referenceUrl}` : '',
    `Making: ${f.referenceTarget !== '—' ? f.referenceTarget : f.outfitType}`,
    `Keep exactly as shown: ${f.lovedElements}`,
    '',
    `Outfit Type: ${f.outfitType}`,
    `Length: ${f.length}`,
    `Neckline: ${f.neckline}`,
    `Sleeves: ${f.sleeves}`,
    `Silhouette: ${f.silhouette}`,
    `Details: ${f.details}`,
    `Yarn colours: ${f.yarns}`,
    '',
    `Inspiration:`,
    f.images.length ? f.images.join('\n') : 'None uploaded',
    '',
    `Customization Notes:`,
    f.notes,
    '',
    `Sizing Method: ${f.sizingMethod}`,
    `Standard Size: ${f.standardSize}`,
    `Height: ${f.height}`,
    `Measurements: ${f.measurements}`,
    f.measurementsLater ? '>> Customer is sending exact measurements on chat — follow up.' : '',
    '',
    `Starting Price: ${f.startingPrice}`,
    '',
    `Email: ${f.email}`,
    `Preferred Contact: ${f.contact}`,
    `Ships to: ${f.address}`,
    '',
    `Fit Status: ${f.fitStatus}`,
    `Request Status: ${f.requestStatus}`,
    '',
    `Request ID: ${f.requestId}`,
    `Submitted: ${f.submittedAt}`,
    '',
    'View all submissions: your Netlify dashboard → Site → Forms → custom-request',
  ];
  return lines.join('\n');
}

function row(label, value) {
  return `<tr>
    <td style="padding:8px 12px;border-bottom:1px solid #f0e2e6;font-size:12px;font-weight:600;color:#8f4a63;white-space:nowrap;vertical-align:top;">${esc(label)}</td>
    <td style="padding:8px 12px;border-bottom:1px solid #f0e2e6;font-size:13px;color:#3a1f2b;">${value}</td>
  </tr>`;
}

function buildHtml(f) {
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
          <div style="font-size:13px;color:#d9c3cc;margin-top:2px;">${esc(f.name)} — ${esc(f.outfitType)}</div>
        </td></tr>
        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:6px;">Customer &amp; Contact</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Name', esc(f.name))}
            ${row('Email', esc(f.email))}
            ${row('Preferred Contact', esc(f.contact))}
            ${row('Ships to', esc(f.address))}
          </table>
        </td></tr>
        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:6px;">The Look</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Started from', esc(f.entryPath))}
            ${f.referenceUrl ? row('Reference link', `<a href="${esc(f.referenceUrl)}" style="color:#8f4a63;">${esc(f.referenceUrl)}</a>`) : ''}
            ${f.referenceTarget !== '—' ? row('Making', esc(f.referenceTarget)) : ''}
            ${f.lovedElements !== '—' ? row('Keep as shown', esc(f.lovedElements)) : ''}
            ${row('Outfit Type', esc(f.outfitType))}
            ${row('Length', esc(f.length))}
            ${row('Neckline', esc(f.neckline))}
            ${row('Sleeves', esc(f.sleeves))}
            ${row('Silhouette', esc(f.silhouette))}
            ${row('Details', esc(f.details))}
            ${row('Yarn colours', esc(f.yarns))}
          </table>
        </td></tr>
        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:6px;">Fit &amp; Timing</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Sizing Method', esc(f.sizingMethod))}
            ${row('Size', esc(f.standardSize) || '&mdash;')}
            ${row('Height', esc(f.height))}
            ${row('Measurements', esc(f.measurements))}
            ${f.measurementsLater ? row('Follow up', '<strong>Customer is sending exact measurements on chat</strong>') : ''}
            ${row('Starting Price', esc(f.startingPrice))}
            ${row('Customization Notes', esc(f.notes).replace(/\n/g, '<br>'))}
          </table>
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

/* ── YOU LOOP Creation (b2b-inquiry) ──────────────────────────────────────
   The corporate arm's project inquiries had no internal notification at all:
   this function only ever answered to custom-request, so a B2B lead landed in
   the Netlify dashboard and nowhere else unless dashboard notifications
   happened to be switched on. Same treatment as a custom request now — a card
   that can be forwarded to whoever quotes the job. */

function buildB2bFields(data) {
  return {
    company: val(data.company),
    email: val(data.email),
    name: val(data.name),
    product: val(data.product_interest),
    quantity: val(data.quantity),
    timeline: val(data.timeline),
    brief: val(data.brief),
    files: fileLinks(data.inspo),
  };
}

function buildB2bText(f) {
  return [
    'NEW PROJECT INQUIRY — YOU LOOP Creation',
    '',
    `Company: ${f.company}`,
    `Contact: ${f.name}`,
    `Email:   ${f.email}`,
    '',
    `Wants to produce: ${f.product}`,
    `Quantity:         ${f.quantity}`,
    `Timeline:         ${f.timeline}`,
    f.brief ? '' : null,
    f.brief ? `Brief: ${f.brief}` : null,
    f.files.length ? '' : null,
    f.files.length ? `Reference: ${f.files.join(', ')}` : null,
    '',
    `Reply to: ${f.email}`,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

function buildB2bHtml(f) {
  const filesBlock = f.files.length
    ? `<tr><td style="padding:0 24px 18px;">
        <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:8px;">Reference</div>
        ${f.files
          .map(
            (url) =>
              `<a href="${esc(url)}" style="font-size:13px;color:#8f4a63;word-break:break-all;">${esc(url)}</a>`,
          )
          .join('<br>')}
      </td></tr>`
    : '';

  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#f7f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f0eb;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eadde2;">
        <tr><td style="background:#2a1a2e;padding:22px 24px;">
          <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#c4708a;font-weight:700;">YOU LOOP Creation · Project inquiry</div>
          <div style="font-size:22px;color:#ffffff;margin-top:4px;font-weight:700;">${esc(f.company || 'New inquiry')}</div>
          <div style="font-size:13px;color:#d9c2cc;margin-top:2px;">${esc(f.product)}</div>
        </td></tr>

        <tr><td style="padding:20px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:6px;">Contact</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Company', esc(f.company))}
            ${row('Name', esc(f.name))}
            ${row('Email', `<a href="mailto:${esc(f.email)}" style="color:#8f4a63;">${esc(f.email)}</a>`)}
          </table>
        </td></tr>

        <tr><td style="padding:18px 24px 4px;">
          <div style="font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:#c4708a;font-weight:700;margin-bottom:6px;">The project</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${row('Produce', esc(f.product))}
            ${row('Quantity', esc(f.quantity))}
            ${row('Timeline', esc(f.timeline))}
            ${f.brief ? row('Brief', esc(f.brief)) : ''}
          </table>
        </td></tr>

        ${filesBlock}

        <tr><td style="padding:6px 24px 22px;">
          <div style="font-size:11px;color:#a3899a;">Reply straight to this email to reach ${esc(f.name || 'them')}.</div>
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

    // Two forms get an internal notification: the Create Your Look wizard and
    // YOU LOOP Creation's project inquiry. Everything else on the site is
    // recorded by Netlify Forms and ignored here.
    const formName = payload.form_name;
    if (formName !== 'custom-request' && formName !== 'b2b-inquiry') {
      return { statusCode: 200, body: `skipped (${formName} is not a notified form)` };
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('submission-created: RESEND_API_KEY is not set — skipping email notification. Submission is still saved in Netlify Forms.');
      return { statusCode: 200, body: 'no RESEND_API_KEY configured, skipped email' };
    }

    const notifyTo = process.env.NOTIFY_EMAIL || 'hello.youloop@gmail.com';
    const from = process.env.RESEND_FROM || 'YOU LOOP <onboarding@resend.dev>';

    const isB2b = formName === 'b2b-inquiry';
    const f = isB2b ? buildB2bFields(data) : buildFields(data);
    const subject = isB2b
      ? `New project inquiry — ${f.company || f.name} — ${f.product}`
      : `✨ New Custom Look — ${f.name} — ${f.outfitType}`;

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
        html: isB2b ? buildB2bHtml(f) : buildHtml(f),
        text: isB2b ? buildB2bText(f) : buildText(f),
        // Both cards tell whoever reads them to reply to reach the customer.
        // Without this the reply goes to the send-only from-address instead.
        // buildFields falls back to an em dash when there is no address, so
        // check for a real one rather than truthiness.
        ...(f.email && f.email.includes('@') ? { reply_to: f.email } : {}),
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
