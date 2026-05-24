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

const SHRINK_MS = 300; // scale down to nothing
const INVISIBLE_WAIT_MS = 450; // time the button stays invisible
const EXPAND_MS = 300; // fade back to full size

/* Reverse (release-early) animation duration. Independent of hold
   duration so a release always feels snappy regardless of fill speed. */
const REVERSE_MS = 220;

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
  holdMs = 1200,
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

    /* Spawn the confetti burst at the same instant the shrink begins. */
    const id = burstIdRef.current++;
    setBursts((prev) => [...prev, { id, shards: makeShards() }]);

    /* 1. Scale down to 1%, fading opacity only in the last 25%. */
    await controls.start({
      scale: [1, 0.01],
      opacity: [1, 1, 0],
      transition: {
        type: 'spring',
        duration: SHRINK_MS / 1000,
        bounce: 0.25,
        times: [0, 0.75, 1],
      },
    });
    /* Reset the fill while the button is invisible so the reappear
       shows the outline state, not the filled state. */
    progress.set(0);
    // 2. Hold at invisible briefly.
    await new Promise((r) => setTimeout(r, INVISIBLE_WAIT_MS));
    /* 3. Expand scale back to 1; fade opacity in over the first
       quarter so the button doesn't pop in invisibly. Plain tween on
       scale (not spring) so there's no possibility of overshoot — a
       0.01 → 1 jump under spring physics overshoots even with
       bounce: 0 because the duration is interpreted as settle time. */
    await controls.start({
      scale: 1,
      opacity: 1,
      transition: {
        scale: {
          duration: EXPAND_MS / 1000,
          ease: FILL_EASE,
        },
        opacity: {
          duration: (EXPAND_MS / 1000),
          ease: FILL_EASE,
        },
      },
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
                /* High damping (32 = springSnappy default) so the press
                   settles to 0.96 without oscillating past it. damping=16
                   was bouncy and visibly oscillated when the gesture
                   re-engaged after the delete sequence. */
                transition: springSnappy,
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
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={i === 0 ? onDone : undefined}
          />
        );
      })}
    </>
  );
}
