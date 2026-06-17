'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
import styles from './Menu.module.css';

export interface MenuItem {
  label: string;
  /** Optional link target — renders an <a>; omit for a plain button item. */
  href?: string;
  /** Marks the current page; shows the small orange dot. */
  active?: boolean;
}

export interface MenuProps {
  /** Items listed in the overlay. */
  items?: MenuItem[];
  /** Text shown on the trigger pill. */
  label?: string;
  className?: string;
}

const DEFAULT_ITEMS: MenuItem[] = [
  { label: 'Item 1' },
  { label: 'Item 2' },
  { label: 'Item 3', active: true },
  { label: 'Item 4' },
];

/** Two stacked lines — the classic menu mark. */
function MenuGlyph() {
  return (
    <svg className={styles.glyph} viewBox="0 0 24 24" aria-hidden>
      <line x1="4" y1="9.5" x2="20" y2="9.5" />
      <line x1="4" y1="14.5" x2="20" y2="14.5" />
    </svg>
  );
}

/** A thin right-pointing arrow, revealed on hover. */
function ArrowGlyph() {
  return (
    <svg className={styles.arrow} viewBox="0 0 24 24" aria-hidden>
      <line x1="4" y1="12" x2="18" y2="12" />
      <polyline points="12 6 18 12 12 18" />
    </svg>
  );
}

export function Menu({
  items = DEFAULT_ITEMS,
  label = 'MENU',
  className,
}: MenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape while the overlay is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn(styles.root, className)}>
      <motion.button
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.96 }}
        transition={springSnappy}
      >
        <span className={styles.triggerLabel}>{label}</span>
        <MenuGlyph />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.panel}
            role="menu"
            // x stays at -50% throughout so the panel remains centered on the
            // trigger while y/scale animate (Framer drives `transform` inline).
            initial={{ opacity: 0, x: '-50%', y: -8, scale: 0.97 }}
            animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
            exit={{ opacity: 0, x: '-50%', y: -8, scale: 0.97 }}
            transition={springSnappy}
          >
            {items.map((item, i) => {
              const itemClass = cn(styles.item, item.active && styles.itemActive);
              const inner = (
                <>
                  <ArrowGlyph />
                  <span className={styles.itemRight}>
                    {item.active && <span className={styles.dot} aria-hidden />}
                    <span className={styles.itemLabel}>{item.label}</span>
                  </span>
                </>
              );
              return item.href ? (
                <a
                  key={i}
                  href={item.href}
                  role="menuitem"
                  className={itemClass}
                  aria-current={item.active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {inner}
                </a>
              ) : (
                <button
                  key={i}
                  type="button"
                  role="menuitem"
                  className={itemClass}
                  aria-current={item.active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {inner}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
