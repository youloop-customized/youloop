'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BLOG_CATEGORIES, BLOG_POSTS, type BlogPost } from '@/data/blog';
import { BRAND } from '@/data/site';
import s from '@/app/journal/journal.module.css';

const BASE_PATH = '/journal';

/** Keeps <link rel="canonical"> pointing at whatever is actually on screen. */
function setCanonical(path: string) {
  const link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (link) link.href = `${BRAND.siteUrl}${path}`;
}

export default function JournalBoard() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string>('all');
  const [openPost, setOpenPost] = useState<BlogPost | null>(null);

  const openArticle = useCallback((post: BlogPost, pushHistory = true) => {
    setOpenPost(post);
    document.body.style.overflow = 'hidden';
    setCanonical(`${BASE_PATH}?post=${post.slug}`);
    if (pushHistory) {
      window.history.pushState({ post: post.slug }, '', `${BASE_PATH}?post=${post.slug}`);
    }
  }, []);

  const closeArticle = useCallback((pushHistory = true) => {
    setOpenPost(null);
    document.body.style.overflow = '';
    setCanonical(BASE_PATH);
    if (pushHistory) {
      window.history.pushState({}, '', BASE_PATH);
    }
  }, []);

  // Deep link: /journal?post=slug opens straight into that article, the same way
  // youloop_blog.html?post=slug used to.
  useEffect(() => {
    const slug = searchParams.get('post');
    if (!slug) return;
    const match = BLOG_POSTS.find((post) => post.slug === slug);
    if (match) openArticle(match, false);
    // Only on the initial query — later opens are driven by clicks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onPopState(event: PopStateEvent) {
      const slug = (event.state as { post?: string } | null)?.post;
      const match = slug ? BLOG_POSTS.find((post) => post.slug === slug) : undefined;
      if (match) openArticle(match, false);
      else closeArticle(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') closeArticle();
    }

    window.addEventListener('popstate', onPopState);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('popstate', onPopState);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [openArticle, closeArticle]);

  // Leaving the page with the overlay open must not strand body scroll lock.
  useEffect(() => () => {
    document.body.style.overflow = '';
  }, []);

  const posts =
    category === 'all' ? BLOG_POSTS : BLOG_POSTS.filter((post) => post.category === category);

  return (
    <>
      <div className={s.hero}>
        <div className={s.heroEyebrow}>The YOU LOOP Journal</div>
        <h1 className={s.heroTitle}>
          Wear what you mean.
          <br />
          <em>Read what you feel.</em>
        </h1>
        <p className={s.heroSub}>
          Fashion philosophy, main character moments, sustainable living, and the Soft Riot energy
          behind it all.
        </p>

        <div className={s.heroCats}>
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`${s.catPill} ${category === cat ? s.active : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className={s.grid}>
        {posts.map((post) => (
          // A div rather than a <button>: the card's content is block-level, so
          // nesting it in a button would be invalid. role + key handling give it
          // the keyboard behaviour the original card never had.
          <div
            key={post.id}
            role="button"
            tabIndex={0}
            className={s.card}
            onClick={() => openArticle(post)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openArticle(post);
              }
            }}
          >
            <div className={s.cardImg} style={{ background: post.bgColor }}>
              <span className={s.cardCat} style={{ background: post.tagColor }}>
                {post.category}
              </span>
              <span className={s.cardRead}>{post.readTime}</span>
              <span className={s.cardEmoji}>{post.emoji}</span>
            </div>
            <div className={s.cardBody}>
              <div className={s.cardSeo}>
                {post.seo.map((tag) => (
                  <span key={tag} className={s.seoTag}>
                    #{tag.replace(/ /g, '')}
                  </span>
                ))}
              </div>
              <div className={s.cardTitle}>{post.title}</div>
              <div className={s.cardSub}>{post.subtitle}</div>
              <div className={s.cardFooter}>
                <span className={s.cardDate}>YOU LOOP Journal · 2026</span>
                <span className={s.cardArrow}>→</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={`${s.articleOverlay} ${openPost ? s.open : ''}`}>
        {openPost && (
          <div className={s.articleInner}>
            <button type="button" className={s.articleBack} onClick={() => closeArticle()}>
              ← Back to Journal
            </button>
            <div className={s.articleCat} style={{ background: openPost.tagColor }}>
              {openPost.category}
            </div>
            <h1 className={s.articleTitle}>{openPost.title}</h1>
            <p className={s.articleSubtitle}>{openPost.subtitle}</p>
            <div className={s.articleMeta}>
              <span>{openPost.readTime}</span>
              <div className={s.dot} />
              <span>YOU LOOP Journal</span>
              <div className={s.dot} />
              <span>youloop.co</span>
            </div>

            {/* Article bodies are hand-authored HTML shipped with the site, not
                user input — the original page injected them the same way. */}
            <div
              className={s.articleBody}
              dangerouslySetInnerHTML={{ __html: openPost.body }}
            />

            <div className={s.reelBox}>
              <div className={s.reelBoxLabel}>📱 Short reel version</div>
              <p>{openPost.reelHook}</p>
              <p className={s.reelBoxCta}>{openPost.reelCta}</p>
            </div>

            <div className={s.articleCta}>
              <h3>Made for your moment.</h3>
              <p>Custom crochet, made to order, delivered to your door in 10–14 days.</p>
              <Link href="/#collection">Shop the collection →</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
