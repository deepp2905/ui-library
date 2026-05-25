'use client';

import { useState } from 'react';
import {
  Button,
  Checkbox,
  Counter,
  HoldToDelete,
  Input,
  Slider,
  Switch,
  ToastProvider,
  useToast,
} from '@/components';
import styles from './page.module.css';

type ComponentKey =
  | 'Button'
  | 'Checkbox'
  | 'Counter'
  | 'HoldToDelete'
  | 'Input'
  | 'Slider'
  | 'Switch'
  | 'Toast';

const COMPONENTS: ComponentKey[] = [
  'Button',
  'Checkbox',
  'Counter',
  'HoldToDelete',
  'Input',
  'Slider',
  'Switch',
  'Toast',
];

function ButtonView() {
  return <Button confetti>Click me</Button>;
}

function CheckboxView() {
  const [checked, setChecked] = useState(false);
  return (
    <Checkbox
      checked={checked}
      onChange={setChecked}
      label="Test checkbox label"
    />
  );
}

function CounterView() {
  return <Counter initial={0} />;
}

function HoldToDeleteView() {
  return <HoldToDelete />;
}

function InputView() {
  return <Input label="Email" placeholder="you@example.com" />;
}

function SliderView() {
  const [value, setValue] = useState(50);
  return <Slider value={value} onChange={setValue} />;
}

function SwitchView() {
  const [on, setOn] = useState(false);
  return <Switch checked={on} onChange={setOn} aria-label="Test switch" />;
}

function ToastView() {
  const { toast } = useToast();
  return (
    <Button onClick={() => toast({ title: 'Hello from a toast' })}>
      Fire a toast
    </Button>
  );
}

function ComponentStage({ which }: { which: ComponentKey }) {
  switch (which) {
    case 'Button':
      return <ButtonView />;
    case 'Checkbox':
      return <CheckboxView />;
    case 'Counter':
      return <CounterView />;
    case 'HoldToDelete':
      return <HoldToDeleteView />;
    case 'Input':
      return <InputView />;
    case 'Slider':
      return <SliderView />;
    case 'Switch':
      return <SwitchView />;
    case 'Toast':
      return <ToastView />;
  }
}

function TestPageBody() {
  const [selected, setSelected] = useState<ComponentKey>('Button');

  return (
    <main className={styles.page}>
      <aside className={styles.panel}>
        <h2 className={styles.panelTitle}>Components</h2>
        <ul className={styles.list}>
          {COMPONENTS.map((name) => (
            <li key={name}>
              <label className={styles.row}>
                <input
                  type="radio"
                  name="component"
                  className={styles.radio}
                  checked={selected === name}
                  onChange={() => setSelected(name)}
                />
                <span>{name}</span>
              </label>
            </li>
          ))}
        </ul>
      </aside>

      <section className={styles.stage}>
        <ComponentStage which={selected} />
      </section>
    </main>
  );
}

export default function TestPage() {
  return (
    <ToastProvider>
      <TestPageBody />
    </ToastProvider>
  );
}
