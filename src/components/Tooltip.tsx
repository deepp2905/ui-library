'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { easeOut } from '@/lib/motion';
import styles from './Tooltip.module.css';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: React.ReactNode;
  side?: TooltipSide;
  /** Delay before showing, in ms. */
  delay?: number;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({
  content,
  side = 'top',
  delay = 150,
  children,
  className,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  let timer: ReturnType<typeof setTimeout>;

  const show = () => {
    timer = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timer);
    setOpen(false);
  };

  return (
    <span
      className={cn(styles.root, className)}
      onPointerEnter={show}
      onPointerLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            className={cn(styles.bubble, styles[side])}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={easeOut}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
