'use client';

import { forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy, tap } from '@/lib/motion';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  /** Icon rendered before the label. */
  leadingIcon?: React.ReactNode;
  /** Icon rendered after the label. */
  trailingIcon?: React.ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leadingIcon,
      trailingIcon,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          styles.button,
          styles[variant],
          styles[size],
          fullWidth && styles.fullWidth,
          className,
        )}
        disabled={isDisabled}
        whileTap={isDisabled ? undefined : tap}
        transition={springSnappy}
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
  },
);

Button.displayName = 'Button';
