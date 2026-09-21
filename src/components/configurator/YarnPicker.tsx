'use client';

import { YARNS, type Yarn } from '@/data/yarns';
import s from './Configurator.module.css';

type Props = {
  defaultNote: string;
  selected: Yarn | null;
  onSelect: (yarn: Yarn | null) => void;
};

/**
 * The yarn palette. All three configurators inlined this list — with every
 * thumbnail as a base64 data URI — into their own page; it is now one
 * component reading one data module (src/data/yarns.ts).
 *
 * The palette has no controls of its own — no search, no count, no open/close.
 * The colour section mounts it when "Custom" is picked and unmounts it when a
 * named colourway is picked, so the whole grid is simply on screen or not.
 */
export default function YarnPicker({ defaultNote, selected, onSelect }: Props) {
  return (
    <div className={s.yarnSection}>
      <div className={s.yarnHeader}>
        <div className={s.yarnHeaderText}>
          <h3>Choose your yarn colour</h3>
        </div>
      </div>

      <div className={s.yarnPanel}>
        <div className={s.yarnPanelInner}>
          <div className={s.yarnGrid}>
            {YARNS.map((yarn) => (
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
