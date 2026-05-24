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

const SHRINK_MS = 200; // scale down to nothing
const INVISIBLE_WAIT_MS = 1200; // time the button stays invisible

/* Reverse (release-early) animation duration. Independent of hold
   duration so a release always feels snappy regardless of fill speed. */
const REVERSE_MS = 220;

/* Chards: independent of the shrink/expand timings. */
const CHARDS_DELAY_MS = 150; // wait after shrink starts before launching
const CHARDS_DURATION_MS = 900; // how long each chard's fly-out animation lasts

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
  holdMs = 900,
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

  const runDeleteSequence = useCallback(async () => {
    onConfirm?.();
    setSequenceActive(true);

    /* Spawn the confetti burst after a delay so the chards launch as
       the button is mid-dissolve, not at the start. */
    setTimeout(() => {
      const id = burstIdRef.current++;
      setBursts((prev) => [...prev, { id, shards: makeShards() }]);
    }, CHARDS_DELAY_MS);

    /* 1. Shrink with anticipation: scale briefly grows past 1 (wind-up)
       then plunges to 0.01. Opacity fades to 0 and blur grows to 5px
       linearly across the full duration. */
    await controls.start({
      scale: [1, 0.01],
      opacity: 0,
      transition: {
        // Slow wind-up, fast crash: first control point pulls the
        // curve into a slow rise above 1 (scale grows past from-value),
        // second control point yanks it sharply down to target in the
        // back end. Lingers at the top, then plunges.
        ease: [1, -0.2, 0.9, 1],
        duration: SHRINK_MS / 1000,
      },
    });
    /* Reset the fill while the button is invisible so the reappear
       shows the outline state, not the filled state. */
    progress.set(0);
    // 2. Hold at invisible briefly.
    await new Promise((r) => setTimeout(r, INVISIBLE_WAIT_MS));
    /* 3. Expand back to scale 1, opacity 1, blur 0 — with a bouncy
       spring so the button pops back into existence. */
    await controls.start({
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { ...springSnappy, damping: 48 },
    });
    completedRef.current = false;
    setSequenceActive(false);
  }, [controls, progress, onConfirm]);

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
