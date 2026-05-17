'use client';

import { forwardRef, useId } from 'react';
import { cn } from '@/lib/cn';
import styles from './Input.module.css';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  /** Helper text shown below the field. */
  hint?: string;
  /** Error message — replaces the hint and turns the field red. */
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      hint,
      error,
      size = 'md',
      leadingIcon,
      trailingIcon,
      className,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const describedBy = error || hint ? `${inputId}-desc` : undefined;

    return (
      <div className={cn(styles.field, className)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div
          className={cn(
            styles.wrap,
            styles[size],
            error && styles.invalid,
            disabled && styles.disabled,
          )}
        >
          {leadingIcon && <span className={styles.icon}>{leadingIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={styles.input}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={describedBy}
            {...props}
          />
          {trailingIcon && <span className={styles.icon}>{trailingIcon}</span>}
        </div>
        {(error || hint) && (
          <p
            id={describedBy}
            className={cn(styles.desc, error && styles.descError)}
          >
            {error ?? hint}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
