'use client';

import { useState } from 'react';
import { Checkbox, HoldToDelete, Slider, Switch } from '@/components';
import styles from './og.module.css';

function Cell({ stretch, children }: { stretch?: boolean; children: React.ReactNode }) {
  return (
    <div className={[styles.tile, stretch && styles.stretch].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}

export function Mosaic({ wordmark, author, domain }: { wordmark: string; author: string; domain: string }) {
  const [on, setOn] = useState(true);
  const [value, setValue] = useState(64);
  const [checked, setChecked] = useState(true);
  return (
    <main className={styles.stage}>
      {/* Keep the Next.js dev-tools badge out of the capture. */}
      <style>{'nextjs-portal{display:none!important}'}</style>
      <div className={styles.grid}>
        <Cell>
          <Switch checked={on} onChange={setOn} aria-label="Toggle" />
        </Cell>
        <Cell>
          <HoldToDelete />
        </Cell>
        <Cell stretch>
          <Slider value={value} onChange={setValue} className={styles.slider} />
        </Cell>
        <Cell>
          <Checkbox checked={checked} onChange={setChecked} label="Polish the interaction details" />
        </Cell>
      </div>
      <footer className={styles.footer}>
        <span className={styles.name}>{wordmark}</span>
        <span className={styles.by}>by {author}</span>
        <span className={styles.domain}>{domain}</span>
      </footer>
    </main>
  );
}
