import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import ProductCard from '@/components/home/ProductCard';
import CustomRequestForm from '@/components/home/CustomRequestForm';
import { COLLECTION_CARDS, HOW_IT_WORKS, MANIFESTO_PILLS } from '@/data/collection';
import { BRAND } from '@/data/site';
import s from './home.module.css';

export const metadata = {
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <div className={s.page}>
      <SiteNav />

      {/* HERO */}
      <section className={s.hero}>
        <div className={s.heroLogo}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BRAND.logo} alt={BRAND.name} />
        </div>
        <div className={s.heroTag}>Keep it Soft Riot.</div>
        <h1>
          Your main character
          <br />
          <em>era starts here.</em>
        </h1>
        <p className={s.heroSub}>Custom fashion for your most intentional moment.</p>
        <div className={s.heroBtns}>
          <Link href="#collection" className={s.btnPrimary}>
            Shop the collection
          </Link>
          <Link href="#how" className={s.btnOutline}>
            How it works
          </Link>
        </div>
        <div className={s.heroScroll}>Scroll</div>
      </section>

      {/* HOW IT WORKS */}
      <section className={s.how} id="how">
        <div className={s.sectionTag}>So here&apos;s You Loop.</div>
        <h2 className={s.sectionTitle}>
          Made for you.
          <br />
          Made once.
        </h2>
        <p className={s.sectionSub}>
          Every YOU LOOP piece starts with your intention and ends in your hands — made by a skilled
          woman artisan, never a factory.
        </p>
        <div className={s.steps}>
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.title} className={s.step}>
              <div className={s.stepNum}>{i + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COLLECTION */}
      <section id="collection" className={s.collection}>
        <div className={s.sectionTag}>The collection</div>
        <h2 className={s.sectionTitle}>SR Series — Launch Edition</h2>
        <p className={s.sectionSub}>
          Three designs. Four moods. Made to order — nothing exists until you ask for it.
        </p>

        <div className={s.productsGrid}>
          {COLLECTION_CARDS.map((card) => (
            <ProductCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* CUSTOM REQUEST */}
      <section id="custom-request" className={s.customRequest}>
        <div className={s.customRequestInner}>
          <div className={s.sectionTag}>Something else in mind?</div>
          <h2 className={s.sectionTitle} style={{ marginBottom: '0.6rem' }}>
            Create Your Look ✨
          </h2>
          <p className={s.sectionSub} style={{ marginBottom: '2rem' }}>
            Share your idea and we&apos;ll help make it yours.
          </p>

          <div className={s.customRequestCard}>
            <CustomRequestForm />
          </div>

          <p className={s.bulkNote}>
            Ordering for your brand or team?{' '}
            <Link href="/bulk-inquiry">Bulk &amp; partnership inquiries →</Link>
          </p>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className={s.manifesto} id="about">
        <p className={s.manifestoText}>
          Fast fashion fills wardrobes.
          <br />
          <em>Custom fashion fills moments.</em>
        </p>
        <div className={s.manifestoPills}>
          {MANIFESTO_PILLS.map((pill, i) => (
            <span key={`${pill}-${i}`} className={s.pill}>
              {pill}
            </span>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
