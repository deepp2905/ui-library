import type { Metadata } from 'next';
import '@/styles/globals.css';

const description =
  'Fun Components & Interactions crafted with hundreds of iterations, subtle motion, and fine tuning the final layer of polish.';

export const metadata: Metadata = {
  title: 'Fun Components and Interactions by Deep Patel',
  description,
  openGraph: {
    title: 'Fun Components and Interactions by Deep Patel',
    description,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fun Components and Interactions by Deep Patel',
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
