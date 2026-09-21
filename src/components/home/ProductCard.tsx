'use client';

import { useCallback, useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { CollectionCard } from '@/data/collection';
import s from '@/app/home.module.css';

/**
 * One product card on the home page, with its own auto-rotating colourway
 * carousel. The original built all three of these imperatively from a shared
 * CAROUSELS object and a pile of getElementById calls.
 */
export default function ProductCard({ card }: { card: CollectionCard }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const count = card.slides.length;

  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), card.rotateMs);
    return () => clearInterval(timer);
  }, [card.rotateMs, count]);

  // The whole card is clickable, so the carousel controls have to stop the
  // click from bubbling up into the navigation.
  function control(event: ReactMouseEvent, action: () => void) {
    event.stopPropagation();
    event.preventDefault();
    action();
  }

  return (
    <div className={s.productCard} onClick={() => router.push(card.href)}>
      <div className={s.carouselWrap}>
        <div
          className={s.carouselTrack}
          style={{ transform: `translateX(${-index * 100}%)` }}
        >
          {card.slides.map((slide) => (
            <div key={slide.img} className={s.carouselSlide}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.img} alt={`${card.name} — ${slide.label}`} loading="lazy" />
            </div>
          ))}
        </div>

        <span
          className={s.carouselBadge}
          style={{ background: card.badge.background, color: card.badge.color }}
        >
          {card.badge.label}
        </span>

        <button
          type="button"
          className={s.carouselPrev}
          onClick={(e) => control(e, () => goTo(index - 1))}
          aria-label="Previous colourway"
        >
          &#8592;
        </button>
        <button
          type="button"
          className={s.carouselNext}
          onClick={(e) => control(e, () => goTo(index + 1))}
          aria-label="Next colourway"
        >
          &#8594;
        </button>

        <div className={s.carouselDots}>
          {card.slides.map((slide, i) => (
            <button
              key={slide.img}
              type="button"
              className={s.carouselDot}
              style={{ background: i === index ? slide.dot : 'rgba(170,74,48,0.35)' }}
              onClick={(e) => control(e, () => goTo(i))}
              aria-label={`View ${slide.label}`}
            />
          ))}
        </div>
      </div>

      <div className={s.productBody}>
        <div className={s.productCode}>{card.code}</div>
        <div className={s.productName}>{card.name}</div>
        <div className={s.productDesc}>{card.description}</div>

        <div className={s.productIncludes}>
          {card.tags.map((tag) => (
            <span key={tag} className={s.productTag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={s.productFooter}>
          <div className={s.productPrice}>
            {card.price} <span>{card.currency}</span>
          </div>
          {/* A real link so the configurator pages stay crawlable. */}
          <Link href={card.href} className={s.btnOrder} onClick={(e) => e.stopPropagation()}>
            Customise ✦
          </Link>
        </div>
      </div>
    </div>
  );
}
