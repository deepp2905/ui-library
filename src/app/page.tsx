'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Counter,
  HoldToDelete,
  Input,
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
  const [agree, setAgree] = useState(false);
  const [volume, setVolume] = useState(64);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
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
        <h1 className={styles.heroTitle}>UI Component Library</h1>
        <p className={styles.heroSub}>
          Orange and some fun interactions.
        </p>
      </header>



      <div className={styles.grid} ref={gridRef}>
        <Tile>
          <Button confetti>Click me</Button>
        </Tile>

        <Tile stretch>
          <Slider value={volume} onChange={setVolume} />
        </Tile>

        <Tile>
          <HoldToDelete />
        </Tile>

        <Tile>
          <Switch checked={on} onChange={setOn} aria-label="Toggle" />
        </Tile>


        <Tile>
          <Checkbox
            checked={agree}
            onChange={setAgree}
            label="Checkbox"
          />
        </Tile>

        <Tile stretch>
          <Input label="Email" placeholder="you@example.com" />
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
