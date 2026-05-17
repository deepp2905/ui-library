'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy, tapSmall } from '@/lib/motion';
import styles from './Counter.module.css';

export interface CounterProps {
  /** Controlled value. Omit for uncontrolled usage. */
  value?: number;
  onChange?: (value: number) => void;
  /** Initial value when uncontrolled. */
  initial?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

const digitTransition = {
  type: 'spring' as const,
  stiffness: 500,
  damping: 32,
  mass: 0.6,
};

function Digit({ char }: { char: string }) {
  return (
    <span className={styles.digit}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={char}
          className={styles.digitChar}
          initial={{ filter: 'blur(8px)', opacity: 0, y: -12 }}
          animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
          exit={{ filter: 'blur(8px)', opacity: 0, y: 12 }}
          transition={digitTransition}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Counter({
  value: controlled,
  onChange,
  initial = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  className,
}: CounterProps) {
  const [internal, setInternal] = useState(initial);
  const value = controlled ?? internal;

  const set = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (controlled === undefined) setInternal(clamped);
    onChange?.(clamped);
  };

  const negative = value < 0;
  const absStr = Math.abs(value).toString();
  const items: { key: string; char: string }[] = [];
  if (negative) items.push({ key: 'sign', char: '−' });
  for (let i = 0; i < absStr.length; i++) {
    const pos = absStr.length - 1 - i;
    items.push({ key: `d${pos}`, char: absStr[i] });
  }

  return (
    <div className={cn(styles.counter, className)}>
      <motion.button
        type="button"
        className={styles.btn}
        onClick={() => set(value - step)}
        disabled={value - step < min}
        whileTap={tapSmall}
        transition={springSnappy}
        aria-label="Decrement"
      >
        &#8722;
      </motion.button>

      <div className={styles.value} aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map(({ key, char }) => (
            <motion.span
              key={key}
              layout
              className={styles.slot}
              initial={{ filter: 'blur(8px)', opacity: 0, scale: 0.6 }}
              animate={{ filter: 'blur(0px)', opacity: 1, scale: 1 }}
              exit={{ filter: 'blur(8px)', opacity: 0, scale: 0.6 }}
              transition={digitTransition}
            >
              <Digit char={char} />
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        className={styles.btn}
        onClick={() => set(value + step)}
        disabled={value + step > max}
        whileTap={tapSmall}
        transition={springSnappy}
        aria-label="Increment"
      >
        +
      </motion.button>
    </div>
  );
}
