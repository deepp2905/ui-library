'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSoft } from '@/lib/motion';
import styles from './Progress.module.css';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0–100. */
  value: number;
  size?: 'sm' | 'md';
  /** Render an indeterminate looping bar (ignores value). */
  indeterminate?: boolean;
}

export function Progress({
  value,
  size = 'md',
  indeterminate = false,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : clamped}
      className={cn(styles.track, styles[size], className)}
      {...props}
    >
      {indeterminate ? (
        <span className={cn(styles.fill, styles.indeterminate)} />
      ) : (
        <motion.span
          className={styles.fill}
          initial={false}
          animate={{ width: `${clamped}%` }}
          transition={springSoft}
        />
      )}
    </div>
  );
}
