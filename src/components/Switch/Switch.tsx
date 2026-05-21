'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSoft } from '@/lib/motion';
import styles from './Switch.module.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
  /** Accessible label — required when no visible label is present. */
  'aria-label'?: string;
  id?: string;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className,
  id,
  ...props
}: SwitchProps) {
  const [pressed, setPressed] = useState(false);
  const release = () => setPressed(false);

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      className={cn(
        styles.track,
        styles[size],
        checked && styles.on,
        className,
      )}
      {...props}
    >
      <span className={styles.thumbWrap}>
        <motion.span
          className={styles.thumb}
          layout
          animate={{ scale: pressed && !disabled ? 0.86 : 1 }}
          transition={{ ...springSoft, stiffness: 500, damping: 18, mass: 0.6 }}
        />
      </span>
    </button>
  );
}
