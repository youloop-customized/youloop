'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import PhotoCarousel from './PhotoCarousel';
import YarnPicker from './YarnPicker';
import { PROMO_CODES, type Measurements, type ProductConfig, type Swatch } from '@/data/products';
import type { Yarn } from '@/data/yarns';
import { BRAND } from '@/data/site';
import { baht, bahtDiscount, generateOrderNumber } from '@/lib/format';
import { submitFormFields } from '@/lib/netlify';
import s from './Configurator.module.css';

type ColourMode = 'grouped' | 'custom';
type Model = 'female' | 'male';

type SubmittedOrder = {
  orderNumber: string;
  colour: string;
  yarn: string | null;
  size: string | null;
  measurements: string;
  discount: string | null;
  total: string;
  name: string;
  contact: string;
  address: string;
};

const EMPTY_MEASUREMENTS: Measurements = { bust: 0, waist: 0, hips: 0, height: 0 };

export default function Configurator({ product }: { product: ProductConfig }) {
  const allSwatches = useMemo(
    () => product.swatchGroups.flatMap((group) => group.swatches),
    [product.swatchGroups],
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<ColourMode>('grouped');
  const [model, setModel] = useState<Model>('female');
  const [swatchIndex, setSwatchIndex] = useState(0);
  const [yarn, setYarn] = useState<Yarn | null>(null);
  const defaultSize = product.sizing?.options[0];
  const [sizeLabel, setSizeLabel] = useState<string | null>(defaultSize?.label ?? null);
  const [cm, setCm] = useState<Measurements>(
    (defaultSize && product.sizing?.measurements[defaultSize.label]) || EMPTY_MEASUREMENTS,
  );
  const [moment, setMoment] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState<string | null>(null);
  const [promoMsg, setPromoMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState<SubmittedOrder | null>(null);

  const swatch: Swatch = allSwatches[swatchIndex];

  const price = product.sizing
    ? (product.sizing.options.find((o) => o.label === sizeLabel)?.price ?? product.basePrice)
    : product.basePrice;

  const discount = promo ? Math.round(price * PROMO_CODES[promo].percent) : 0;
  const total = Math.max(price - discount, 0);

  // "Customise my own" replaces the named colourway with the picked yarn.
  const colourSummary = mode === 'custom' ? 'Custom (yarn below)' : swatch.name;

  const measurementSummary =
    cm.bust && cm.waist && cm.hips && cm.height
      ? `${cm.bust} / ${cm.waist} / ${cm.hips} / ${cm.height} cm`
      : '-';

  const slides = allSwatches.map((item) => ({
    src: model === 'male' && item.altPhoto ? item.altPhoto : item.photo,
    alt: `${product.name} — ${item.name}`,
  }));

  function selectMode(next: ColourMode) {
    setMode(next);
    // Leaving the custom panel drops the yarn, the way the original did.
    if (next === 'grouped') setYarn(null);
  }

  function selectSize(label: string) {
    setSizeLabel(label);
    const preset = product.sizing?.measurements[label];
    if (preset) setCm(preset);
  }

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const found = PROMO_CODES[code];
    if (found) {
      setPromo(code);
      setPromoMsg({ text: `Code applied — ${found.label} ✓`, ok: true });
    } else {
      setPromo(null);
      setPromoMsg({ text: 'Invalid promo code', ok: false });
    }
  }

  async function submitOrder() {
    if (!name.trim() || !contact.trim() || !address.trim()) {
      alert('Please fill in all your details before submitting.');
      return;
    }

    const orderNumber = generateOrderNumber();
    const yarnLabel = yarn ? `#${yarn.id} - ${yarn.name}` : null;
    const totalLabel = baht(total);

    const payload: Record<string, string> = {
      'form-name': product.formName,
      orderNumber,
      product: product.productLabel,
      colour: colourSummary,
      yarn: yarnLabel ?? '',
      moment: moment.trim(),
      promo_code: promo ?? '',
      discount: discount ? bahtDiscount(discount) : '',
      total: totalLabel,
      name: name.trim(),
      contact: contact.trim(),
      address: address.trim(),
    };

    if (product.sizing) {
      payload.size = sizeLabel ?? '';
      payload.bust_cm = cm.bust ? String(cm.bust) : '';
      payload.waist_cm = cm.waist ? String(cm.waist) : '';
      payload.hips_cm = cm.hips ? String(cm.hips) : '';
      payload.height_cm = cm.height ? String(cm.height) : '';
    }

    setSending(true);
    setStatus('Submitting...');

    try {
      await submitFormFields(payload);
      setStatus('');
      setSubmitted({
        orderNumber,
        colour: colourSummary,
        yarn: yarnLabel,
        size: product.sizing ? sizeLabel : null,
        measurements: measurementSummary,
        discount: discount ? `${bahtDiscount(discount)} (${promo})` : null,
        total: totalLabel,
        name: name.trim(),
        contact: contact.trim(),
        address: address.trim(),
      });
    } catch {
      setStatus('');
      alert(
        'Something went wrong submitting your order. Please message us directly on Instagram @hello.youloop and we will sort it out.',
      );
    } finally {
      setSending(false);
    }
  }

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

      {/* ── HERO BAND ── */}
      <div className={s.heroBand}>
        {product.heroBand.map((item, i) => (
          <span key={item}>
            {i > 0 && <span className={s.sep}>·</span>}
            <span>{item}</span>
          </span>
        ))}
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

          {/* 01 COLOUR */}
          <span className={s.secLabel}>01 - Colour</span>
          <div className={s.colourModeToggle}>
            <button
              type="button"
              className={`${s.modeBtn} ${mode === 'grouped' ? s.active : ''}`}
              onClick={() => selectMode('grouped')}
            >
              {product.groupedModeLabel}
            </button>
            <button
              type="button"
              className={`${s.modeBtn} ${mode === 'custom' ? s.active : ''}`}
              onClick={() => selectMode('custom')}
            >
              Customise my own
            </button>
          </div>

          {mode === 'grouped' ? (
            <div>
              {product.swatchGroups.map((group, groupIndex) => {
                const offset = product.swatchGroups
                  .slice(0, groupIndex)
                  .reduce((sum, g) => sum + g.swatches.length, 0);
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
                        return (
                          <button
                            key={item.key}
                            type="button"
                            className={`${s.swatch} ${index === swatchIndex ? s.active : ''}`}
                            onClick={() => setSwatchIndex(index)}
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
                    </div>
                  </div>
                );
              })}

              {product.showPairingHint && swatch.pairing && (
                <div className={s.pairingHint}>
                  <strong>&#10022; Styling tip:</strong> <span>{swatch.pairing}</span>
                </div>
              )}
            </div>
          ) : (
            <YarnPicker
              searchPlaceholder={product.yarnSearchPlaceholder}
              defaultNote={product.yarnDefaultNote}
              selected={yarn}
              onSelect={setYarn}
            />
          )}

          {/* 02 SIZE (sets) or WAYS TO WEAR (hood) */}
          {product.sizing ? (
            <>
              <span className={s.secLabel}>02 - Size</span>
              <div className={s.sizeBtns}>
                {product.sizing.options.map((option) => (
                  <button
                    key={option.label}
                    type="button"
                    className={`${s.sizeBtn} ${sizeLabel === option.label ? s.active : ''} ${
                      option.upsized ? s.upsized : ''
                    }`}
                    onClick={() => selectSize(option.label)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className={s.sizeNote}>{product.sizing.note}</p>

              <div className={s.cmPanel}>
                <div className={s.cmRow}>
                  <div className={s.cmField}>
                    <label htmlFor="cm-bust">Bust (cm)</label>
                    <input
                      id="cm-bust"
                      type="number"
                      inputMode="numeric"
                      value={cm.bust || ''}
                      onChange={(e) => setCm({ ...cm, bust: Number(e.target.value) })}
                    />
                  </div>
                  <div className={s.cmField}>
                    <label htmlFor="cm-waist">Waist (cm)</label>
                    <input
                      id="cm-waist"
                      type="number"
                      inputMode="numeric"
                      value={cm.waist || ''}
                      onChange={(e) => setCm({ ...cm, waist: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className={s.cmRow}>
                  <div className={s.cmField}>
                    <label htmlFor="cm-hips">Hips (cm)</label>
                    <input
                      id="cm-hips"
                      type="number"
                      inputMode="numeric"
                      value={cm.hips || ''}
                      onChange={(e) => setCm({ ...cm, hips: Number(e.target.value) })}
                    />
                  </div>
                  <div className={s.cmField}>
                    <label htmlFor="cm-height">Height (cm)</label>
                    <input
                      id="cm-height"
                      type="number"
                      inputMode="numeric"
                      value={cm.height || ''}
                      onChange={(e) => setCm({ ...cm, height: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <p className={s.cmNote}>
                  Pre-filled from your size, but feel free to edit to your exact measurements.
                </p>
              </div>
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

          {/* 03 MOMENT */}
          <span className={s.secLabel}>
            03 - Your moment <span className={s.secLabelOptional}>(optional)</span>
          </span>
          <div className={s.momentSection}>
            <div className={s.momentBox}>
              <textarea
                className={s.momentTextarea}
                placeholder={product.momentPlaceholder}
                value={moment}
                onChange={(e) => setMoment(e.target.value)}
                aria-label="Tell us about your moment"
              />
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className={s.orderSummary}>
            <div className={s.orderSummaryHeader}>
              <h3>Your order summary</h3>
            </div>
            <div className={s.orderRows}>
              <div className={s.orderRow}>
                <span className={s.orderLabel}>Product</span>
                <span className={s.orderVal}>{product.name}</span>
              </div>
              <div className={s.orderRow}>
                <span className={s.orderLabel}>Colour</span>
                <span className={s.orderVal}>{colourSummary}</span>
              </div>
              {yarn && (
                <div className={s.orderRow}>
                  <span className={s.orderLabel}>Yarn</span>
                  <span className={s.orderVal}>
                    #{yarn.id} - {yarn.name}
                  </span>
                </div>
              )}
              {product.sizing && (
                <>
                  <div className={s.orderRow}>
                    <span className={s.orderLabel}>Size</span>
                    <span className={s.orderVal}>{sizeLabel}</span>
                  </div>
                  <div className={s.orderRow}>
                    <span className={s.orderLabel}>Measurements</span>
                    <span className={s.orderVal}>{measurementSummary}</span>
                  </div>
                </>
              )}
              {moment.trim() && (
                <div className={s.orderRow}>
                  <span className={s.orderLabel}>Moment</span>
                  <span className={`${s.orderVal} ${s.momentVal}`}>
                    {moment.trim().length > 45
                      ? `${moment.trim().substring(0, 45)}...`
                      : moment.trim()}
                  </span>
                </div>
              )}
              <div className={s.orderRow}>
                <span className={s.orderLabel}>Lead time</span>
                <span className={s.orderVal}>{product.leadTime}</span>
              </div>

              <div className={`${s.orderRow} ${s.promoRow}`}>
                <div className={s.promoInputWrap}>
                  <input
                    type="text"
                    className={s.promoInput}
                    placeholder="Promo code"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        applyPromo();
                      }
                    }}
                    aria-label="Promo code"
                  />
                  <button type="button" className={s.promoApply} onClick={applyPromo}>
                    Apply
                  </button>
                </div>
                {promoMsg && (
                  <div className={`${s.promoMsg} ${promoMsg.ok ? s.ok : s.err}`}>
                    {promoMsg.text}
                  </div>
                )}
              </div>

              {discount > 0 && (
                <div className={s.orderRow}>
                  <span className={s.orderLabel}>Discount</span>
                  <span className={`${s.orderVal} ${s.discountVal}`}>
                    {bahtDiscount(discount)}
                  </span>
                </div>
              )}

              <div className={`${s.orderRow} ${s.orderTotalRow}`}>
                <span className={s.orderTotalLabel}>Total</span>
                <span className={s.orderTotalVal}>{baht(total)}</span>
              </div>
            </div>
          </div>

          {/* CUSTOMER DETAILS */}
          <div className={s.detailsPanel}>
            <span className={s.detailsTitle}>Your details</span>
            <div className={s.detailsField}>
              <label className={s.detailsLabel} htmlFor="cust-name">
                Full name
              </label>
              <input
                className={s.detailsInput}
                id="cust-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={s.detailsField}>
              <label className={s.detailsLabel} htmlFor="cust-contact">
                WhatsApp / LINE ID
              </label>
              <input
                className={s.detailsInput}
                id="cust-contact"
                type="text"
                placeholder="Your WhatsApp number or LINE ID"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
              <p className={s.detailsNote}>
                We will message you updates and progress photos here.
              </p>
            </div>
            <div className={s.detailsField}>
              <label className={s.detailsLabel} htmlFor="cust-address">
                Delivery address
              </label>
              <input
                className={s.detailsInput}
                id="cust-address"
                type="text"
                placeholder="Address, district, province, postcode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <button
            type="button"
            className={`${s.cta} ${s.ctaConfirm}`}
            onClick={submitOrder}
            disabled={sending}
          >
            Submit Order
          </button>
          <p className={s.submitStatus}>{status}</p>

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

      {/* ── CONFIRMATION MODAL ── */}
      <div className={`${s.modalOverlay} ${submitted ? s.open : ''}`}>
        {submitted && (
          <div className={s.modalCard}>
            <div className={s.modalTitle}>&#10022; Order Received</div>
            <div className={s.modalSubtitle}>We&apos;ll reach out within 1 hour</div>
            <span className={s.modalOrderNum}>{submitted.orderNumber}</span>

            <div className={s.modalSummary}>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Product</span>
                <span className={s.modalRowVal}>{product.name}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Colour</span>
                <span className={s.modalRowVal}>{submitted.colour}</span>
              </div>
              {submitted.yarn && (
                <div className={s.modalRow}>
                  <span className={s.modalRowLabel}>Yarn</span>
                  <span className={s.modalRowVal}>{submitted.yarn}</span>
                </div>
              )}
              {submitted.size && (
                <>
                  <div className={s.modalRow}>
                    <span className={s.modalRowLabel}>Size</span>
                    <span className={s.modalRowVal}>{submitted.size}</span>
                  </div>
                  <div className={s.modalRow}>
                    <span className={s.modalRowLabel}>Measurements</span>
                    <span className={s.modalRowVal}>{submitted.measurements}</span>
                  </div>
                </>
              )}
              {submitted.discount && (
                <div className={s.modalRow}>
                  <span className={s.modalRowLabel}>Discount</span>
                  <span className={s.modalRowVal}>{submitted.discount}</span>
                </div>
              )}
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Total</span>
                <span className={s.modalRowVal}>{submitted.total}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Name</span>
                <span className={s.modalRowVal}>{submitted.name}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Contact</span>
                <span className={s.modalRowVal}>{submitted.contact}</span>
              </div>
              <div className={s.modalRow}>
                <span className={s.modalRowLabel}>Address</span>
                <span className={s.modalRowVal}>{submitted.address}</span>
              </div>
            </div>

            <p className={s.modalInstruction}>
              We&apos;ll reach out via WhatsApp/LINE within 1 hour to confirm details and arrange
              payment.
            </p>
            <button type="button" className={s.modalClose} onClick={() => setSubmitted(null)}>
              Done
            </button>
          </div>
        )}
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
