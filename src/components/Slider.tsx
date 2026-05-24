'use client';

import { useId } from 'react';
import { cn } from '@/lib/cn';
import styles from './Slider.module.css';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  /** Show the current value next to the label. */
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

/* Visible tick positions — 11 evenly-spaced, with the first and last
   hidden since they sit on the rounded end caps, leaving 9 visible
   ticks at 10%, 20% … 90%. */
const TICK_POSITIONS = Array.from({ length: 11 }, (_, i) => (i / 10) * 100).slice(
  1,
  -1,
);

/* Thumb geometry. The SVG viewport is sized to fit the maximum bow so
   the pill can curve without clipping. */
const THUMB_WIDTH = 3;
const THUMB_HEIGHT = 30;
const THUMB_RADIUS = 2;
/* How far the pill bows at the extreme edge. Both edges bow in the
   same direction (away from the wall), making the pill into a thin
   banana whose concave side faces the cap — echoing the cap's interior
   curvature. Depth = sagitta of the 24px cap radius across the pill's
   edge-state height (22.5px after scaleY 0.75):
       sag = R - sqrt(R^2 - (h/2)^2)
           = 24 - sqrt(576 - 126.5)
           ≈ 2.8 */
const MAX_BOW = 2.8;
/* SVG box adds horizontal slack for the bow on either side. */
const SVG_PAD_X = MAX_BOW + 1;
const SVG_WIDTH = THUMB_WIDTH + SVG_PAD_X * 2;
const SVG_HEIGHT = THUMB_HEIGHT;

/* Build the pill's outline as an SVG path. `bow` is signed horizontal
   offset of the pill's vertical edges' midpoints — positive bows right,
   negative bows left. Both edges bow together so the pill keeps its
   uniform width while curving. */
function buildThumbPath(bow: number): string {
  const left = SVG_PAD_X;
  const right = SVG_PAD_X + THUMB_WIDTH;
  const top = 0;
  const bottom = THUMB_HEIGHT;
  const r = THUMB_RADIUS;
  const midY = THUMB_HEIGHT / 2;
  /* Control point Y is the vertical midpoint; control point X is
     pushed by 2× bow because a quadratic curve passes through a point
     at half the control offset. */
  const ctrlOffset = bow * 2;

  return [
    `M ${left} ${top + r}`,
    `Q ${left} ${top} ${left + r} ${top}`, // top-left corner
    `L ${right - r} ${top}`,
    `Q ${right} ${top} ${right} ${top + r}`, // top-right corner
    `Q ${right + ctrlOffset} ${midY} ${right} ${bottom - r}`, // right edge bow
    `Q ${right} ${bottom} ${right - r} ${bottom}`, // bottom-right corner
    `L ${left + r} ${bottom}`,
    `Q ${left} ${bottom} ${left} ${bottom - r}`, // bottom-left corner
    `Q ${left + ctrlOffset} ${midY} ${left} ${top + r}`, // left edge bow
    'Z',
  ].join(' ');
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  showValue = false,
  disabled = false,
  className,
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;

  /* Both edges bow in the same direction in the outer 5% bands so the
     pill's concave side faces the cap and its convex side faces away:
       pct=0   → bow positive  → both edges push right → concave-left
       pct=100 → bow negative  → both edges push left  → concave-right */
  const bow =
    pct <= 5
      ? (1 - pct / 5) * MAX_BOW
      : pct >= 95
        ? -((pct - 95) / 5) * MAX_BOW
        : 0;

  return (
    <div className={cn(styles.field, className)}>
      {(label || showValue) && (
        <div className={styles.head}>
          {label && (
            <label htmlFor={id} className={styles.label}>
              {label}
            </label>
          )}
          {showValue && <span className={styles.value}>{value}</span>}
        </div>
      )}
      <div
        className={styles.track}
        style={
          {
            '--pct': `${pct}%`,
            /* Fade thumb at the edges: 1 between 5–95%, 0.75 at 0 or 100,
               linearly interpolated in the outer 5% bands on each side. */
            '--edge-fade':
              pct <= 5
                ? 0.75 + (pct / 5) * 0.25
                : pct >= 95
                  ? 0.75 + ((100 - pct) / 5) * 0.25
                  : 1,
            /* 0 in the middle (pure thumb color), 1 at the very edge
               (fully blended toward gray). Used to crossfade the
               dragging-white thumb back to the tick gray near 0/100. */
            '--edge-mix':
              pct <= 5
                ? `${(1 - pct / 5) * 100}%`
                : pct >= 95
                  ? `${(1 - (100 - pct) / 5) * 100}%`
                  : '0%',
            /* Bump opacity to 100% in the outer 5% bands so the shorter
               edge-state pill stays clearly visible. */
            '--rest-opacity': pct <= 5 || pct >= 95 ? 1 : 0.75,
            '--active-opacity': pct <= 5 || pct >= 95 ? 1 : 1,
          } as React.CSSProperties
        }
      >
        <div className={styles.fill} />
        {/* Two layers with opposite clips: ticks over the orange fill
            render at 50% opacity, ticks over the unfilled track stay at
            100%. Both layers receive the visibility from `.track:hover`. */}
        <div
          className={cn(styles.ticks, styles.ticksOverFill)}
          aria-hidden
        >
          {TICK_POSITIONS.map((pos) => (
            <span
              key={pos}
              className={styles.tick}
              style={{ left: `${pos}%` }}
            />
          ))}
        </div>
        <div
          className={cn(styles.ticks, styles.ticksOverTrack)}
          aria-hidden
        >
          {TICK_POSITIONS.map((pos) => (
            <span
              key={pos}
              className={styles.tick}
              style={{ left: `${pos}%` }}
            />
          ))}
        </div>
        <svg
          className={styles.thumb}
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          aria-hidden
        >
          <path d={buildThumbPath(bow)} />
        </svg>
        <input
          id={id}
          type="range"
          className={styles.range}
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
