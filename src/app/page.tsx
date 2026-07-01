'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Checkbox,
  GooglyEyes,
  Heart,
  HoldToDelete,
  Slider,
  Switch,
  ToastProvider,
} from '@/components';
import styles from './page.module.css';

function Tile({
  stretch = false,
  top = false,
  children,
}: {
  stretch?: boolean;
  /** Anchor content to the top of the tile (e.g. a menu that opens downward). */
  top?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        styles.tile,
        stretch && styles.tileStretch,
        top && styles.tileTop,
      ]
        .filter(Boolean)
        .join(' ')}
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
      // Only convert vertical wheel → horizontal scroll while the grid
      // still has room to scroll in that direction. Once it hits the
      // start/end edge, let the event fall through so the page can
      // scroll vertically (e.g. to reach content below the fold).
      const maxScrollLeft = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft >= maxScrollLeft - 1;
      if ((pixels < 0 && atStart) || (pixels > 0 && atEnd)) return;
      el.scrollLeft += pixels;
      e.preventDefault();
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
  }, []);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <GooglyEyes />
        <h1 className={styles.heroTitle}>
          Interactions crafted from hundreds of iterations,
           fine-tuning details and motion.
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
