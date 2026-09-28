'use client';

import { motion } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────
   Shared confetti burst — used by Heart and HoldToDelete so the two
   read as the same gesture. Internal; not exported from the library.

   Motion, tuned as secondary feedback that ends with the trigger's own
   settle (~0.4s):
   - dots fly out on a sharp ease-out: fast launch, hard stop
   - far dots start a touch later and travel longer, so the burst
     spreads outward instead of popping flat
   - fully opaque for the first half, then an ease-in fade, so the
     burst's outer edge reads before it dissolves
   - dots shrink 1 → 0.5 as they go — sparks burning out
   ──────────────────────────────────────────────────────────────────── */

export interface Shard {
  id: number;
  /** Diameter in px — shards are dots. */
  size: number;
  angle: number;
  distance: number;
  duration: number;
  delay: number;
}

const MIN_DISTANCE = 90;
const MAX_DISTANCE = 135;
/* Durations map to distance (near → MIN, far → MAX), plus a little
   jitter, clamped to [MIN, MAX]. Jitter stays small relative to the
   0.1s range so dots don't pile up on the bounds. */
const MIN_DURATION = 0.3;
const MAX_DURATION = 0.4;
const DURATION_JITTER = 0.03;
const MAX_DELAY = 0.06;
const DELAY_JITTER = 0.015;

const BURST_EASE = [0.16, 1, 0.3, 1] as const;
const FADE_EASE = [0.4, 0, 1, 1] as const;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Build one burst of `minCount`–`maxCount` dots. */
export function makeShards(minCount: number, maxCount: number): Shard[] {
  const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
  return Array.from({ length: count }, (_, i) => {
    const distance =
      MIN_DISTANCE + Math.random() * (MAX_DISTANCE - MIN_DISTANCE);
    const t = (distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE);
    const durationJitter = (Math.random() - 0.5) * 2 * DURATION_JITTER;
    const duration = clamp(
      MIN_DURATION + t * (MAX_DURATION - MIN_DURATION) + durationJitter,
      MIN_DURATION,
      MAX_DURATION,
    );
    const delayJitter = (Math.random() - 0.5) * 2 * DELAY_JITTER;
    const delay = Math.max(0, t * MAX_DELAY + delayJitter);
    return {
      id: i,
      size: 3 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      distance,
      duration,
      delay,
    };
  });
}

export function ConfettiBurst({
  shards,
  className,
  onDone,
}: {
  shards: Shard[];
  /** Styles each dot (position, colour, radius) — owned by the caller. */
  className: string;
  /** Fires once, when the last dot lands. */
  onDone: () => void;
}) {
  const longestId = shards.reduce(
    (acc, s) => (s.duration + s.delay > acc.duration + acc.delay ? s : acc),
    shards[0],
  ).id;
  return (
    <>
      {shards.map((s) => {
        const c = -s.size / 2;
        const x = c + Math.cos(s.angle) * s.distance;
        const y = c + Math.sin(s.angle) * s.distance;
        return (
          <motion.span
            key={s.id}
            className={className}
            style={{ width: s.size, height: s.size }}
            initial={{ x: c, y: c, opacity: 1, scale: 1 }}
            animate={{ x, y, opacity: [1, 1, 0], scale: 0.5 }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              ease: BURST_EASE,
              opacity: {
                duration: s.duration,
                delay: s.delay,
                times: [0, 0.5, 1],
                ease: ['linear', FADE_EASE],
              },
            }}
            onAnimationComplete={s.id === longestId ? onDone : undefined}
          />
        );
      })}
    </>
  );
}
