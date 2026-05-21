'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { cn } from '@/lib/cn';
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

  const trackControls = useAnimationControls();
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    trackControls.start({
      scaleX: [1, 1.125, 1],
      transition: {
        duration: 0.4,
        times: [0, 0.4, 1],
        ease: [0.22, 1, 0.36, 1],
      },
    });
  }, [checked, trackControls]);

  return (
    <motion.button
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
      style={{ transformOrigin: checked ? 'left center' : 'right center' }}
      animate={trackControls}
      {...props}
    >
      <span className={styles.thumbWrap}>
        <motion.span
          className={styles.thumb}
          layout
          animate={{ scale: pressed && !disabled ? 0.86 : 1 }}
          transition={{
            type: 'spring',
            stiffness: 800,
            damping: 32,
            mass: 0.75,
          }}
        />
      </span>
    </motion.button>
  );
}
