'use client';

import { useId, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  /** Render the evenly-spaced tick guides inside the track. */
  ticks?: boolean;
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

/* Maximum stretch factor on either end (additive to scale 1).
   Rubberband formula damps overshoot so it asymptotes here. */
const MAX_STRETCH = 0.12;
/* Resistance: how many pixels of overshoot give half of MAX_STRETCH.
   Higher = stiffer rubber. */
const STRETCH_PIVOT_PX = 120;

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 0.01,
  label,
  showValue = false,
  ticks = false,
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

  /* ── Rubberband overshoot ──
     `overshoot` is signed: positive = pulled past max (right), negative
     = pulled past min (left). It's a raw motion value updated on every
     drag move; a separate spring (`overshootSpring`) follows it so the
     track stretches with a soft rebound rather than 1:1. */
  const overshoot = useMotionValue(0);
  const overshootSpring = useSpring(overshoot, {
    stiffness: 380,
    damping: 32,
    mass: 0.6,
  });
  /* Damped scale: scaleX = 1 + MAX_STRETCH · |o| / (|o| + PIVOT).
     Always ≥ 1 — the track grows; direction comes from transform-origin. */
  const trackScaleX = useTransform(overshootSpring, (o) => {
    const abs = Math.abs(o);
    return 1 + (MAX_STRETCH * abs) / (abs + STRETCH_PIVOT_PX);
  });
  /* Transform origin flips so the track stretches *away* from the
     overshoot direction (anchored at the opposite edge). */
  const trackOrigin = useTransform(overshootSpring, (o) =>
    o >= 0 ? '0% 50%' : '100% 50%',
  );

  const trackRef = useRef<HTMLDivElement>(null);

  const updateOvershoot = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    /* Use the *unstretched* width for measurement. Since scaleX is
       anchored at one edge, the opposite edge's screen position
       doesn't move — so rect.left/right reflect either the true
       width or the stretched width depending on direction. Easiest:
       divide by the current scale to get the un-stretched width. */
    const scale = trackScaleX.get();
    const baseWidth = rect.width / scale;
    if (clientX < rect.left) {
      overshoot.set(clientX - rect.left);
    } else if (clientX > rect.left + baseWidth) {
      overshoot.set(clientX - (rect.left + baseWidth));
    } else {
      overshoot.set(0);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    dragStarted.current = false;
    setAnimating(true);
    if (animTimeout.current) clearTimeout(animTimeout.current);
    updateOvershoot(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLInputElement>) => {
    if (!dragStarted.current) {
      dragStarted.current = true;
      setAnimating(false);
    }
    /* Only track overshoot while the pointer is actually held. The
       native range input still calls onChange with the clamped value. */
    if ((e.buttons & 1) === 1) {
      updateOvershoot(e.clientX);
    }
  };
  const handlePointerUp = () => {
    overshoot.set(0); // spring back
    if (!dragStarted.current) {
      // Pure click — let the transition play out before clearing.
      animTimeout.current = setTimeout(() => setAnimating(false), 220);
    }
  };
  const handlePointerCancel = () => {
    overshoot.set(0);
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
      <motion.div
        ref={trackRef}
        className={cn(styles.track, animating && styles.animating)}
        style={
          {
            '--pct': `${pct}%`,
            /* 0 in the middle (pure thumb color), 1 in the edge zone.
               Used to crossfade the dragging-white thumb to the tick
               gray. Binary — the motion spring handles the smoothing. */
            '--edge-mix': inEdgeZone ? '100%' : '0%',
            scaleX: trackScaleX,
            transformOrigin: trackOrigin,
          } as unknown as React.CSSProperties
        }
      >
        <div className={styles.fill} />
        {/* Two layers with opposite clips: ticks over the orange fill
            render at lower opacity, ticks over the unfilled track stay
            darker. Both layers receive the visibility from
            `.track:hover`. Only rendered when `ticks` prop is true. */}
        {ticks && (
          <>
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
          </>
        )}
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
          onPointerCancel={handlePointerCancel}
          onPointerLeave={handlePointerCancel}
        />
      </motion.div>
    </div>
  );
}
