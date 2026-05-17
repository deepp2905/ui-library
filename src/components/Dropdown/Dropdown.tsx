'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { easeOut } from '@/lib/motion';
import styles from './Dropdown.module.css';

export interface DropdownItem {
  value: string;
  label: React.ReactNode;
  /** Renders the item in the danger colour. */
  destructive?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  /** The element that toggles the menu. */
  trigger: React.ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: 'start' | 'end';
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  align = 'start',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      <span
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {trigger}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            className={cn(styles.menu, styles[align])}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={easeOut}
          >
            {items.map((item) => (
              <button
                key={item.value}
                role="menuitem"
                type="button"
                disabled={item.disabled}
                className={cn(
                  styles.item,
                  item.destructive && styles.destructive,
                )}
                onClick={() => {
                  onSelect(item.value);
                  setOpen(false);
                }}
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
