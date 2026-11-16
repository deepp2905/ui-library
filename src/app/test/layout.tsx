import type { Metadata } from 'next';

/* /test and /test/grid are manual demo pages for development. Keep them
   reachable but out of search results; "follow" still lets crawlers
   discover links from them. */
export const metadata: Metadata = {
  title: 'Component stage',
  robots: { index: false, follow: true },
  alternates: { canonical: '/test' },
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
