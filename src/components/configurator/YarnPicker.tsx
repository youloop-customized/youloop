'use client';

import { useMemo, useState } from 'react';
import { YARNS, YARN_COUNT, type Yarn } from '@/data/yarns';
import s from './Configurator.module.css';

type Props = {
  searchPlaceholder: string;
  defaultNote: string;
  selected: Yarn | null;
  onSelect: (yarn: Yarn | null) => void;
};

/**
 * The 81-colour yarn palette. All three configurators inlined this list — with
 * every thumbnail as a base64 data URI — into their own page; it is now one
 * component reading one data module.
 */
export default function YarnPicker({
  searchPlaceholder,
  defaultNote,
  selected,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return YARNS;
    return YARNS.filter(
      (yarn) => yarn.name.toLowerCase().includes(q) || yarn.id.includes(q),
    );
  }, [query]);

  return (
    <div className={s.yarnSection}>
      <div className={s.yarnHeader}>
        <div className={s.yarnHeaderText}>
          <h3>Choose your yarn colour</h3>
        </div>
        <button
          type="button"
          className={`${s.yarnToggle} ${open ? s.open : ''}`}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close palette X' : 'Open palette'}
        </button>
      </div>

      <div className={`${s.yarnPanel} ${open ? s.open : ''}`}>
        <div className={s.yarnPanelInner}>
          <div className={s.yarnSearchWrap}>
            <span className={s.yarnSearchIcon}>&#128269;</span>
            <input
              type="text"
              className={s.yarnSearch}
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search yarn colours"
            />
          </div>

          <div className={s.yarnCount}>
            {filtered.length === YARN_COUNT
              ? `Showing all ${YARN_COUNT} yarns`
              : `Showing ${filtered.length} of ${YARN_COUNT} yarns`}
          </div>

          <div className={s.yarnGrid}>
            {filtered.map((yarn) => (
              <button
                key={yarn.id}
                type="button"
                className={`${s.yarnBall} ${selected?.id === yarn.id ? s.selected : ''}`}
                onClick={() => onSelect(yarn)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={yarn.img} alt={yarn.name} loading="lazy" />
                <span className={s.yarnBallTip}>
                  #{yarn.id}
                  <br />
                  {yarn.name}
                </span>
              </button>
            ))}
          </div>

          {selected && (
            <div className={s.yarnSelected}>
              <div className={s.yarnSelectedBall}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selected.img} alt={selected.name} />
              </div>
              <div className={s.yarnSelectedInfo}>
                <div className={s.yarnSelectedName}>{selected.name}</div>
                <div className={s.yarnSelectedCode}>Yarn #{selected.id}</div>
                <div className={s.yarnSelectedNote}>Added &#10003;</div>
              </div>
              <button
                type="button"
                className={s.yarnClear}
                onClick={() => onSelect(null)}
                aria-label="Clear selected yarn"
              >
                &#10005;
              </button>
            </div>
          )}
        </div>
      </div>

      {!selected && <p className={s.yarnDefaultNote}>{defaultNote}</p>}
    </div>
  );
}
