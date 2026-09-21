import Link from 'next/link';
import { BRAND, SOCIAL_LINKS } from '@/data/site';
import s from './SiteFooter.module.css';

type Props = {
  /**
   * The bulk-inquiry page shipped a cut-down footer with no social row.
   * Everything else gets the full one.
   */
  showSocial?: boolean;
};

export default function SiteFooter({ showSocial = true }: Props) {
  return (
    <footer className={s.footer}>
      <div className={s.brand}>{BRAND.name}</div>
      <div className={s.tagline}>{BRAND.tagline}</div>

      {showSocial && (
        <>
          <div className={s.links}>
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
            <Link href="/">youloop.co</Link>
          </div>
          <div className={s.copyright}>{BRAND.copyright}</div>
        </>
      )}
    </footer>
  );
}
