'use client';

import { motion } from 'framer-motion';

/* ────────────────────────────────────────────────────────────────────
   Shared confetti burst — used by Heart and HoldToDelete so the two
   read as the same gesture. Internal; not exported from the library.

   Motion (flight duration is set per caller via makeShards):
   - dots fly out on a quick launch that brakes softly into place
   - far dots start a touch later and travel longer, so the burst
     spreads outward instead of popping flat
   - fully opaque for the first half, then an ease-in fade, so the
     burst's outer edge reads before it dissolves
   - dots grow 0.6 → 1 as they leave the centre
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
/* Durations map to distance (near → min, far → max), plus a little
   jitter, clamped to [min, max]. Jitter stays small relative to a
   ~0.1s range so dots don't pile up on the bounds. Pass min === max
   for one fixed duration. */
const DURATION_JITTER = 0.03;
const MAX_DELAY = 0.06;
const DELAY_JITTER = 0.015;

const BURST_EASE = [0, 0.55, 0.45, 1] as const;
const FADE_EASE = [0.4, 0, 1, 1] as const;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Build one burst of `minCount`–`maxCount` dots, each flying for
 *  `minDuration`–`maxDuration` seconds depending on distance. */
export function makeShards(
  minCount: number,
  maxCount: number,
  minDuration: number,
  maxDuration: number,
): Shard[] {
  const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
  return Array.from({ length: count }, (_, i) => {
    const distance =
      MIN_DISTANCE + Math.random() * (MAX_DISTANCE - MIN_DISTANCE);
    const t = (distance - MIN_DISTANCE) / (MAX_DISTANCE - MIN_DISTANCE);
    const durationJitter = (Math.random() - 0.5) * 2 * DURATION_JITTER;
    const duration = clamp(
      minDuration + t * (maxDuration - minDuration) + durationJitter,
      minDuration,
      maxDuration,
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
            initial={{ x: c, y: c, opacity: 1, scale: 0.6 }}
            animate={{ x, y, opacity: [1, 1, 0], scale: 1 }}
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
