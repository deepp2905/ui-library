'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Button,
  Checkbox,
  Counter,
  Input,
  Slider,
  Spinner,
  Switch,
  Tabs,
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
  const [volume, setVolume] = useState(60);
  const [tab, setTab] = useState('overview');
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
        <h1 className={styles.heroTitle}>UI Library</h1>
        <p className={styles.heroSub}>
          A tasteful, neutral component set — primary #F0660D.
        </p>
      </header>

      <div className={styles.grid} ref={gridRef}>
        <Tile>
          <Button confetti>Click me</Button>
        </Tile>

        <Tile stretch>
          <Input label="Email" placeholder="you@example.com" />
        </Tile>

        <Tile>
          <Switch checked={on} onChange={setOn} aria-label="Toggle" />
        </Tile>

        <Tile>
          <Checkbox
            checked={agree}
            onChange={setAgree}
            label="I agree to the terms"
          />
        </Tile>

        <Tile stretch>
          <Slider value={volume} onChange={setVolume} showValue label="Volume" />
        </Tile>

        <Tile>
          <Counter initial={3} min={0} max={10} />
        </Tile>

        <Tile>
          <Spinner />
        </Tile>

        <Tile stretch>
          <Tabs
            items={[
              { id: 'overview', label: 'Overview', content: null },
              { id: 'specs', label: 'Specs', content: null },
              { id: 'history', label: 'History', content: null },
            ]}
            value={tab}
            onChange={setTab}
          />
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
