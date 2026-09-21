import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import BulkInquiryForm from '@/components/forms/BulkInquiryForm';
import s from './bulk.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Bulk & Partnership Inquiries — YOU LOOP' },
  description:
    'YOU LOOP bulk and brand partnership inquiries — custom crochet production for teams, brands, and businesses.',
  alternates: { canonical: '/bulk-inquiry' },
};

export default function BulkInquiryPage() {
  return (
    <div>
      <SiteNav />

      <div className={s.pageWrap}>
        <div className={s.eyebrow}>For brands &amp; teams</div>
        <h1 className={s.title}>
          Ordering for <em>more than one?</em>
        </h1>
        <p className={s.sub}>
          Whether it&apos;s branded merch, a team order, or a custom production run — tell us what
          you need and we&apos;ll follow up with a quote and timeline.
        </p>

        <div className={s.formWrap}>
          <BulkInquiryForm />
        </div>

        <p className={s.note}>
          We&apos;ll get back to you within 24 hours. For anything urgent, reach us directly on{' '}
          <a href="https://line.me/ti/p/~imaqt80085" target="_blank" rel="noopener noreferrer">
            LINE
          </a>
          .
        </p>
      </div>

      <SiteFooter showSocial={false} />
    </div>
  );
}
