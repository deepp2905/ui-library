'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { easeOut } from '@/lib/motion';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/* Build a wavy scribble path across `width` px, centered vertically
   in `height` px. Uses cubic-bezier segments with randomized control
   points so each instance gets a slightly different doodle. */
function buildScribblePath(width: number, height: number, seed: number) {
  if (width <= 0) return '';
  const y = height / 2;
  const segments = Math.max(2, Math.round(width / 60));
  const segW = width / segments;
  /* Tiny seeded PRNG so the same seed → same scribble. */
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const parts: string[] = [`M 0 ${y}`];
  for (let i = 0; i < segments; i++) {
    const x0 = i * segW;
    const x1 = (i + 1) * segW;
    const ampUp = height * (0.15 + rand() * 0.15);
    const ampDn = height * (0.15 + rand() * 0.15);
    const c1x = x0 + segW * (0.2 + rand() * 0.15);
    const c2x = x0 + segW * (0.6 + rand() * 0.15);
    const c1y = y - ampUp;
    const c2y = y + ampDn;
    parts.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${x1} ${y}`);
  }
  return parts.join(' ');
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  className,
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  /* Measure the label so the scribble can size itself to it. */
  const labelRef = useRef<HTMLSpanElement>(null);
  const [labelSize, setLabelSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!labelRef.current) return;
    const el = labelRef.current;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setLabelSize({ width, height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* Pick a stable random seed once per Checkbox instance so the
     scribble shape doesn't reshuffle on every re-render. */
  const seed = useMemo(() => Math.floor(Math.random() * 1_000_000), []);
  const scribbleD = useMemo(
    () => buildScribblePath(labelSize.width, labelSize.height, seed),
    [labelSize.width, labelSize.height, seed],
  );

  return (
    <label
      htmlFor={inputId}
      className={cn(styles.root, disabled && styles.disabled, className)}
    >
      <span className={cn(styles.box, checked && styles.checked)}>
        <input
          id={inputId}
          type="checkbox"
          className={styles.input}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <motion.svg
          className={styles.tick}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <motion.path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={easeOut}
          />
        </motion.svg>
      </span>
      {label && (
        <span className={styles.labelWrap}>
          <span
            ref={labelRef}
            className={cn(styles.label, checked && styles.labelChecked)}
          >
            {label}
          </span>
          {labelSize.width > 0 && (
            <svg
              className={styles.scribble}
              width={labelSize.width}
              height={labelSize.height}
              viewBox={`0 0 ${labelSize.width} ${labelSize.height}`}
              fill="none"
              aria-hidden
            >
              <motion.path
                d={scribbleD}
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{
                  pathLength: checked ? 1 : 0,
                  /* Fade only after pathLength has fully retracted so
                     the residual round-cap "dot" at pathLength=0
                     vanishes cleanly. When checking, opacity flips to
                     1 instantly before the draw-in. */
                  opacity: checked ? 1 : 0,
                }}
                transition={{
                  /* Draw-in (check) is slow + deliberate; retract
                     (uncheck) is faster so the strikethrough doesn't
                     overstay its welcome. */
                  pathLength: checked
                    ? { ...easeOut, duration: 0.8 }
                    : { ...easeOut, duration: 0.2 },
                  /* Opacity: instant on check; on uncheck, wait for
                     pathLength to finish retracting, then fade in 0.1s. */
                  opacity: checked
                    ? { duration: 0 }
                    : { duration: 0.1, delay: 0.1 },
                }}
              />
            </svg>
          )}
        </span>
      )}
    </label>
  );
}
