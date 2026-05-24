'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { easeOut } from '@/lib/motion';
import styles from './Accordion.module.css';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple panels open at once. */
  multiple?: boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
  className,
}: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen);

  const toggle = (id: string) => {
    setOpen((current) => {
      const isOpen = current.includes(id);
      if (multiple) {
        return isOpen
          ? current.filter((x) => x !== id)
          : [...current, id];
      }
      return isOpen ? [] : [id];
    });
  };

  return (
    <div className={cn(styles.accordion, className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        return (
          <div key={item.id} className={styles.item}>
            <button
              type="button"
              className={styles.trigger}
              aria-expanded={isOpen}
              onClick={() => toggle(item.id)}
            >
              <span>{item.title}</span>
              <motion.span
                className={styles.chevron}
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={easeOut}
                aria-hidden
              >
                &#9662;
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  className={styles.panel}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={easeOut}
                >
                  <div className={styles.content}>{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
