import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import B2BInquiryForm from '@/components/forms/B2BInquiryForm';
import { inter, fraunces } from '@/lib/fonts';
import { BRAND } from '@/data/site';
import s from './b2b.module.css';

export const metadata: Metadata = {
  title: { absolute: 'Custom Crochet Corporate Gifts — YOU LOOP' },
  description:
    'Thoughtful handmade merchandise for brands, teams, events, and communities — responsibly crafted through artisan partners in Thailand and Myanmar.',
  alternates: { canonical: '/b2b' },
};

const CUSTOMISATION_LINE = 'Brand colors · Names · Motifs · Suitable logos';
const LEAD_TIME = 'Confirmed per project';

const PRODUCTS = [
  {
    img: '/images/b2b/laptop-sleeve.png',
    alt: 'Custom crochet laptop sleeve',
    name: 'Custom Crochet Laptop Sleeve',
    moq: '3+',
  },
  {
    img: '/images/b2b/bottle-holder.png',
    alt: 'Custom crochet bottle holder',
    name: 'Custom Crochet Bottle Holder',
    moq: '3+',
  },
  {
    img: '/images/b2b/card-holder.png',
    alt: 'Custom crochet card holder',
    name: 'Custom Crochet Card Holder',
    moq: '3+',
  },
  {
    img: '/images/b2b/custom-idea.png',
    alt: 'Custom crochet product concept',
    name: 'Your Idea',
    note: '— Concept Mock-up',
    moq: 'Prototype available',
  },
  {
    img: '/images/b2b/coinfest_hydration_loop.png',
    alt: 'Custom crochet hydration loop',
    name: 'Custom crochet hydration loop',
    note: '— Concept Mock-up',
    moq: '3+',
  },
  {
    img: '/images/b2b/coinfest_identity_loops.png',
    alt: 'Custom crochet identity loop',
    name: 'Custom crochet identity loop',
    note: '— Concept Mock-up',
    moq: '3+',
  },
  {
    img: '/images/b2b/coinfest_standing_bull.png',
    alt: 'Custom crochet brand mascot',
    name: 'Custom crochet brand mascot',
    note: '— Concept Mock-up',
    moq: '3+',
  },
];

const WHY_PARTNER = [
  {
    title: 'Flexible custom development',
    body: "From ready-made products to new concepts, we bring your client's ideas to life through handmade crochet.",
  },
  {
    title: 'Flexible MOQ',
    body: 'Small runs, prototypes, and larger corporate orders are supported according to project requirements.',
  },
  {
    title: 'Prototype & sampling',
    body: 'Validate ideas before production with custom-developed samples.',
  },
  {
    title: 'Handmade craftsmanship',
    body: 'Carefully handmade products create a premium, memorable gifting experience.',
  },
  {
    title: 'Responsible sourcing',
    body: 'Support artisan craftsmanship through responsible production in Thailand and Myanmar.',
  },
  {
    title: 'Product development support',
    body: "Need something that doesn't exist yet? We'll work with you to develop it.",
  },
];

const STROKE = { fill: 'none', stroke: '#aa4a30', strokeWidth: 1.8 };

const PERFECT_FOR = [
  {
    label: 'Corporate Gifts',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <rect x="3" y="7" width="18" height="13" rx="1.5" />
        <path d="M3 11h18M8 7V5.5A1.5 1.5 0 0 1 9.5 4h5A1.5 1.5 0 0 1 16 5.5V7" />
      </svg>
    ),
  },
  {
    label: 'Marketing Campaigns',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <path d="M3 11l18-7-7 18-2-8-9-3z" />
      </svg>
    ),
  },
  {
    label: 'Employee Recognition',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <path d="M12 3l2.6 5.6 6.1.6-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.6z" />
      </svg>
    ),
  },
  {
    label: 'Event Merchandise',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <path d="M2.5 10h19" />
      </svg>
    ),
  },
  {
    label: 'Client Appreciation',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <path d="M12 21s-7.5-4.6-10-9.3C.5 8 2.3 4.8 5.6 4.3c2-.3 3.9.7 4.4 2.3.5-1.6 2.4-2.6 4.4-2.3 3.3.5 5.1 3.7 3.6 7.4C19.5 16.4 12 21 12 21z" />
      </svg>
    ),
  },
  {
    label: 'Brand Collaborations',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <circle cx="8.5" cy="12" r="5" />
        <circle cx="15.5" cy="12" r="5" />
      </svg>
    ),
  },
];

const CUSTOMISATION = [
  {
    label: 'Company Logos',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    ),
  },
  {
    label: 'Brand Colors',
    svg: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="9" cy="9" r="4" fill="#aa4a30" />
        <circle cx="15" cy="9" r="4" fill="#aa4a30" />
        <circle cx="12" cy="15" r="4" fill="#dfb6a6" />
      </svg>
    ),
  },
  {
    label: 'Employee Names',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <rect x="2.5" y="5" width="19" height="14" rx="2" />
        <path d="M6.5 9.5h4M6.5 12.5h6" />
      </svg>
    ),
  },
  {
    label: 'Event Graphics',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <path d="M4 12h13M17 8l4 4-4 4" />
      </svg>
    ),
  },
  {
    label: 'Product Dimensions',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M4 15l4-4 3 3 5-6 4 5" />
      </svg>
    ),
  },
  {
    label: 'Gift-Ready Packaging',
    svg: (
      <svg viewBox="0 0 24 24" {...STROKE}>
        <path d="M3 8h18v13H3zM3 8l3-5h12l3 5M12 8v13M8 3l-1 5M16 3l1 5" />
      </svg>
    ),
  },
];

function IconRow({ items }: { items: { label: string; svg: ReactNode }[] }) {
  return (
    <div className={s.iconRow}>
      {items.map((item) => (
        <div key={item.label} className={s.iconItem}>
          <div className={s.iconCircle}>{item.svg}</div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function B2BPage() {
  return (
    <div className={`${s.page} ${inter.variable} ${fraunces.variable}`}>
      <nav className={s.nav}>
        <Link className={s.navBack} href="/">
          &larr; Back to YOU LOOP
        </Link>
        <div className={s.navSocial}>
          <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer">
            IG @hello.youloop
          </a>
          <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
        </div>
      </nav>

      <div className={s.hero}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* YOU LOOP Creation's own mark, not the Fashion star logo — see the
            comment on BRAND.creationLogo. */}
        <img className={s.heroLogo} src={BRAND.creationLogo} alt="YOU LOOP Creation" />
        <div className={s.eyebrow} style={{ marginBottom: 16 }}>
          Responsible Handmade Merchandise Partner
        </div>
        <h1>Custom Crochet Corporate Gifts</h1>
        <p className={s.heroSub}>
          Thoughtful handmade merchandise for brands, teams, events, and communities — responsibly
          crafted through artisan partners in Thailand and Myanmar.
        </p>
        <a className={s.ctaBtn} href="#inquiry">
          Bulk Inquiry
        </a>
        <div className={s.ctaSub}>Get partner pricing, samples, and a custom quotation</div>
      </div>

      <div className={s.scallopBand} />
      <div className={s.scallop} />

      {/* SAMPLE PRODUCTS */}
      <section>
        <div className={s.sectionInner}>
          <div className={s.sectionTitle}>
            <span className={s.eyebrow}>What can You Loop make?</span>
            <h2>Sample B2B products</h2>
          </div>

          <div className={s.products}>
            {PRODUCTS.map((product) => (
              <div key={product.name} className={s.productCard}>
                <div className={s.imgWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={product.img} alt={product.alt} />
                </div>
                <div className={s.productInfo}>
                  <div className={s.pname}>
                    {product.name}
                    {product.note && <span className={s.pnameNote}> {product.note}</span>}
                  </div>
                  <div className={s.pprice}>{CUSTOMISATION_LINE}</div>
                  <div className={s.productMeta}>
                    <div>
                      <span className={s.eyebrow}>MOQ</span>
                      <div className={s.productMetaVal}>{product.moq}</div>
                    </div>
                    <div>
                      <span className={s.eyebrow}>Lead time</span>
                      <div className={s.productMetaVal}>{LEAD_TIME}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Custom project CTA card */}
            <div className={s.productCard}>
              <div className={`${s.imgWrap} ${s.conceptCard}`}>
                <div>
                  <span className={s.eyebrow}>Your concept</span>
                  <h3>What should we create next?</h3>
                  <p>
                    Share your brief, campaign theme, mascot, or product idea. We&rsquo;ll help
                    develop it into handmade crochet merchandise.
                  </p>
                </div>
              </div>
              <div className={s.productInfo}>
                <div className={s.pname}>Develop a Custom Product</div>
                <div className={s.pprice}>Ideation · Mock-ups · Prototypes · Production</div>
                <a className={`${s.ctaBtn} ${s.conceptCta}`} href="#inquiry">
                  Discuss Your Project
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY PARTNER */}
      <section className={s.tintedSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionTitle}>
            <span className={s.eyebrow}>Why partner with us</span>
            <h2>Built for teams who want more than a logo on a mug</h2>
          </div>

          <div className={s.whyGrid}>
            {WHY_PARTNER.map((item) => (
              <div key={item.title} className={s.whyItem}>
                <span className={s.eyebrow}>{item.title}</span>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERFECT FOR */}
      <section>
        <div className={s.sectionInner}>
          <div className={s.sectionTitle}>
            <span className={s.eyebrow}>Perfect for</span>
            <h2>Where our clients use us</h2>
          </div>
          <IconRow items={PERFECT_FOR} />
        </div>
      </section>

      {/* CUSTOMIZATION */}
      <section className={s.tintedSection} style={{ paddingTop: 56 }}>
        <div className={s.sectionInner}>
          <div className={s.sectionTitle}>
            <span className={s.eyebrow}>Customization</span>
            <h2>Made to feel like yours, not off the shelf</h2>
          </div>
          <IconRow items={CUSTOMISATION} />
        </div>
      </section>

      {/* INQUIRY */}
      <section id="inquiry" className={s.tintedSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionTitle}>
            <span className={s.eyebrow}>Let&apos;s talk</span>
            <h2>Tell us about your project</h2>
          </div>

          <div className={s.inquiryFormWrap}>
            <B2BInquiryForm />
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section>
        <div className={s.sectionInner}>
          <div className={s.closing}>
            <span className={s.eyebrow}>
              Let&apos;s create something your clients can&apos;t buy off the shelf
            </span>
            <h2>
              List our ready-to-customize crochet products in your catalogue, or bring us your
              client&apos;s next idea.
            </h2>
            <p>
              We&apos;ll help turn it into handmade merchandise — samples, partner pricing,
              prototype development, custom quotations, and product consultation, all included.
            </p>
            <a className={s.ctaBtn} href="#inquiry">
              Bulk Inquiry
            </a>
            <div className={s.closingContact}>
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer">
                @hello.youloop
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        YOU LOOP · Custom Crochet Corporate Gifts &amp; Merchandise
      </footer>
    </div>
  );
}
