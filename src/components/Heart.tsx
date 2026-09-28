'use client';

import { forwardRef, useCallback, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useReducedMotion,
  type HTMLMotionProps,
} from 'framer-motion';
import { cn } from '@/lib/cn';
import { canHover } from '@/lib/hover';
import { springSnappy } from '@/lib/motion';
import { ConfettiBurst, makeShards, type Shard } from './ConfettiBurst';
import styles from './Heart.module.css';

/** Fast, critically damped press so the dip reaches full compression even
 *  on a brief touch tap. No bounce here — the overshoot lives on release. */
const PRESS_TRANSITION = {
  type: 'spring',
  stiffness: 1100,
  damping: 42,
  mass: 0.6,
} as const;

/** Bouncy spring for the tap-release rebound — this is the only place the
 *  scale overshoots. Used when settling back to rest (1) or hover (1.03). */
const REBOUND_TRANSITION = { ...springSnappy, damping: 10 };

const HOVER_SCALE = 1.03;
/** Touch has no hover, so the press itself is the affordance: instead of the
 *  desktop dip (0.86) it grows. Same spring as the desktop press, just upward,
 *  so a tap reads as an enlarge — not a gray flash. */
const TOUCH_PRESS_SCALE = 1.12;

/** True for touch/pen pointers — anything that isn't a real mouse. Framer's
 *  tap event is a PointerEvent; treat an unknown event as touch to be safe. */
const isTouchPointer = (e: MouseEvent | TouchEvent | PointerEvent) =>
  'pointerType' in e ? e.pointerType !== 'mouse' : true;

export type HeartSize = 'sm' | 'md' | 'lg';

export interface HeartProps
  extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  size?: HeartSize;
  /** Controlled active (filled) state. */
  active?: boolean;
  /** Initial active state when uncontrolled. */
  defaultActive?: boolean;
  /** Called whenever the active state changes. */
  onActiveChange?: (active: boolean) => void;
  /** Burst small confetti shards from behind the heart on click. */
  confetti?: boolean;
}

export const Heart = forwardRef<HTMLButtonElement, HeartProps>(
  (
    {
      size = 'md',
      active,
      defaultActive = false,
      onActiveChange,
      confetti = true,
      disabled,
      className,
      onClick,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) => {
    const isControlled = active !== undefined;
    const [internalActive, setInternalActive] = useState(defaultActive);
    const isActive = isControlled ? active : internalActive;

    const [bursts, setBursts] = useState<{ id: number; shards: Shard[] }[]>([]);
    const burstIdRef = useRef(0);
    /* With the OS "Reduce Motion" setting on, skip the burst entirely —
       the colour fill and the press are feedback enough. */
    const reduceMotion = useReducedMotion();

    const controls = useAnimationControls();
    // Track hover via a ref so tap-release knows whether to settle to the
    // hover scale (1.03) or rest (1). Framer's hover gestures only fire for
    // a real mouse, and we skip them at tablet/mobile widths, so there this
    // stays false and release returns to 1.
    const isHoveredRef = useRef(false);
    // Timestamp of the last gesture-driven toggle. The press shrinks the
    // button to 0.86, so a pointerup near the padded edge can land outside
    // the now-smaller element and the native `click` never fires. We toggle
    // from Framer's onTap (which tracks the pointer globally and always
    // fires), then guard the native click so a real keyboard activation
    // (click with no preceding tap) still toggles exactly once.
    const lastTapToggleRef = useRef(0);

    const toggleActive = useCallback(() => {
      if (disabled) return isActive;
      const next = !isActive;
      if (!isControlled) setInternalActive(next);
      onActiveChange?.(next);

      if (confetti && next && !reduceMotion) {
        const id = burstIdRef.current++;
        setBursts((prev) => [...prev, { id, shards: makeShards(24, 31, 0.2, 0.3) }]);
      }
      return next;
    }, [confetti, disabled, isActive, isControlled, onActiveChange, reduceMotion]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        // Skip if onTap just handled this interaction (pointer activation);
        // only toggle here for keyboard activation, where onTap never fired.
        if (Date.now() - lastTapToggleRef.current > 700) toggleActive();
        onClick?.(e);
      },
      [toggleActive, onClick],
    );

    const removeBurst = useCallback((id: number) => {
      setBursts((prev) => prev.filter((b) => b.id !== id));
    }, []);

    const button = (
      <motion.button
        ref={ref}
        type="button"
        className={cn(
          styles.button,
          styles[size],
          isActive && styles.active,
          className,
        )}
        disabled={disabled}
        aria-pressed={isActive}
        aria-label={ariaLabel ?? (isActive ? 'Unlike' : 'Like')}
        animate={controls}
        initial={{ scale: 1 }}
        onHoverStart={() => {
          // No hover grow at tablet/mobile widths, even with a mouse.
          if (!canHover()) return;
          isHoveredRef.current = true;
          // Snappy, no overshoot on hover-in.
          if (!disabled)
            controls.start({ scale: HOVER_SCALE, transition: springSnappy });
        }}
        onHoverEnd={() => {
          if (!isHoveredRef.current) return;
          isHoveredRef.current = false;
          if (!disabled) controls.start({ scale: 1, transition: springSnappy });
        }}
        onTapStart={(e) => {
          if (disabled) return;
          // Mouse dips in (0.86); touch grows (1.12). Same press curve either
          // way — the release rebound below settles both back to rest.
          const scale = isTouchPointer(e) ? TOUCH_PRESS_SCALE : 0.86;
          controls.start({ scale, transition: PRESS_TRANSITION });
        }}
        onTap={() => {
          if (disabled) return;
          // Toggle here rather than on native click: onTap fires reliably for
          // the whole hit area even after the press shrinks the button.
          lastTapToggleRef.current = Date.now();
          const nowActive = toggleActive();
          // Bouncy release on like (the only overshoot); regular snappy
          // settle on unlike so deactivating doesn't bounce.
          controls.start({
            scale: isHoveredRef.current ? HOVER_SCALE : 1,
            transition: nowActive ? REBOUND_TRANSITION : springSnappy,
          });
        }}
        onTapCancel={() => {
          if (!disabled)
            controls.start({
              scale: isHoveredRef.current ? HOVER_SCALE : 1,
              transition: REBOUND_TRANSITION,
            });
        }}
        onClick={handleClick}
        {...props}
      >
        <svg
          className={styles.svg}
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
          aria-hidden
        >
          <path
            className={styles.path}
            d="M 11.5 20.5 C 11.7 20.8 12.3 20.8 12.5 20.5 C 16 18 21.5 13.5 22 9 C 22.5 5.5 20.5 3.5 17.5 3.5 C 15.5 3.5 13.5 4.7 12.5 6.3 C 12.25 6.7 11.75 6.7 11.5 6.3 C 10.5 4.7 8.5 3.5 6.5 3.5 C 3.5 3.5 1.5 5.5 2 9 C 2.5 13.5 8 18 11.5 20.5 Z"
          />
        </svg>
      </motion.button>
    );

    if (!confetti) return button;

    return (
      <span className={styles.root}>
        <span className={styles.confettiLayer} aria-hidden>
          <AnimatePresence>
            {bursts.map((burst) => (
              <ConfettiBurst
                key={burst.id}
                shards={burst.shards}
                className={styles.confettiPiece}
                onDone={() => removeBurst(burst.id)}
              />
            ))}
          </AnimatePresence>
        </span>
        {button}
      </span>
    );
  },
);

Heart.displayName = 'Heart';
