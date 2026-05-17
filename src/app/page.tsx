'use client';

import { useState } from 'react';
import {
  Accordion,
  Avatar,
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Counter,
  Dropdown,
  Input,
  Modal,
  Progress,
  SegmentedControl,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Tabs,
  Tile,
  ToastProvider,
  Tooltip,
  useToast,
} from '@/components';
import styles from './page.module.css';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

function Showcase() {
  const { toast } = useToast();
  const [checked, setChecked] = useState(true);
  const [agree, setAgree] = useState(false);
  const [volume, setVolume] = useState(60);
  const [view, setView] = useState('grid');
  const [tab, setTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>UI Library</h1>
        <p className={styles.heroSub}>
          A tasteful, neutral component set — primary{' '}
          <Badge variant="primary" dot>
            #F0660D
          </Badge>
          . Next.js, TypeScript and Framer Motion, every component its own
          file.
        </p>
      </header>

      <Section title="Buttons">
        <div className={styles.row}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className={styles.col}>
          <Input label="Email" placeholder="you@example.com" />
          <Input
            label="Password"
            type="password"
            error="At least 8 characters."
          />
          <Slider
            label="Volume"
            value={volume}
            onChange={setVolume}
            showValue
          />
        </div>
      </Section>

      <Section title="Selection controls">
        <div className={styles.row}>
          <Switch checked={checked} onChange={setChecked} aria-label="Toggle" />
          <Checkbox
            checked={agree}
            onChange={setAgree}
            label="I agree to the terms"
          />
          <Counter initial={3} min={0} max={10} />
          <SegmentedControl
            options={[
              { value: 'grid', label: 'Grid' },
              { value: 'list', label: 'List' },
              { value: 'board', label: 'Board' },
            ]}
            value={view}
            onChange={setView}
          />
        </div>
      </Section>

      <Section title="Feedback">
        <div className={styles.row}>
          <Badge>Neutral</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success" dot>
            Live
          </Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Error</Badge>
          <Spinner />
        </div>
        <div className={styles.col}>
          <Progress value={70} />
          <Progress indeterminate />
        </div>
      </Section>

      <Section title="Overlays">
        <div className={styles.row}>
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Button
            variant="secondary"
            onClick={() =>
              toast({
                title: 'Saved',
                description: 'Your changes are live.',
                tone: 'success',
              })
            }
          >
            Show toast
          </Button>
          <Tooltip content="Tasteful, by default">
            <Button variant="ghost">Hover me</Button>
          </Tooltip>
          <Dropdown
            trigger={<Button variant="secondary">Menu</Button>}
            items={[
              { value: 'edit', label: 'Edit' },
              { value: 'duplicate', label: 'Duplicate' },
              { value: 'delete', label: 'Delete', destructive: true },
            ]}
            onSelect={(v) => toast({ title: `Selected: ${v}` })}
          />
        </div>
      </Section>

      <Section title="Layout & content">
        <div className={styles.grid}>
          <Card>
            <CardHeader>
              <CardTitle>Project Atlas</CardTitle>
              <CardDescription>Updated 2 hours ago</CardDescription>
            </CardHeader>
            <div className={styles.row}>
              <Avatar name="Deephem Patel" />
              <Avatar name="Ada Lovelace" size="sm" />
            </div>
            <CardFooter>
              <Button size="sm">Open</Button>
              <Button size="sm" variant="ghost">
                Share
              </Button>
            </CardFooter>
          </Card>
          <Tile>
            <Counter initial={0} />
          </Tile>
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Loading</CardTitle>
            </CardHeader>
            <div className={styles.col}>
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton height={80} />
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Disclosure">
        <Tabs
          items={[
            { id: 'overview', label: 'Overview', content: 'Overview panel.' },
            { id: 'specs', label: 'Specs', content: 'Specs panel.' },
            { id: 'history', label: 'History', content: 'History panel.' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <Accordion
          items={[
            {
              id: 'a',
              title: 'What is this library?',
              content: 'A neutral, tasteful component set.',
            },
            {
              id: 'b',
              title: 'How is colour kept consistent?',
              content:
                'Every component reads from CSS-variable design tokens.',
            },
          ]}
          defaultOpen={['a']}
        />
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete project?"
        description="This action cannot be undone."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setModalOpen(false)}>
              Delete
            </Button>
          </>
        }
      />
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
