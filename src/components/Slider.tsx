'use client';

import { useEffect, useId, useState } from 'react';
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

/* 10 evenly-spaced snap positions across the track. The first and last
   are hidden visually (they sit on the rounded end caps) but the value
   can still snap to them so min/max remain reachable. */
const SNAP_POSITIONS = Array.from({ length: 10 }, (_, i) => (i / 9) * 100);
const TICK_POSITIONS = SNAP_POSITIONS.slice(1, -1);

function snapToTick(value: number, min: number, max: number) {
  const ratio = (value - min) / (max - min);
  const nearest = SNAP_POSITIONS.reduce((best, p) =>
    Math.abs(p / 100 - ratio) < Math.abs(best / 100 - ratio) ? p : best,
  );
  return min + (nearest / 100) * (max - min);
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

  /* Track the raw (un-snapped) drag value locally so the fill slides
     smoothly while the user drags. Commit a snapped value to the parent
     only on release. */
  const [dragValue, setDragValue] = useState<number | null>(null);
  const displayValue = dragValue ?? value;

  // If the controlled value changes externally, drop any in-flight drag.
  useEffect(() => {
    setDragValue(null);
  }, [value]);

  const commit = () => {
    if (dragValue === null) return;
    onChange(snapToTick(dragValue, min, max));
    setDragValue(null);
  };

  const pct = ((displayValue - min) / (max - min)) * 100;

  return (
    <div className={cn(styles.field, className)}>
      {(label || showValue) && (
        <div className={styles.head}>
          {label && (
            <label htmlFor={id} className={styles.label}>
              {label}
            </label>
          )}
          {showValue && (
            <span className={styles.value}>{Math.round(displayValue)}</span>
          )}
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
        <div className={styles.ticks} aria-hidden>
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
          value={displayValue}
          disabled={disabled}
          onChange={(e) => setDragValue(Number(e.target.value))}
          onMouseUp={commit}
          onTouchEnd={commit}
          onKeyUp={commit}
          onBlur={commit}
        />
      </div>
    </div>
  );
}
