'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import s from './Configurator.module.css';

type Props = {
  slides: { src: string; alt: string }[];
  index: number;
  onIndexChange: (index: number) => void;
  /** The colour-name overlay, which the original rendered inside .photo-wrap. */
  children?: ReactNode;
};

/**
 * Instagram-style swipeable photo carousel: pointer drag with a 16% threshold,
 * arrows and dots. Kept as a controlled component so the swatch grid and the
 * photos stay in sync in both directions.
 */
export default function PhotoCarousel({ slides, index, onIndexChange, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ startX: number; deltaX: number } | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function measure() {
      setWidth(wrapRef.current?.getBoundingClientRect().width ?? 0);
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const goTo = useCallback(
    (next: number) => onIndexChange(Math.max(0, Math.min(slides.length - 1, next))),
    [onIndexChange, slides.length],
  );

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    setWidth(wrapRef.current?.getBoundingClientRect().width ?? 0);
    setDrag({ startX: event.clientX, deltaX: 0 });
    try {
      wrapRef.current?.setPointerCapture(event.pointerId);
    } catch {
      /* setPointerCapture can throw if the pointer is already gone */
    }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag) return;
    setDrag({ ...drag, deltaX: event.clientX - drag.startX });
  }

  function endDrag() {
    if (!drag) return;
    if (width > 0 && Math.abs(drag.deltaX) > width * 0.16) {
      goTo(index + (drag.deltaX < 0 ? 1 : -1));
    }
    setDrag(null);
  }

  const offset = -index * width + (drag?.deltaX ?? 0);

  return (
    <div
      ref={wrapRef}
      className={s.photoWrap}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerLeave={endDrag}
    >
      <div
        className={s.photoTrack}
        style={{
          transform: `translateX(${offset}px)`,
          transition: drag ? 'none' : 'transform .32s cubic-bezier(.2,.7,.3,1)',
        }}
      >
        {slides.map((slide) => (
          <div key={slide.src} className={s.photoSlide}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.src} alt={slide.alt} draggable={false} />
          </div>
        ))}
      </div>

      <button
        type="button"
        className={`${s.photoNavBtn} ${s.photoPrev}`}
        onClick={() => goTo(index - 1)}
        aria-label="Previous colour"
      >
        &#8592;
      </button>
      <button
        type="button"
        className={`${s.photoNavBtn} ${s.photoNext}`}
        onClick={() => goTo(index + 1)}
        aria-label="Next colour"
      >
        &#8594;
      </button>

      {children}

      <div className={s.photoDots}>
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            className={`${s.photoDot} ${i === index ? s.active : ''}`}
            onClick={() => goTo(i)}
            aria-label={`View colour ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
