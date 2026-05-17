'use client';

import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
import styles from './SegmentedControl.module.css';

export interface SegmentOption {
  value: string;
  label: React.ReactNode;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  size = 'md',
  className,
}: SegmentedControlProps) {
  const groupId = useId();
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.value,
  );
  const active = value ?? internal;

  const select = (next: string) => {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  };

  return (
    <div
      role="radiogroup"
      className={cn(styles.root, styles[size], className)}
    >
      {options.map((option) => {
        const selected = option.value === active;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={cn(styles.segment, selected && styles.selected)}
            onClick={() => select(option.value)}
          >
            {selected && (
              <motion.span
                layoutId={`${groupId}-thumb`}
                className={styles.thumb}
                transition={springSnappy}
              />
            )}
            <span className={styles.label}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
