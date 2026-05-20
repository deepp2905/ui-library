'use client';

import { useState } from 'react';
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

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>UI Library</h1>
        <p className={styles.heroSub}>
          A tasteful, neutral component set — primary #F0660D.
        </p>
      </header>

      <div className={styles.grid}>
        <Tile>
          <Button>Continue</Button>
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
