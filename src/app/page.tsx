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
  title,
  stretch = false,
  children,
}: {
  title: string;
  stretch?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.tileGroup}>
      <div
        className={
          stretch ? `${styles.tile} ${styles.tileStretch}` : styles.tile
        }
      >
        {children}
      </div>
      <h2 className={styles.tileTitle}>{title}</h2>
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
        <Tile title="Button">
          <Button>Continue</Button>
        </Tile>

        <Tile title="Input" stretch>
          <Input label="Email" placeholder="you@example.com" />
        </Tile>

        <Tile title="Switch">
          <Switch checked={on} onChange={setOn} aria-label="Toggle" />
        </Tile>

        <Tile title="Checkbox">
          <Checkbox
            checked={agree}
            onChange={setAgree}
            label="I agree to the terms"
          />
        </Tile>

        <Tile title="Slider" stretch>
          <Slider value={volume} onChange={setVolume} showValue label="Volume" />
        </Tile>

        <Tile title="Counter">
          <Counter initial={3} min={0} max={10} />
        </Tile>

        <Tile title="Spinner">
          <Spinner />
        </Tile>

        <Tile title="Tabs" stretch>
          <Tabs
            items={[
              { id: 'overview', label: 'Overview', content: 'Overview panel.' },
              { id: 'specs', label: 'Specs', content: 'Specs panel.' },
              { id: 'history', label: 'History', content: 'History panel.' },
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
