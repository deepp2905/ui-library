'use client';

import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  className,
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <label
      htmlFor={inputId}
      className={cn(styles.root, disabled && styles.disabled, className)}
    >
      <span className={cn(styles.box, checked && styles.checked)}>
        <input
          id={inputId}
          type="checkbox"
          className={styles.input}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <motion.svg
          className={styles.tick}
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden
        >
          <motion.path
            d="M3.5 8.5L6.5 11.5L12.5 4.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={false}
            animate={{ pathLength: checked ? 1 : 0 }}
            transition={springSnappy}
          />
        </motion.svg>
      </span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
}
