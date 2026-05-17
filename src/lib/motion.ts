import type { Transition, Variants } from 'framer-motion';

/**
 * Shared motion presets. Components import from here so timing and
 * easing stay consistent across the whole library.
 */

export const springSnappy: Transition = {
  type: 'spring',
  stiffness: 560,
  damping: 32,
  mass: 0.7,
};

export const springSoft: Transition = {
  type: 'spring',
  stiffness: 320,
  damping: 30,
};

export const springStiff: Transition = {
  type: 'spring',
  stiffness: 800,
  damping: 48,
};

export const easeOut: Transition = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

/** Press feedback used by interactive controls. */
export const tap = { scale: 0.96 } as const;
export const tapSmall = { scale: 0.92 } as const;

/** Fade + lift, for overlays and surfaces appearing on screen. */
export const fadeLift: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.98 },
};

/** Simple opacity fade, for backdrops. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};
