import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Comparison grid',
  alternates: { canonical: '/test/grid' },
};

export default function GridLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
