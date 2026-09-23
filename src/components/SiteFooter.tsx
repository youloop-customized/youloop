import Link from 'next/link';
import { BRAND, SOCIAL_LINKS } from '@/data/site';
import s from './SiteFooter.module.css';

/**
 * The site footer.
 *
 * It used to take a `showSocial` prop, for the one page that wanted a cut-down
 * footer with no social row: /bulk-inquiry. That page is retired — YOU LOOP
 * Creation's /b2b carries the single project-inquiry form now — and no other
 * caller ever passed it, so the prop and its branch went with the page.
 */
export default function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.brand}>{BRAND.name}</div>
      <div className={s.tagline}>{BRAND.tagline}</div>

      <div className={s.links}>
        {SOCIAL_LINKS.map((link) => (
          <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
            {link.label}
          </a>
        ))}
        <Link href="/">youloop.co</Link>
      </div>
      <div className={s.copyright}>{BRAND.copyright}</div>
    </footer>
  );
}
