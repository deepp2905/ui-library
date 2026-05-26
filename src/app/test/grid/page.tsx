'use client';

import { useState } from 'react';
import {
  Checkbox,
  HoldToDelete,
  Slider,
  Switch,
  ToastProvider,
} from '@/components';
import styles from './page.module.css';

function HoldToDeleteCell() {
  return <HoldToDelete />;
}

function SliderCell() {
  const [value, setValue] = useState(64);
  return <Slider value={value} onChange={setValue} />;
}

function SwitchCell() {
  const [on, setOn] = useState(true);
  return <Switch checked={on} onChange={setOn} aria-label="Toggle" />;
}

function CheckboxCell() {
  const [agree1, setAgree1] = useState(true);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  return (
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
  );
}

const CELLS: { key: string; render: () => React.ReactNode }[] = [
  { key: 'HoldToDelete', render: () => <HoldToDeleteCell /> },
  { key: 'Slider', render: () => <SliderCell /> },
  { key: 'Switch', render: () => <SwitchCell /> },
  { key: 'Checkbox', render: () => <CheckboxCell /> },
];

function GridPageBody() {
  return (
    <main className={styles.page}>
      <div className={styles.grid}>
        {CELLS.map(({ key, render }) => (
          <div key={key} className={styles.tile}>
            <div className={styles.stage}>{render()}</div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function TestGridPage() {
  return (
    <ToastProvider>
      <GridPageBody />
    </ToastProvider>
  );
}
