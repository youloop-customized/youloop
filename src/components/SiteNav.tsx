'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BRAND, NAV_LINKS, ORDER_CTA } from '@/data/site';
import s from './SiteNav.module.css';

type Props = {
  /** Key of the NAV_LINKS entry for the current page, so it renders as active. */
  active?: string;
};

export default function SiteNav({ active }: Props) {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Tapping anywhere outside the drawer closes it, matching the original
  // document-level click handler that every page shipped its own copy of.
  useEffect(() => {
    if (!open) return;

    function onDocumentClick(event: MouseEvent) {
      const target = event.target as Node;
      if (navRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener('click', onDocumentClick);
    return () => document.removeEventListener('click', onDocumentClick);
  }, [open]);

  return (
    <>
      <nav className={s.nav}>
        <Link href="/" className={s.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.logo} alt={BRAND.name} className={s.logo} />
        </Link>

        <div className={s.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className={link.key === active ? s.active : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link href={ORDER_CTA.href} className={s.cta}>
          {ORDER_CTA.label}
        </Link>

        <button
          ref={buttonRef}
          type="button"
          className={s.hamburger}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      <div ref={navRef} className={`${s.mobileNav} ${open ? s.open : ''}`}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.key}
            href={link.href}
            className={link.key === active ? s.active : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link href={ORDER_CTA.href} className={s.mobileCta} onClick={() => setOpen(false)}>
          {ORDER_CTA.label}
        </Link>
      </div>
    </>
  );
}
