'use client';

import { forwardRef, useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  /** Icon rendered before the label. */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  trailingIcon?: React.ReactNode;
  loading?: boolean;
  /** Corner geometry. 'squircle' uses iOS-style continuous corners. */
  cornerStyle?: 'rounded' | 'squircle';
  /** Burst small confetti shards from behind the button on click. */
  confetti?: boolean;
}

interface Shard {
  id: number;
  w: number;
  h: number;
  angle: number;
  distance: number;
  rotation: number;
}

const makeShards = (): Shard[] => {
  const count = 12 + Math.floor(Math.random() * 16);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    w: 3 + Math.random() * 5,
    h: 3 + Math.random() * 7,
    angle: Math.random() * Math.PI * 2,
    distance: 90 + Math.random() * 45,
    rotation: (Math.random() - 0.5) * 180,
  }));
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      loading = false,
      cornerStyle = 'rounded',
      confetti = false,
      disabled,
      className,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    const [bursts, setBursts] = useState<{ id: number; shards: Shard[] }[]>([]);
    const burstIdRef = useRef(0);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (confetti && !isDisabled) {
          const id = burstIdRef.current++;
          setBursts((prev) => [...prev, { id, shards: makeShards() }]);
        }
        onClick?.(e);
      },
      [confetti, isDisabled, onClick],
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
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          cornerStyle === 'squircle' && styles.squircle,
          className,
        )}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : { scale: 0.96 }}
        transition={{ ...springSnappy, damping: 16 }}
        onClick={handleClick}
        {...props}
      >
        {loading && <span className={styles.spinner} aria-hidden />}
        {!loading && leadingIcon && (
          <span className={styles.icon}>{leadingIcon}</span>
        )}
        <span className={cn(loading && styles.hiddenLabel)}>{children}</span>
        {!loading && trailingIcon && (
          <span className={styles.icon}>{trailingIcon}</span>
        )}
      </motion.button>
    );

    if (!confetti) return button;

    return (
      <span className={cn(styles.root, fullWidth && styles.fullWidth)}>
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

Button.displayName = 'Button';

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
