'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PhotoCarousel from './PhotoCarousel';
import YarnPicker from './YarnPicker';
import type { Measurements, ProductConfig, Swatch } from '@/data/products';
import type { Yarn } from '@/data/yarns';
import { BRAND } from '@/data/site';
import { baht } from '@/lib/format';
import {
  checkoutHref,
  isCompleteMeasurements,
  type ColourChoice,
  type SizeChoice,
} from '@/lib/order';
import s from './Configurator.module.css';

type Model = 'female' | 'male';

const EMPTY_MEASUREMENTS: Measurements = { bust: 0, waist: 0, hips: 0, height: 0 };

const MEASUREMENT_FIELDS: { key: keyof Measurements; label: string }[] = [
  { key: 'bust', label: 'Bust' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'height', label: 'Height' },
];

/**
 * The product page: pick a colour, pick a size, proceed.
 *
 * Everything past the choices — summary, promo code, customer details and the
 * submission itself — now lives on /checkout. This page's only job is to build
 * a valid order draft and hand it over.
 */
export default function Configurator({ product }: { product: ProductConfig }) {
  const allSwatches = useMemo(
    () => product.swatchGroups.flatMap((group) => group.swatches),
    [product.swatchGroups],
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [colourChoice, setColourChoice] = useState<ColourChoice>('preset');
  const [model, setModel] = useState<Model>('female');
  const [swatchIndex, setSwatchIndex] = useState(0);
  const [yarn, setYarn] = useState<Yarn | null>(null);

  const defaultSize = product.sizing?.options[0];
  const [sizeChoice, setSizeChoice] = useState<SizeChoice>('preset');
  const [sizeLabel, setSizeLabel] = useState<string | null>(defaultSize?.label ?? null);
  const [cm, setCm] = useState<Measurements>(
    (defaultSize && product.sizing?.measurements[defaultSize.label]) || EMPTY_MEASUREMENTS,
  );

  const swatch: Swatch = allSwatches[swatchIndex];

  const presetPrice = product.sizing
    ? (product.sizing.options.find((o) => o.label === sizeLabel)?.price ?? product.basePrice)
    : product.basePrice;
  // Made-to-measure is quoted from the base price and confirmed once we have
  // read the measurements, so it never silently inherits an L/XL surcharge.
  const price = sizeChoice === 'custom' ? product.basePrice : presetPrice;

  const slides = allSwatches.map((item) => ({
    src: model === 'male' && item.altPhoto ? item.altPhoto : item.photo,
    alt: `${product.name} — ${item.name}`,
  }));

  /** Picking a named colourway leaves the custom palette and drops the yarn. */
  function selectSwatch(index: number) {
    setSwatchIndex(index);
    setColourChoice('preset');
    setYarn(null);
  }

  function selectSize(label: string) {
    setSizeChoice('preset');
    setSizeLabel(label);
    const preset = product.sizing?.measurements[label];
    if (preset) setCm(preset);
  }

  /** Non-null while the draft is not yet complete enough to hand to checkout. */
  const blocker =
    colourChoice === 'custom' && !yarn
      ? 'Pick a yarn colour to continue.'
      : product.sizing && sizeChoice === 'custom' && !isCompleteMeasurements(cm)
        ? 'Fill in all four measurements to continue.'
        : null;

  const href = checkoutHref({
    productSlug: product.slug,
    colourChoice,
    swatchKey: swatch.key,
    yarnId: yarn?.id ?? null,
    sizeChoice,
    sizeLabel: product.sizing ? sizeLabel : null,
    measurements: product.sizing ? cm : null,
  });

  return (
    <div className={s.page}>
      {/* ── NAV ── */}
      <nav className={s.nav}>
        <Link href="/#collection" className={s.navBack}>
          <span className={s.navBackArrow}>&#8592;</span>
          <span>Collection</span>
        </Link>
        <Link href="/" className={s.navLogo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.logo} alt={BRAND.name} className={s.navLogoImg} />
        </Link>
        <div className={s.navRight}>
          <span
            className={s.navPill}
            style={{ background: product.navPill.background, color: product.navPill.color }}
          >
            {product.navPill.label}
          </span>
          <button
            type="button"
            className={s.hamburger}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div className={`${s.mobileNav} ${menuOpen ? s.open : ''}`}>
        <Link href="/#collection" onClick={() => setMenuOpen(false)}>
          Back to Collection
        </Link>
        <Link href="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>
        <Link href="/journal" onClick={() => setMenuOpen(false)}>
          Journal
        </Link>
        <Link href="/about" onClick={() => setMenuOpen(false)}>
          About
        </Link>
        <Link href="/#collection" className={s.mobileNavCta} onClick={() => setMenuOpen(false)}>
          Order now
        </Link>
      </div>

      {/* ── HERO BAND ──
          Was a per-product spec strip (SKU · name · moods · pieces · days).
          Every one of those facts is still on this page — the SKU in .skuRow,
          the name in the h1, the rest in .priceNote and the detail cards — so
          the band was repeating the page back at itself. It carries the brand
          line instead, the same on all three products, which is why it reads
          from BRAND rather than from product data. */}
      <div className={s.heroBand}>
        <span>{BRAND.tagline}</span>
      </div>

      <div className={s.layout}>
        {/* ── PHOTO COLUMN ── */}
        <div className={s.photoCol}>
          {product.modelToggle && (
            <div className={s.modelToggle}>
              <button
                type="button"
                className={`${s.modelBtn} ${model === 'female' ? s.active : ''}`}
                onClick={() => setModel('female')}
              >
                {product.modelToggle.female}
              </button>
              <button
                type="button"
                className={`${s.modelBtn} ${model === 'male' ? s.active : ''}`}
                onClick={() => setModel('male')}
              >
                {product.modelToggle.male}
              </button>
            </div>
          )}

          <PhotoCarousel slides={slides} index={swatchIndex} onIndexChange={setSwatchIndex}>
            <div className={s.photoOverlay}>
              <div className={s.photoColourName}>{swatch.name}</div>
              <div className={s.photoColourSub}>{swatch.sub}</div>
            </div>
          </PhotoCarousel>

          <div className={s.photoMeta}>
            <span className={s.photoMetaBadge}>{product.photoBadge}</span>
            <span className={s.photoMetaNote}>{product.photoNote}</span>
          </div>

          <div className={s.handmadeNote}>
            <strong>✦ Made by hand. Made once. Made for you.</strong>
            Every piece is made by hand in crochet. Natural stitch variations and the uniqueness of
            handmade craft are part of what makes your piece one of a kind.
          </div>
        </div>

        {/* ── CONFIG COLUMN ── */}
        <div className={s.configCol}>
          <div className={s.skuRow}>
            <span className={s.skuTag}>{product.sku}</span>
            <span className={s.collTag}>Soft Riot Collection</span>
          </div>
          <h1 className={s.title}>{product.name}</h1>
          <p className={s.tagline}>
            {product.tagline.map((line, i) => (
              <span key={line}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          <div className={s.priceRow}>
            <span className={s.price}>{baht(price)}</span>
            <span className={s.priceNote}>{product.priceNote}</span>
          </div>

          {/* 01 COLOUR — the named colourways, then one tile for the palette */}
          <span className={s.secLabel}>01 - Colour</span>
          {product.swatchGroups.map((group, groupIndex) => {
            const offset = product.swatchGroups
              .slice(0, groupIndex)
              .reduce((sum, g) => sum + g.swatches.length, 0);
            const isLastGroup = groupIndex === product.swatchGroups.length - 1;
            return (
              <div key={group.label ?? 'default'}>
                {group.label && (
                  <span
                    className={s.swatchGroupLabel}
                    style={groupIndex > 0 ? { marginTop: 8 } : undefined}
                  >
                    {group.label}
                  </span>
                )}
                <div className={s.swatches}>
                  {group.swatches.map((item, i) => {
                    const index = offset + i;
                    const active = colourChoice === 'preset' && index === swatchIndex;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        className={`${s.swatch} ${active ? s.active : ''}`}
                        onClick={() => selectSwatch(index)}
                      >
                        {/* spans, not divs: a <button> may only contain
                            phrasing content */}
                        <span
                          className={s.swatchDot}
                          style={{ background: item.dot, border: item.dotBorder }}
                        />
                        <span className={s.swatchName}>{item.name}</span>
                      </button>
                    );
                  })}

                  {/* One click straight into the 81-colour palette. */}
                  {isLastGroup && (
                    <button
                      type="button"
                      className={`${s.swatch} ${colourChoice === 'custom' ? s.active : ''}`}
                      onClick={() => setColourChoice('custom')}
                      aria-pressed={colourChoice === 'custom'}
                    >
                      <span className={`${s.swatchDot} ${s.swatchDotCustom}`} />
                      <span className={s.swatchName}>Custom</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {colourChoice === 'custom' ? (
            <YarnPicker
              defaultNote={product.yarnDefaultNote}
              selected={yarn}
              onSelect={setYarn}
            />
          ) : (
            product.showPairingHint &&
            swatch.pairing && (
              <div className={s.pairingHint}>
                <strong>&#10022; Styling tip:</strong> <span>{swatch.pairing}</span>
              </div>
            )
          )}

          {/* 02 SIZE (sets) or WAYS TO WEAR (hood) */}
          {product.sizing ? (
            <>
              <span className={s.secLabel}>02 - Size</span>

              {/* The chart doubles as the picker: the numbers are the standard
                  chart and are not editable; the last row hands over to your
                  own measurements. */}
              <div className={s.sizeTableWrap}>
                <table className={s.sizeTable}>
                  <thead>
                    <tr>
                      <th scope="col">Size</th>
                      {MEASUREMENT_FIELDS.map((field) => (
                        <th key={field.key} scope="col">
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizing.options.map((option) => {
                      const row = product.sizing?.measurements[option.label];
                      const checked = sizeChoice === 'preset' && sizeLabel === option.label;
                      return (
                        <tr
                          key={option.label}
                          className={checked ? s.active : ''}
                          onClick={() => selectSize(option.label)}
                        >
                          <th scope="row" className={s.sizeCell}>
                            <input
                              type="radio"
                              name="size"
                              className={s.sizeRadio}
                              value={option.label}
                              checked={checked}
                              onChange={() => selectSize(option.label)}
                            />
                            <span>{option.label}</span>
                            {option.upsized && (
                              <span className={s.upsizedMark} aria-hidden="true">
                                ↑
                              </span>
                            )}
                          </th>
                          {MEASUREMENT_FIELDS.map((field) => (
                            <td key={field.key}>{row ? row[field.key] : '—'}</td>
                          ))}
                        </tr>
                      );
                    })}
                    <tr
                      className={sizeChoice === 'custom' ? s.active : ''}
                      onClick={() => setSizeChoice('custom')}
                    >
                      <th scope="row" className={s.sizeCell}>
                        <input
                          type="radio"
                          name="size"
                          className={s.sizeRadio}
                          value="custom"
                          checked={sizeChoice === 'custom'}
                          onChange={() => setSizeChoice('custom')}
                        />
                        <span>Custom</span>
                      </th>
                      <td className={s.sizeCustomCell} colSpan={MEASUREMENT_FIELDS.length}>
                        Your own measurements
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className={s.sizeNote}>All measurements in cm. {product.sizing.note}</p>

              {sizeChoice === 'custom' && (
                <div className={s.cmPanel}>
                  <div className={s.cmRow}>
                    {MEASUREMENT_FIELDS.slice(0, 2).map((field) => (
                      <div key={field.key} className={s.cmField}>
                        <label htmlFor={`cm-${field.key}`}>{field.label} (cm)</label>
                        <input
                          id={`cm-${field.key}`}
                          type="number"
                          inputMode="numeric"
                          value={cm[field.key] || ''}
                          onChange={(e) => setCm({ ...cm, [field.key]: Number(e.target.value) })}
                        />
                      </div>
                    ))}
                  </div>
                  <div className={s.cmRow}>
                    {MEASUREMENT_FIELDS.slice(2).map((field) => (
                      <div key={field.key} className={s.cmField}>
                        <label htmlFor={`cm-${field.key}`}>{field.label} (cm)</label>
                        <input
                          id={`cm-${field.key}`}
                          type="number"
                          inputMode="numeric"
                          value={cm[field.key] || ''}
                          onChange={(e) => setCm({ ...cm, [field.key]: Number(e.target.value) })}
                        />
                      </div>
                    ))}
                  </div>
                  <p className={s.cmNote}>
                    Made to your measurements. Quoted from {baht(product.basePrice)} — we confirm
                    the final price with you before anything is cast on.
                  </p>
                </div>
              )}
            </>
          ) : (
            product.wearPills && (
              <>
                <span className={s.secLabel}>{product.wearPills.label}</span>
                <div className={s.wearPills}>
                  {product.wearPills.pills.map((pill) => (
                    <div key={pill} className={s.wearPill}>
                      {pill}
                    </div>
                  ))}
                </div>
              </>
            )
          )}

          {blocker ? (
            <button type="button" className={`${s.cta} ${s.ctaConfirm}`} disabled>
              Proceed
            </button>
          ) : (
            <Link href={href} className={`${s.cta} ${s.ctaConfirm}`}>
              Proceed
            </Link>
          )}
          <p className={s.proceedHint}>
            {blocker ?? 'Next: review your order and add your details.'}
          </p>

          <Link href="/#collection" className={`${s.cta} ${s.ctaSecondary}`}>
            Back to collection
          </Link>

          <div className={s.trust}>
            {product.trust.map((item) => (
              <span key={item} className={s.trustItem}>
                {item}
              </span>
            ))}
          </div>

          <div className={s.detailGrid}>
            {product.details.map((card) => (
              <div key={card.label} className={s.detailCard}>
                <div className={s.detailLabel}>{card.label}</div>
                <div className={s.detailVal}>
                  {card.lines.map((line, i) => (
                    <span key={line}>
                      {i > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className={s.footer}>
        <div className={s.footerLogo}>✦ YOU LOOP ✦</div>
        <p>Made slow. Worn long. Keep it Soft Riot.</p>
        <p style={{ marginTop: 6 }}>
          <Link href="/">youloop.co</Link>
          &nbsp;·&nbsp;
          <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer">
            @hello.youloop
          </a>
          &nbsp;·&nbsp;
          <a href="mailto:hello@youloop.co">hello@youloop.co</a>
        </p>
      </footer>
    </div>
  );
}
