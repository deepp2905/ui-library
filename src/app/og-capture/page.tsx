import { notFound } from 'next/navigation';
import { site } from '@/lib/site';
import { Mosaic } from './Mosaic';

/* Dev-only stage for the social image. scripts/brand-assets.mjs opens
   this page in headless Edge/Chrome at 2x and saves the render as
   public/og.png (+ GitHub preview, README hero). Production builds 404. */
export const metadata = { robots: { index: false, follow: false } };

export default function OgCapturePage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <Mosaic wordmark={site.name} author={site.author.name} domain={site.url.replace('https://', '')} />;
}
