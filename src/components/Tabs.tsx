'use client';

import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSnappy } from '@/lib/motion';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  /** Controlled active tab id. */
  value?: string;
  defaultValue?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export function Tabs({
  items,
  value,
  defaultValue,
  onChange,
  className,
}: TabsProps) {
  const groupId = useId();
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id);
  const active = value ?? internal;

  const select = (id: string) => {
    if (value === undefined) setInternal(id);
    onChange?.(id);
  };

  const activeItem = items.find((item) => item.id === active);

  return (
    <div className={cn(styles.tabs, className)}>
      <div role="tablist" className={styles.list}>
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${groupId}-${item.id}`}
              disabled={item.disabled}
              className={cn(styles.tab, selected && styles.tabActive)}
              onClick={() => select(item.id)}
            >
              {selected && (
                <motion.span
                  layoutId={`${groupId}-indicator`}
                  className={styles.indicator}
                  transition={springSnappy}
                />
              )}
              <span className={styles.tabLabel}>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${groupId}-${active}`}
        className={styles.panel}
      >
        {activeItem?.content}
      </div>
    </div>
  );
}
