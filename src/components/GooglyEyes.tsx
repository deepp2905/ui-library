'use client';

/* GooglyEyes — a tiny pair of eyes that live above the hero heading and
   follow the cursor anywhere on the page with a smooth, softly-damped
   spring glide.

   Opinions baked in:
   - tracking is continuous: the pupil retargets every frame and a soft
     spring smooths it out — gentle lag, no darting, no jitter
   - blinks are asymmetric: lids close in ~70ms, open in ~300ms — fast
     shut, lazy open, like every blink you've ever seen. The open is a
     plain exponential ease (no spring): a bouncing lid edge reads as
     glitchy, not organic
   - the two eyes blink 35ms apart, because perfect sync reads as robotic
   - the highlight dot NEVER moves — it's the light source, not the eye
   - click anywhere → both pupils dilate briefly

   Unlike the spring-based components, the motion here is too stateful for
   framer-motion's declarative model (per-eye velocity, lids, dilation all
   integrate every frame), so it runs on a hand-rolled rAF loop instead. */

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import styles from './GooglyEyes.module.css';

/** Max pupil travel from centre, in px. Scaled to the 48px eye so the
 *  pupil never clips against the sclera edge. */
const R = 8;

/** Per-eye physics state. Everything is integrated every frame. */
interface EyeState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  lid: number;
  closing: boolean;
  blinkAt: number;
  dil: number;
  dilV: number;
}

const makeEye = (): EyeState => ({
  x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0,
  lid: 0, closing: false, blinkAt: 0, dil: 1, dilV: 0,
});

export interface GooglyEyesProps {
  className?: string;
}

export function GooglyEyes({ className }: GooglyEyesProps) {
  const eyeRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const pupilRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const lidRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];

  const st = useRef({
    cursor: null as { x: number; y: number } | null,
    lastMove: 0,
    nextWander: 0,
    nextBlink: 0,
    eyes: [makeEye(), makeEye()],
  });
  const raf = useRef(0);

  useEffect(() => {
    const s = st.current;
    const now0 = performance.now();
    s.nextBlink = now0 + 1800;
    s.nextWander = now0 + 2200;

    function onMove(e: PointerEvent) {
      s.cursor = { x: e.clientX, y: e.clientY };
      s.lastMove = performance.now();
    }
    function onLeave() {
      s.cursor = null;
    }
    function onClick() {
      const t = performance.now();
      s.eyes[0].blinkAt = t;
      s.eyes[1].blinkAt = t + 35;
      s.eyes.forEach((e) => {
        e.dilV += 0.06; // gentle dilate
      });
    }
    /* Listen on window, not the wrap: the eyes are a small flow element
       in the hero, but they should follow the cursor across the whole
       page (and react to clicks anywhere — including on the tiles). */
    window.addEventListener('pointermove', onMove);
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onClick);

    function loop() {
      const now = performance.now();

      // scheduled blink
      if (now > s.nextBlink) {
        s.eyes[0].blinkAt = now;
        s.eyes[1].blinkAt = now + 35;
        s.nextBlink = now + 2200 + Math.random() * 3200;
      }
      // idle wander: nothing moved for 2s → look somewhere random
      const idle = !s.cursor || now - s.lastMove > 2000;
      if (idle && now > s.nextWander) {
        const a = Math.random() * Math.PI * 2;
        const d = Math.random() * R;
        s.eyes.forEach((e) => {
          e.tx = Math.cos(a) * d;
          e.ty = Math.sin(a) * d;
        });
        s.nextWander = now + 900 + Math.random() * 1600;
      }

      s.eyes.forEach((e, i) => {
        const eyeEl = eyeRefs[i].current;
        const pupil = pupilRefs[i].current;
        const lid = lidRefs[i].current;
        if (!eyeEl) return;

        // desired pupil offset toward cursor
        if (!idle && s.cursor) {
          const r = eyeEl.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          const dx = s.cursor.x - cx;
          const dy = s.cursor.y - cy;
          const d = Math.hypot(dx, dy) || 1;
          const m = Math.min(R, d * 0.2);
          // Retarget every frame — the spring below does the smoothing.
          e.tx = (dx / d) * m;
          e.ty = (dy / d) * m;
        }

        // soft, well-damped spring → smooth glide with a touch of lag
        e.vx = (e.vx + (e.tx - e.x) * 0.18) * 0.72;
        e.x += e.vx;
        e.vy = (e.vy + (e.ty - e.y) * 0.18) * 0.72;
        e.y += e.vy;

        // blink: fast close, lazy open. Both strokes are plain
        // exponential eases — the open is deliberately spring-free so
        // the lid edge settles without wobbling.
        if (e.blinkAt && now >= e.blinkAt) {
          e.closing = true;
          e.blinkAt = 0;
        }
        if (e.closing) {
          e.lid += (1 - e.lid) * 0.55;
          if (e.lid > 0.96) e.closing = false;
        } else {
          e.lid *= 0.82;
        }

        // dilation spring back to 1
        e.dilV += (1 - e.dil) * 0.18;
        e.dilV *= 0.8;
        e.dil += e.dilV;

        if (pupil) {
          pupil.style.transform = `translate(${e.x}px, ${e.y}px) scale(${e.dil})`;
        }
        if (lid) {
          lid.style.transform = `scaleY(${Math.max(0, Math.min(1, e.lid))})`;
        }
      });

      raf.current = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onClick);
    };
  }, []);

  return (
    <div className={cn(styles.face, className)} aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className={styles.eye} ref={eyeRefs[i]}>
          <div className={styles.pupil} ref={pupilRefs[i]}>
            <span className={styles.glint} />
          </div>
          <div className={styles.lid} ref={lidRefs[i]} />
        </div>
      ))}
    </div>
  );
}
