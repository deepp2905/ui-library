'use client';

import { forwardRef, useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
import styles from './Heart.module.css';

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
const MIN_DURATION = 0.45;
const MAX_DURATION = 0.85;
const DURATION_JITTER = 0.08;
const MAX_DELAY = 0.06;
const DELAY_JITTER = 0.015;

const makeShards = (): Shard[] => {
  const count = 12 + Math.floor(Math.random() * 16);
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
        whileTap={disabled ? undefined : { scale: 0.86 }}
        animate={{ scale: 1 }}
        transition={{ ...springSnappy, damping: 16 }}
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
            d="M12 21s-7.5-4.6-9.6-9.3C1 8.3 3 4.5 6.5 4.5c2 0 3.6 1.1 4.5 2.7h2c.9-1.6 2.5-2.7 4.5-2.7 3.5 0 5.5 3.8 4.1 7.2C19.5 16.4 12 21 12 21z"
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
            animate={{ x, y, opacity: 0, rotate: s.rotation, scale: 1 }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              ease: [0.22, 1, 0.36, 1],
            }}
            onAnimationComplete={s.id === longestId ? onDone : undefined}
          />
        );
      })}
    </>
  );
}
