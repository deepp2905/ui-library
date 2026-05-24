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

/* Visible tick positions — 10 evenly-spaced, with the first and last
   hidden since they sit on the rounded end caps. */
const TICK_POSITIONS = Array.from({ length: 10 }, (_, i) => (i / 9) * 100).slice(
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
            /* Fade thumb at the edges: 1 between 10–90%, 0.5 at 0 or 100,
               linearly interpolated in the outer 10% bands on each side. */
            '--edge-fade':
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
        />
      </div>
    </div>
  );
}
