import { notFound } from 'next/navigation';
import { EMAIL_SAMPLES } from '@/lib/email-samples';

/**
 * A local index of every email the site sends, each rendered in place.
 * Development only — notFound() keeps it off the deployed site.
 *
 * Open http://localhost:3000/dev/emails
 */
export default function EmailGallery() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main
      style={{
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        background: '#f4f1ec',
        minHeight: '100vh',
        padding: '32px 20px 64px',
        color: '#2a1e1b',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>Email templates</h1>
        <p style={{ fontSize: 13.5, color: '#6b5f5a', margin: '0 0 4px', lineHeight: 1.6 }}>
          Every email the site can send, with sample data. Nothing here sends anything.
        </p>
        <p style={{ fontSize: 12.5, color: '#8a7f79', margin: '0 0 28px', lineHeight: 1.6 }}>
          Image URLs are rewritten to this origin so the pictures show. Use{' '}
          <strong>as recipients see it</strong> to view the real absolute URLs — those 404 until
          the site is deployed, which is exactly what a customer would get today.
        </p>

        {EMAIL_SAMPLES.map((sample) => {
          const base = `/api/dev/email-preview?t=${sample.key}`;
          return (
            <section key={sample.key} style={{ marginBottom: 40 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  flexWrap: 'wrap',
                  marginBottom: 8,
                }}
              >
                <h2 style={{ fontSize: 16, margin: 0 }}>{sample.label}</h2>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 999,
                    color: sample.audience === 'Customer' ? '#3b4a3f' : '#aa4a30',
                    background: sample.audience === 'Customer' ? '#e6ebe6' : '#f6e7e1',
                  }}
                >
                  {sample.audience}
                </span>
                <span style={{ fontSize: 12.5, color: '#8a7f79' }}>{sample.when}</span>
              </div>

              <div style={{ display: 'flex', gap: 14, marginBottom: 8, fontSize: 12.5 }}>
                <a href={base} target="_blank" rel="noreferrer" style={{ color: '#aa4a30' }}>
                  Open full size
                </a>
                <a
                  href={`${base}&as=text`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#aa4a30' }}
                >
                  Plain-text version
                </a>
                <a
                  href={`${base}&live=1`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#aa4a30' }}
                >
                  As recipients see it
                </a>
              </div>

              <iframe
                src={base}
                title={sample.label}
                style={{
                  width: '100%',
                  height: 760,
                  border: '1px solid #ddd3cc',
                  borderRadius: 10,
                  background: '#fff',
                }}
              />
            </section>
          );
        })}
      </div>
    </main>
  );
}
