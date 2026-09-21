/**
 * Netlify Forms submission helpers.
 *
 * Netlify discovers forms by parsing deployed HTML, which never sees a React
 * form. public/__forms.html declares every form instead, and every submission
 * is POSTed to that path. Any field posted here must also exist there or it is
 * dropped from the stored submission.
 */

export const NETLIFY_FORM_ENDPOINT = '/__forms.html';

/**
 * Posts multipart form data. Use this for forms with file inputs
 * (custom-request, b2b-inquiry) — Netlify stores uploads and hands the
 * submission-created function a URL per file.
 */
export async function submitFormData(formData: FormData): Promise<void> {
  const res = await fetch(NETLIFY_FORM_ENDPOINT, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Form submission failed with status ${res.status}`);
  }
}

/**
 * Posts a plain key/value payload as url-encoded data. Use this for the
 * configurator orders and any form without file uploads.
 */
export async function submitFormFields(fields: Record<string, string>): Promise<void> {
  const res = await fetch(NETLIFY_FORM_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(fields).toString(),
  });
  if (!res.ok) {
    throw new Error(`Form submission failed with status ${res.status}`);
  }
}
