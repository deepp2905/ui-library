'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationControls,
  useMotionValue,
  useMotionValueEvent,
  type AnimationPlaybackControls,
} from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
import styles from './HoldToDelete.module.css';

export interface HoldToDeleteProps {
  /** Label shown inside the button. */
  children?: React.ReactNode;
  /** Fires once the hold completes (after the fill reaches 1). */
  onConfirm?: () => void;
  /** Hold duration in milliseconds. */
  holdMs?: number;
  className?: string;
}

/* ────────────────────────────────────────────────────────────────────
   TIMING CONSTANTS — one per phase of the interaction.
   See `runDeleteSequence` below for where each one is used.
   ──────────────────────────────────────────────────────────────────── */

/* ── Phase 1: SHRINK (button collapses to nothing after hold completes) */
const SHRINK_MS = 200;

/* ── Phase 2: WAIT (invisible pause between shrink and expand) */
const INVISIBLE_WAIT_MS = 1600;

/* ── Phase 3: EXPAND uses a spring (no fixed duration) — see runDeleteSequence */

/* ── Release-early reverse: how fast the fill bar drains back to 0
       when the user lets go before hold completes. */
const REVERSE_MS = 220;

/* ── Chards (confetti burst) — timing is independent of shrink/expand. */
const CHARDS_DELAY_MS = 150; // wait after shrink starts before launching
const CHARDS_DURATION_MS = 750; // each chard's fly-out duration

/* Cubic-bezier ease-out: fast start, slow finish. The fill bar accelerates
   in then eases into completion — and because the animation's own end is
   the trigger, what you see is exactly when the action fires. */
const FILL_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type AnimateFn = (
  mv: ReturnType<typeof useMotionValue<number>>,
  to: number,
  opts: { duration: number; ease: typeof FILL_EASE; onComplete?: () => void },
) => AnimationPlaybackControls;
const animateMV = animate as unknown as AnimateFn;

interface Shard {
  id: number;
  w: number;
  h: number;
  angle: number;
  distance: number;
  rotation: number;
}

const makeShards = (): Shard[] => {
  const count = 24 + Math.floor(Math.random() * 16);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    w: 3 + Math.random() * 5,
    h: 3 + Math.random() * 7,
    angle: Math.random() * Math.PI * 2,
    distance: 90 + Math.random() * 45,
    rotation: (Math.random() - 0.5) * 180,
  }));
};

export function HoldToDelete({
  children = 'Hold to delete',
  onConfirm,
  holdMs = 1600,
  className,
}: HoldToDeleteProps) {
  const progress = useMotionValue(0);
  const playbackRef = useRef<AnimationPlaybackControls | null>(null);
  const completedRef = useRef(false);
  const rootRef = useRef<HTMLButtonElement>(null);

  const controls = useAnimationControls();

  const [bursts, setBursts] = useState<{ id: number; shards: Shard[] }[]>([]);
  const burstIdRef = useRef(0);
  /* Suppress the press-springback `whileTap` on the outer wrapper while
     the delete sequence is running. Otherwise a release mid-sequence
     re-triggers the gesture's scale spring and overrides the controls. */
  const [sequenceActive, setSequenceActive] = useState(false);

  const removeBurst = useCallback((id: number) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  /* Push the CSS custom property whenever the motion value changes. */
  useMotionValueEvent(progress, 'change', (v) => {
    const el = rootRef.current;
    if (el) el.style.setProperty('--progress', String(v));
  });

  const stopProgressAnim = () => {
    playbackRef.current?.stop();
    playbackRef.current = null;
  };

  /* ──────────────────────────────────────────────────────────────────
     DELETE SEQUENCE — fires after the long-press fill reaches 1.
     Runs four phases sequentially: shards spawn (delayed),
     shrink → wait → expand.
     ────────────────────────────────────────────────────────────────── */
  const runDeleteSequence = useCallback(async () => {
    onConfirm?.();
    setSequenceActive(true);

    /* ── PHASE 0: CHARDS (delayed spawn)
       Schedule the burst CHARDS_DELAY_MS into the shrink so the
       chards erupt as the button is mid-dissolve, not at t=0. */
    setTimeout(() => {
      const id = burstIdRef.current++;
      setBursts((prev) => [...prev, { id, shards: makeShards() }]);
    }, CHARDS_DELAY_MS);

    /* ── PHASE 1: SHRINK
       Scale collapses from 1 → 0.01 with a "wind-up then crash"
       cubic-bezier (briefly grows past 1, then plunges). Opacity
       fades to 0 across the same duration. */
    await controls.start({
      scale: [1, 0.01],
      opacity: 0,
      transition: {
        ease: [1, -0.2, 0.8, 1],
        duration: SHRINK_MS / 1000,
      },
    });

    /* Reset the fill while the button is invisible so the reappear
       shows the outline state, not the filled state. */
    progress.set(0);

    /* ── PHASE 2: WAIT
       Hold at invisible for INVISIBLE_WAIT_MS. Nothing animates on
       the button; shards continue flying out in this window. */
    await new Promise((r) => setTimeout(r, INVISIBLE_WAIT_MS));

    /* ── PHASE 3: EXPAND
       Spring back to scale 1, opacity 1. Bouncy (damping 36) so the
       button visibly pops back into existence. */
    await controls.start({
      scale: 1,
      opacity: 1,
      transition: { ...springSnappy, damping: 36},
    });

    completedRef.current = false;
    setSequenceActive(false);
  }, [controls, progress, onConfirm]);

  /* ──────────────────────────────────────────────────────────────────
     LONG-PRESS FILL — starts on pointerdown, drives the orange bar
     left → right over `holdMs`. When it reaches 1, the delete
     sequence above fires.
     ────────────────────────────────────────────────────────────────── */
  const startHold = () => {
    if (completedRef.current) return;
    stopProgressAnim();

    /* Duration scales with remaining progress so resuming from a partial
       fill (e.g. user re-presses mid-reverse) finishes at the right time. */
    const remaining = holdMs * (1 - progress.get());

    playbackRef.current = animateMV(progress, 1, {
      duration: remaining / 1000,
      ease: FILL_EASE,
      onComplete: () => {
        completedRef.current = true;
        runDeleteSequence();
      },
    });
  };

  /* ──────────────────────────────────────────────────────────────────
     RELEASE-EARLY — pointerup / pointerleave before hold completes.
     Reverses the fill bar back to 0 over REVERSE_MS.
     ────────────────────────────────────────────────────────────────── */
  const releaseHold = () => {
    if (completedRef.current) return;
    stopProgressAnim();
    if (progress.get() > 0) {
      playbackRef.current = animateMV(progress, 0, {
        duration: REVERSE_MS / 1000,
        ease: FILL_EASE,
      });
    }
  };

  useEffect(() => () => stopProgressAnim(), []);

  return (
    <span className={styles.shell}>
      <span className={styles.confettiLayer} aria-hidden>
        <AnimatePresence>
          {bursts.map((burst) => (
            <Burst
              key={burst.id}
              shards={burst.shards}
              onDone={() => removeBurst(burst.id)}
            />
          ))}
        </AnimatePresence>
      </span>
      {/* Outer wrapper owns the press-springback (whileTap). Inner
          button owns the delete sequence (animate={controls}). Splitting
          them onto two elements stops the two animation systems from
          fighting over the same scale + opacity values. */}
      <motion.span
        className={styles.tapTarget}
        animate={{ scale: 1 }}
        /* Explicit non-spring transition for the springback so it can't
           overshoot when the gesture deactivates (Framer's default
           spring is bouncy). */
        transition={{ duration: 0.15, ease: FILL_EASE }}
        whileTap={
          sequenceActive
            ? undefined
            : {
                scale: 0.96,
                transition: { ...springSnappy, damping: 16 },
              }
        }
      >
        <motion.button
          ref={rootRef}
          type="button"
          className={cn(styles.root, className)}
          onPointerDown={startHold}
          onPointerUp={releaseHold}
          onPointerLeave={releaseHold}
          onPointerCancel={releaseHold}
          animate={controls}
        >
          <span className={styles.fill} aria-hidden />
          <span className={styles.label}>{children}</span>
          <span className={styles.labelOverlay} aria-hidden>
            {children}
          </span>
        </motion.button>
      </motion.span>
    </span>
  );
}

function Burst({ shards, onDone }: { shards: Shard[]; onDone: () => void }) {
  return (
    <>
      {shards.map((s, i) => {
        const cx = -s.w / 2;
        const cy = -s.h / 2;
        const x = cx + Math.cos(s.angle) * s.distance;
        const y = cy + Math.sin(s.angle) * s.distance;
        return (
          <motion.span
            key={s.id}
            className={styles.confettiPiece}
            style={{ width: s.w, height: s.h }}
            initial={{ x: cx, y: cy, opacity: 1, rotate: 0, scale: 0.6 }}
            animate={{ x, y, opacity: 0, rotate: s.rotation, scale: 1 }}
            transition={{
              duration: CHARDS_DURATION_MS / 1000,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={i === 0 ? onDone : undefined}
          />
        );
      })}
    </>
  );
}
