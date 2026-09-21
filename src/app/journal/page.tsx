import { Suspense } from 'react';
import type { Metadata } from 'next';
import SiteNav from '@/components/SiteNav';
import SiteFooter from '@/components/SiteFooter';
import JournalBoard from '@/components/journal/JournalBoard';
import s from './journal.module.css';

export const metadata: Metadata = {
  title: { absolute: 'YOU LOOP Blog — Soft Riot · Slow Fashion · Main Character Energy' },
  description:
    'YOU LOOP Blog — sustainable fashion 2026, crochet trends, main character energy outfit ideas, slow fashion stories and handmade fashion from Thailand.',
  keywords: [
    'sustainable fashion 2026',
    'crochet fashion Thailand 2026',
    'slow fashion movement',
    'handmade crochet dress',
    'main character energy outfit',
    'custom birthday outfit women',
    'made to order crochet set',
    'crochet co-ord set',
    'intentional fashion',
  ],
  alternates: { canonical: '/journal' },
};

export default function JournalPage() {
  return (
    <div>
      <SiteNav active="journal" />

      {/* useSearchParams needs a Suspense boundary to keep the shell static. */}
      <Suspense fallback={null}>
        <JournalBoard />
      </Suspense>

      <div className={s.reelBanner}>
        <div className={s.reelInner}>
          <div className={s.reelText}>
            <h3>Watch our reels 🎬</h3>
            <p>
              Short, sharp takes on fashion, sustainability, and main character energy — follow us
              for the 30-second version of every idea on this blog.
            </p>
          </div>
          <div className={s.reelLinks}>
            <a
              href="https://www.tiktok.com/@youloopcrochet"
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.reelBtn} ${s.primary}`}
            >
              TikTok @youloopcrochet
            </a>
            <a
              href="https://www.instagram.com/hello.youloop/"
              target="_blank"
              rel="noopener noreferrer"
              className={s.reelBtn}
            >
              Instagram @hello.youloop
            </a>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
