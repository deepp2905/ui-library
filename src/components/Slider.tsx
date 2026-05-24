'use client';

import { useId, useRef, useState } from 'react';
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

  /* Brief ease-in when the user clicks the track without dragging.
     `animating` is set true on pointerdown and cleared on the first
     pointermove (so dragging stays 1:1) or after the transition
     completes following pointerup. */
  const [animating, setAnimating] = useState(false);
  const dragStarted = useRef(false);
  const animTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = () => {
    dragStarted.current = false;
    setAnimating(true);
    if (animTimeout.current) clearTimeout(animTimeout.current);
  };
  const handlePointerMove = () => {
    if (!dragStarted.current) {
      dragStarted.current = true;
      setAnimating(false);
    }
  };
  const handlePointerUp = () => {
    if (!dragStarted.current) {
      // Pure click — let the transition play out before clearing.
      animTimeout.current = setTimeout(() => setAnimating(false), 220);
    }
  };

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
        className={cn(styles.track, animating && styles.animating)}
        style={
          {
            '--pct': `${pct}%`,
            /* Fade thumb height at the edges: full size between 10–90%,
               25% at 0 or 100, linearly interpolated in the outer 10%
               bands on each side. */
            '--edge-fade':
              pct <= 10
                ? 0.25 + (pct / 10) * 0.75
                : pct >= 90
                  ? 0.25 + ((100 - pct) / 10) * 0.75
                  : 1,
            /* Padding from the fill edge: 6px in the middle, expanding
               to 8px at the extremes so the shrunk pill sits further
               from the rounded cap. */
            '--edge-pad':
              pct <= 10
                ? `${8 - (pct / 10) * 2}px`
                : pct >= 90
                  ? `${8 - ((100 - pct) / 10) * 2}px`
                  : '6px',
            /* 0 in the middle (pure thumb color), 1 at the very edge
               (fully blended toward gray). Used to crossfade the
               dragging-white thumb back to the tick gray near 0/100. */
            '--edge-mix':
              pct <= 10
                ? `${(1 - pct / 10) * 100}%`
                : pct >= 90
                  ? `${(1 - (100 - pct) / 10) * 100}%`
                  : '0%',
            /* Fade opacity to 50% in the outer 10% bands so the shrunk
               pill quietly recedes near the edges. */
            '--rest-opacity':
              pct <= 10
                ? 0.5 + (pct / 10) * 0.25
                : pct >= 90
                  ? 0.5 + ((100 - pct) / 10) * 0.25
                  : 0.75,
            '--active-opacity':
              pct <= 10
                ? 0.5 + (pct / 10) * 0.5
                : pct >= 90
                  ? 0.5 + ((100 - pct) / 10) * 0.5
                  : 1,
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
        <div className={styles.thumb} aria-hidden />
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  );
}
