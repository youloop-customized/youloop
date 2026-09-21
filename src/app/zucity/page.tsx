import type { Metadata } from 'next';
import PreorderFlow from '@/components/zucity/PreorderFlow';
import { fraunces, inter } from '@/lib/fonts';
import s from './zucity.module.css';

export const metadata: Metadata = {
  title: { absolute: 'ZUCITY × YOU LOOP — Forearm Warmer Pre-Order' },
  description:
    'Hand-crocheted ZUCITY × YOU LOOP forearm warmers, made to order. Black DK milk cotton with red cross-stitch ZUCITY lettering.',
  alternates: { canonical: '/zucity' },
};

const SPECS = [
  'One-size, fits all builds — 28cm relaxed circumference with adjustable tie-end',
  'Wrist-end grip keeps them from sliding down',
  'Black DK milk cotton, red cross-stitch ZUCITY lettering, thumb hole',
  'Standard colorway only for this pre-order round',
];

export default function ZucityPage() {
  return (
    <div className={`${s.page} ${fraunces.variable} ${inter.variable}`}>
      <div className={s.stitchRule} />

      <div className={s.wrap}>
        <header className={s.header}>
          <a className={s.backNav} href="https://youloop.co">
            ← Back to YOU LOOP
          </a>
          <div className={s.heroBlock}>
            <div className={s.eyebrow}>ZUCITY × YOU LOOP</div>
            <h1>
              Forearm Warmers
              <br />
              Pre-Order
            </h1>
            <p className={s.sub}>
              Hand-crocheted, made to order. Black DK milk cotton with red cross-stitch ZUCITY
              lettering — the piece straight from the collab.
            </p>
          </div>
        </header>

        <div className={s.photoGallery}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/zucity/zucity-model-1.png" alt="ZUCITY forearm warmers, front view" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/zucity/zucity-model-2.png" alt="ZUCITY forearm warmers, detail view" />
        </div>

        <div className={s.card}>
          <div className={s.productRow}>
            <span className={s.productName}>ZUCITY Forearm Warmers</span>
            <span className={s.price}>
              $25<span className={s.priceUnit}> / pair</span>
            </span>
          </div>
          <ul className={s.specs}>
            {SPECS.map((spec) => (
              <li key={spec}>{spec}</li>
            ))}
          </ul>
          <div className={s.note}>
            Each pair is made by hand to order — please allow production time before shipping.
            You&apos;ll get a shipping estimate once your order is confirmed.
          </div>
        </div>

        <PreorderFlow />

        <footer className={s.footer}>YOU LOOP × ZUCITY — made to order, by hand.</footer>
      </div>

      <div className={s.stitchRule} />
    </div>
  );
}
