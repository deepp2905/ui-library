'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Checkbox,
  Heart,
  HoldToDelete,
  Slider,
  Switch,
  ToastProvider,
} from '@/components';
import styles from './page.module.css';

function Tile({
  stretch = false,
  children,
}: {
  stretch?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={stretch ? `${styles.tile} ${styles.tileStretch}` : styles.tile}
    >
      {children}
    </div>
  );
}

function Showcase() {
  const [on, setOn] = useState(true);
  const [agree1, setAgree1] = useState(true);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const [volume, setVolume] = useState(64);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      /* Only hijack the wheel when the grid is actually scrolling
         horizontally (desktop layout). On tablet/mobile the grid is a
         vertical stack — let the page scroll normally. */
      const isHorizontalLayout = el.scrollWidth > el.clientWidth;
      if (!isHorizontalLayout) return;
      // If the user is already scrolling horizontally (shift+wheel or
      // horizontal trackpad swipe), let the native handler do it.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      // deltaMode 0 = pixels (trackpad / precision wheel),
      // deltaMode 1 = lines (classic mouse wheel — multiply to match
      // the browser's own line-to-pixel conversion of ~16px/line).
      const pixels = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      el.scrollLeft += pixels;
      e.preventDefault();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Fun Components & Interactions crafted with hundreds of iterations,
          subtle motion, and fine tuning the final layer of polish.
        </h1>
        <p className={styles.heroSub}>
          Created by{' '}
          <a
            className={styles.heroLink}
            href="https://deeepatel.com"
            target="_blank"
            rel="noreferrer"
          >
            Deep Patel
          </a>
        </p>
      </header>

      <div className={styles.grid} ref={gridRef}>
        <Tile>
          <Switch checked={on} onChange={setOn} aria-label="Toggle" />
        </Tile>

        <Tile>
          <HoldToDelete />
        </Tile>

        <Tile stretch>
          <Slider value={volume} onChange={setVolume} />
        </Tile>

        <Tile>
          <Heart size="lg" />
        </Tile>


        <Tile>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--c-space-3)',
            }}
          >
            <Checkbox
              checked={agree1}
              onChange={setAgree1}
              label="Buy more orange juice"
            />
            <Checkbox
              checked={agree2}
              onChange={setAgree2}
              label="Polish the interaction details"
            />
            <Checkbox
              checked={agree3}
              onChange={setAgree3}
              label="Ship it before midnight"
            />
          </div>
        </Tile>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <Showcase />
    </ToastProvider>
  );
}
