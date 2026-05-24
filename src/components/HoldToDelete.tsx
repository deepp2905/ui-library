'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/cn';
import styles from './HoldToDelete.module.css';

export interface HoldToDeleteProps {
  /** Label shown inside the button. */
  children?: React.ReactNode;
  /** Fires once the hold completes (after the 3s fill). */
  onConfirm?: () => void;
  /** Hold duration in milliseconds. Defaults to 3000. */
  holdMs?: number;
  className?: string;
}

const SHRINK_MS = 400; // collapse to a 4×4 dot
const FADE_MS = 3000; // dot fades out
const RETURN_DELAY_MS = 0; // wait at invisible before reappearing
const REAPPEAR_DOT_MS = 300; // back to visible 4×4 dot
const EXPAND_MS = 600; // expand to full button

export function HoldToDelete({
  children = 'Hold to delete',
  onConfirm,
  holdMs = 3000,
  className,
}: HoldToDeleteProps) {
  /* Hold progress 0..1, driven by raf while the button is held. */
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const controls = useAnimationControls();

  const stopRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const tick = useCallback(
    (now: number) => {
      if (holdStartRef.current === null) return;
      // Forward progress while held.
      const elapsed = now - holdStartRef.current;
      const next = Math.min(1, elapsed / holdMs);
      progressRef.current = next;
      setProgress(next);
      if (next >= 1) {
        completedRef.current = true;
        stopRaf();
        runDeleteSequence();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [holdMs],
  );

  const reverseTick = useCallback((now: number) => {
    // Reverse progress toward 0 at a steady rate (faster than fill).
    if (progressRef.current <= 0) {
      stopRaf();
      return;
    }
    if (holdStartRef.current === null) {
      // Compute decrement based on real elapsed time so reverse speed
      // is framerate-independent (~400ms full reverse).
      holdStartRef.current = now;
      rafRef.current = requestAnimationFrame(reverseTick);
      return;
    }
    const dt = now - holdStartRef.current;
    holdStartRef.current = now;
    const next = Math.max(0, progressRef.current - dt / 400);
    progressRef.current = next;
    setProgress(next);
    rafRef.current = requestAnimationFrame(reverseTick);
  }, []);

  const runDeleteSequence = useCallback(async () => {
    onConfirm?.();
    // 1. Shrink to 4×4 dot while fading toward invisible.
    await controls.start({
      width: 4,
      height: 4,
      borderRadius: 2,
      opacity: 0,
      transition: { duration: SHRINK_MS / 1000, ease: [0.22, 1, 0.36, 1] },
    });
    // 2. Hold at invisible for the fade duration (button is gone visually).
    await new Promise((r) =>
      setTimeout(r, Math.max(0, FADE_MS - SHRINK_MS + RETURN_DELAY_MS)),
    );
    // 3. Reappear as a 4×4 dot.
    await controls.start({
      opacity: 1,
      transition: { duration: REAPPEAR_DOT_MS / 1000, ease: 'easeOut' },
    });
    // 4. Expand back to the full button.
    await controls.start({
      width: 'auto',
      height: 60,
      borderRadius: 12,
      transition: { duration: EXPAND_MS / 1000, ease: [0.22, 1, 0.36, 1] },
    });
    // Reset state so the user can hold again.
    completedRef.current = false;
    progressRef.current = 0;
    setProgress(0);
  }, [controls, onConfirm]);

  const startHold = () => {
    if (completedRef.current) return;
    stopRaf();
    holdStartRef.current = performance.now() - progressRef.current * holdMs;
    rafRef.current = requestAnimationFrame(tick);
  };

  const releaseHold = () => {
    if (completedRef.current) return;
    stopRaf();
    holdStartRef.current = null;
    if (progressRef.current > 0) {
      rafRef.current = requestAnimationFrame(reverseTick);
    }
  };

  useEffect(() => () => stopRaf(), []);

  return (
    <motion.button
      type="button"
      className={cn(styles.root, className)}
      onPointerDown={startHold}
      onPointerUp={releaseHold}
      onPointerLeave={releaseHold}
      onPointerCancel={releaseHold}
      animate={controls}
      style={
        {
          '--progress': progress,
        } as React.CSSProperties
      }
    >
      <span className={styles.fill} aria-hidden />
      <span className={styles.labelStack}>
        <span className={styles.labelBase}>{children}</span>
        <span className={styles.labelOverlay} aria-hidden>
          {children}
        </span>
      </span>
    </motion.button>
  );
}
