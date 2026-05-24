'use client';

import { useId, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
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
  step = 0.01,
  label,
  showValue = false,
  disabled = false,
  className,
}: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  const inEdgeZone = pct <= 7 || pct >= 95;

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
            /* 0 in the middle (pure thumb color), 1 in the edge zone.
               Used to crossfade the dragging-white thumb to the tick
               gray. Binary — the motion spring handles the smoothing. */
            '--edge-mix': inEdgeZone ? '100%' : '0%',
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
        <motion.div
          className={styles.thumb}
          aria-hidden
          animate={{
            scaleY: inEdgeZone ? 0.25 : 1,
            opacity: inEdgeZone ? 0.5 : 0.75,
          }}
          transition={springSnappy}
        />
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
