'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { fade, fadeLift, springSnappy } from '@/lib/motion';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Footer area, typically action buttons. */
  footer?: React.ReactNode;
  /** Close when the backdrop is clicked. Default true. */
  dismissable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  dismissable = true,
  size = 'md',
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissable) onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, dismissable, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={styles.layer}>
          <motion.div
            className={styles.backdrop}
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={dismissable ? onClose : undefined}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(styles.dialog, styles[size])}
            variants={fadeLift}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={springSnappy}
          >
            {(title || description) && (
              <header className={styles.header}>
                {title && <h2 className={styles.title}>{title}</h2>}
                {description && (
                  <p className={styles.description}>{description}</p>
                )}
              </header>
            )}
            {children && <div className={styles.body}>{children}</div>}
            {footer && <footer className={styles.footer}>{footer}</footer>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
