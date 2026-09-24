import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import B2BInquiryForm from '@/components/forms/B2BInquiryForm';
import { inter, fraunces } from '@/lib/fonts';
import { BRAND } from '@/data/site';
import s from './b2b.module.css';

export const metadata: Metadata = {
  // Kept in step with the hero: both used to carry the old "Custom Crochet
  // Corporate Gifts" wording, which no longer appears anywhere on the page.
  title: { absolute: 'Corporate Gifting & Merchandise — YOU LOOP Creation' },
  description:
    'Premium handmade corporate gifting and merchandise. We help brands turn meaningful moments into handmade objects, crafted by artisan partners in Thailand and Myanmar.',
  alternates: { canonical: '/b2b' },
};

const CUSTOMISATION_LINE = 'Brand colors · Names · Motifs · Suitable logos';
const LEAD_TIME = 'Confirmed per project';

/* Ordered so the finished, photographed pieces lead and the concept
   mock-ups follow — a buyer scanning the grid should meet real products
   first. 'Your Idea' and the hydration loop were dropped on request. */
/* Only the finished, photographed pieces remain — the bottle holder, card
   holder and the two Coinfest concept mock-ups were dropped on request. Five
   products plus the custom-project card fill two rows of three exactly. */
const PRODUCTS = [
  {
    img: '/images/b2b/laptop-sleeve.png',
    alt: 'Custom crochet laptop sleeve in maroon and cream',
    name: 'Custom Crochet Laptop Sleeve',
    moq: '3+',
  },
  {
    img: '/images/b2b/necktie.png',
    alt: 'Handmade crochet necktie in cream with a maroon stripe',
    name: 'Custom Crochet Necktie',
    note: '— Executive gifting',
    moq: '3+',
  },
  {
    img: '/images/b2b/coaster-set.png',
    alt: 'Crochet coaster set in a branded gift box',
    name: 'Custom Crochet Coaster Set',
    note: '— Gift-boxed',
    moq: '3+',
  },
  {
    img: '/images/b2b/scarf.png',
    alt: 'Custom crochet scarf in maroon with cream and gold ends',
    name: 'Custom Crochet Scarf',
    moq: '3+',
  },
  {
    img: '/images/b2b/basket.png',
    alt: 'Custom crochet storage basket in maroon with a cream trim',
    name: 'Custom Crochet Storage Basket',
    moq: '3+',
  },
];

/**
 * Who corporate gifting is actually for, from YOU LOOP Creation's company
 * profile. Replaced two sections that listed occasions and customisation
 * options as loose icon grids: a buyer does not shop by "event merchandise",
 * they arrive knowing which of these four people they need to reach.
 *
 * The four accents are the four brand colours, one per card — the deck used
 * distinct hues to tell the columns apart and that is worth keeping, but they
 * are the palette's own now rather than borrowed ones. Each appears only as
 * the card's top rule and a 4% background wash: gold reads at 2.28:1 on white,
 * so no accent is trusted with text.
 */
const FOR_BRANDS = [
  {
    num: '01',
    title: 'VIP customers',
    tags: 'Loyalty · Anniversary · Retail',
    accent: '#d49a37',
    items: [
      'Customer rewards',
      'Travel & retail souvenirs',
      'Campaign keepsakes',
      'Anniversary gifts',
    ],
  },
  {
    num: '02',
    title: 'Partners',
    tags: 'Relationship · VIP · Events',
    accent: '#3b4a3f',
    items: [
      'Partner appreciation',
      'Launch & event gifting',
      'Relationship gifts',
      'Collaborative branded objects',
    ],
  },
  {
    num: '03',
    title: 'Executives',
    tags: 'Recognition · Milestones',
    accent: '#aa4a30',
    items: [
      'Premium handmade gifts',
      'Milestone recognition',
      'Cultural keepsakes',
      'Limited-edition pieces',
    ],
  },
  {
    num: '04',
    title: 'Teams',
    tags: 'Welcome · Appreciation · Festivals',
    accent: '#2a1e1b',
    items: ['Employee onboarding', 'Staff appreciation', 'Festival gifting', 'Event merchandise'],
  },
];

/**
 * The cue that carries one section into the next: a label plus a chevron, so
 * the page reads as a guided sequence rather than something you have to
 * remember to keep scrolling. The chevron nudges downward on loop, which is
 * the convention people already recognise for "there is more below" — and it
 * is disabled under prefers-reduced-motion in the stylesheet.
 */
function SectionNext({ href, label }: { href: string; label: string }) {
  return (
    <a className={s.sectionNext} href={href}>
      <span>{label}</span>
      <span className={s.sectionNextChevron} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </a>
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

      <div className={`${s.hero} ${s.flowSection}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {/* YOU LOOP Creation's own mark, not the Fashion star logo — see the
            comment on BRAND.creationLogo. */}
        <img className={s.heroLogo} src={BRAND.creationLogo} alt="YOU LOOP Creation" />
        {/* Non-breaking space binds "& Merchandise": without it the ampersand
            is left dangling at the end of a line at most widths. */}
        <h1>Premium Handmade Corporate Gifting &amp;&nbsp;Merchandise</h1>
        <p className={s.heroSub}>
          We help brands turn meaningful moments into handmade objects — while creating real market
          opportunities for local artisans.
        </p>
        {/* Sends people to the catalogue rather than straight to the form: a
            corporate buyer wants to see what can actually be made before
            committing to an inquiry, and the form is one scroll past it. */}
        <a className={s.ctaBtn} href="#catalogue">
          See the catalogue
        </a>
      </div>

      <div className={s.scallopBand} />
      <div className={s.scallop} />

      {/* SAMPLE PRODUCTS — the hero's "See the catalogue" lands here. */}
      <section id="catalogue" className={s.flowSection}>
        <div className={s.sectionInner}>
          <div className={s.sectionTitle}>
            <h2>What YOU LOOP Creates</h2>
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
                  {/* Every card carries the same customisation line and lead
                      time on purpose: these are product specs, and a spec
                      sheet that repeats is a spec sheet that is consistent.
                      A buyer reads one card, not the page — so leaving them
                      off the card to avoid "duplication" just meant the card
                      answered fewer of their questions. */}
                  <div className={s.pspec}>{CUSTOMISATION_LINE}</div>
                  <div className={s.productMeta}>
                    <div>
                      <span className={s.metaLabel}>MOQ</span>
                      <div className={s.productMetaVal}>{product.moq}</div>
                    </div>
                    <div>
                      <span className={s.metaLabel}>Lead time</span>
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
                <div className={s.pspec}>Ideation · Mock-ups · Prototypes · Production</div>
                <a className={`${s.ctaBtn} ${s.conceptCta}`} href="#inquiry">
                  Discuss your project
                </a>
              </div>
            </div>
          </div>

          <SectionNext href="#for-brands" label="Who it's for" />
        </div>
      </section>

      {/* FOR BRANDS — who the gifting is for, and what it looks like for each. */}
      <section id="for-brands" className={`${s.tintedSection} ${s.flowSection}`}>
        <div className={s.sectionInner}>
          <div className={s.sectionTitle}>
            <h2>Create meaningful moments for the people who matter to your brand.</h2>
            <p className={s.sectionSub}>
              Co-create something people can use, keep and remember, with a human story behind how
              it was made.
            </p>
          </div>

          <div className={s.audienceGrid}>
            {FOR_BRANDS.map((group) => (
              // The accent rides in as a custom property so one rule set covers
              // all four cards instead of four near-identical classes.
              <article
                key={group.title}
                className={s.audienceCard}
                style={{ '--accent': group.accent } as CSSProperties}
              >
                <span className={s.audienceNum}>{group.num}</span>
                <h3 className={s.audienceTitle}>{group.title}</h3>
                <span className={s.audienceTags}>{group.tags}</span>
                <ul className={s.audienceList}>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <p className={s.audienceClosing}>
            From a simple gesture of appreciation to a meaningful artisan-made gift.
          </p>

          <SectionNext href="#inquiry" label="Start your project" />
        </div>
      </section>

      {/* INQUIRY */}
      <section id="inquiry" className={`${s.tintedSection} ${s.flowSection}`}>
        <div className={s.sectionInner}>
          <div className={s.sectionTitle}>
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
            {/* A brand sign-off rather than a final pitch: the heading and the
                repeat CTA both came out, so this is the parent-brand mission
                and how to reach us, nothing else. The form is still one tap
                away from the catalogue's own "Discuss your project" card. */}
            <span className={s.eyebrow}>YOU LOOP Creation</span>
            <p>
              YOU LOOP connects modern brands and customers with skilled local artisans, turning
              craftsmanship into meaningful products and sustainable income opportunities.
            </p>
            <div className={s.closingContact}>
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer">
                @hello.youloop
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Was "YOU LOOP · Custom Crochet Corporate Gifts & Merchandise" — the
          old positioning, and it named the parent brand rather than the arm
          this page belongs to. */}
      <footer className={s.footer}>
        YOU LOOP Creation — Premium Handmade Corporate Gifting &amp; Limited-Edition Brand Creation
      </footer>
    </div>
  );
}
