'use client';

import { forwardRef, useCallback, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  type HTMLMotionProps,
} from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
import styles from './Heart.module.css';

/** Fast, critically damped press so the dip reaches full compression even
 *  on a brief touch tap. No bounce here — the overshoot lives on release. */
const PRESS_TRANSITION = {
  type: 'spring',
  stiffness: 1100,
  damping: 42,
  mass: 0.6,
} as const;

/** Bouncy spring for the tap-release rebound — this is the only place the
 *  scale overshoots. Used when settling back to rest (1) or hover (1.03). */
const REBOUND_TRANSITION = { ...springSnappy, damping: 10 };

const HOVER_SCALE = 1.03;

export type HeartSize = 'sm' | 'md' | 'lg';

export interface HeartProps
  extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  size?: HeartSize;
  /** Controlled active (filled) state. */
  active?: boolean;
  /** Initial active state when uncontrolled. */
  defaultActive?: boolean;
  /** Called whenever the active state changes. */
  onActiveChange?: (active: boolean) => void;
  /** Burst small confetti shards from behind the heart on click. */
  confetti?: boolean;
}

interface Shard {
  id: number;
  w: number;
  h: number;
  angle: number;
  distance: number;
  rotation: number;
  duration: number;
  delay: number;
}

const MIN_DISTANCE = 90;
const MAX_DISTANCE = 135;
const MIN_DURATION = 0.15;
const MAX_DURATION = 0.3;
const DURATION_JITTER = 0.08;
const MAX_DELAY = 0.06;
const DELAY_JITTER = 0.015;

const makeShards = (): Shard[] => {
  const count = 24 + Math.floor(Math.random() * 8);
  return Array.from({ length: count }, (_, i) => {
    const distance = MIN_DISTANCE + Math.random() * (MAX_DISTANCE - MIN_DISTANCE);
    const t = (distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE);
    const durationJitter = (Math.random() - 0.5) * 2 * DURATION_JITTER;
    const duration = Math.max(
      0.2,
      MIN_DURATION + t * (MAX_DURATION - MIN_DURATION) + durationJitter,
    );
    const delayJitter = (Math.random() - 0.5) * 2 * DELAY_JITTER;
    const delay = Math.max(0, t * MAX_DELAY + delayJitter);
    return {
      id: i,
      w: 3 + Math.random() * 5,
      h: 3 + Math.random() * 7,
      angle: Math.random() * Math.PI * 2,
      distance,
      rotation: (Math.random() - 0.5) * 180,
      duration,
      delay,
    };
  });
};

export const Heart = forwardRef<HTMLButtonElement, HeartProps>(
  (
    {
      size = 'md',
      active,
      defaultActive = false,
      onActiveChange,
      confetti = true,
      disabled,
      className,
      onClick,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const isControlled = active !== undefined;
    const [internalActive, setInternalActive] = useState(defaultActive);
    const isActive = isControlled ? active : internalActive;

    const [bursts, setBursts] = useState<{ id: number; shards: Shard[] }[]>([]);
    const burstIdRef = useRef(0);

    const controls = useAnimationControls();
    // Track hover via a ref so tap-release knows whether to settle to the
    // hover scale (1.03) or rest (1). Framer's hover gestures only fire for
    // a real mouse, so on touch this stays false and release returns to 1.
    const isHoveredRef = useRef(false);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!disabled) {
          const next = !isActive;
          if (!isControlled) setInternalActive(next);
          onActiveChange?.(next);

          if (confetti && next) {
            const id = burstIdRef.current++;
            setBursts((prev) => [...prev, { id, shards: makeShards() }]);
          }
        }
        onClick?.(e);
      },
      [confetti, disabled, isActive, isControlled, onActiveChange, onClick],
    );

    const removeBurst = useCallback((id: number) => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, []);

    const button = (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          styles.button,
          styles[size],
          isActive && styles.active,
          className,
        )}
        disabled={disabled}
        aria-pressed={isActive}
        aria-label={ariaLabel ?? (isActive ? 'Unlike' : 'Like')}
        animate={controls}
        initial={{ scale: 1 }}
        onHoverStart={() => {
          isHoveredRef.current = true;
          // Snappy, no overshoot on hover-in.
          if (!disabled)
            controls.start({ scale: HOVER_SCALE, transition: springSnappy });
        }}
        onHoverEnd={() => {
          isHoveredRef.current = false;
          if (!disabled) controls.start({ scale: 1, transition: springSnappy });
        }}
        onTapStart={() => {
          if (!disabled)
            controls.start({ scale: 0.86, transition: PRESS_TRANSITION });
        }}
        onTap={() => {
          // Bouncy release — the only overshoot. Settle to hover or rest.
          if (!disabled)
            controls.start({
              scale: isHoveredRef.current ? HOVER_SCALE : 1,
              transition: REBOUND_TRANSITION,
            });
        }}
        onTapCancel={() => {
          if (!disabled)
            controls.start({
              scale: isHoveredRef.current ? HOVER_SCALE : 1,
              transition: REBOUND_TRANSITION,
            });
        }}
        onClick={handleClick}
        {...props}
      >
        <svg
          className={styles.svg}
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
          aria-hidden
        >
          <path
            className={styles.path}
            d="M 11.5 20.5 C 11.7 20.8 12.3 20.8 12.5 20.5 C 16 18 21.5 13.5 22 9 C 22.5 5.5 20.5 3.5 17.5 3.5 C 15.5 3.5 13.5 4.7 12.5 6.3 C 12.25 6.7 11.75 6.7 11.5 6.3 C 10.5 4.7 8.5 3.5 6.5 3.5 C 3.5 3.5 1.5 5.5 2 9 C 2.5 13.5 8 18 11.5 20.5 Z"
          />
        </svg>
      </motion.button>
    );

    if (!confetti) return button;

    return (
      <span className={styles.root}>
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
        {button}
      </span>
    );
  },
);

Heart.displayName = 'Heart';

function Burst({ shards, onDone }: { shards: Shard[]; onDone: () => void }) {
  const longestId = shards.reduce(
    (acc, s) =>
      s.duration + s.delay > acc.duration + acc.delay ? s : acc,
    shards[0],
  ).id;
  return (
    <>
      {shards.map((s) => {
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
            animate={{
              x,
              y,
              opacity: [1, 1, 0],
              rotate: s.rotation,
              scale: 1,
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              ease: [0, 0.55, 0.45, 1],
              opacity: {
                duration: s.duration,
                delay: s.delay,
                times: [0, 0.05, 1],
                ease: 'linear',
              },
            }}
            onAnimationComplete={s.id === longestId ? onDone : undefined}
          />
        );
      })}
    </>
  );
}
