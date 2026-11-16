import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site';

/* Only the homepage is indexable; /test pages are noindex demo pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl('/'),
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
