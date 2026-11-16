import { absoluteUrl, faq, interactions, site } from '@/lib/site';
import { Home } from './_components/Showcase';

/* Structured data for search and answer engines, linked by @id:
   WebSite → publisher Person; WebApplication (the showcase itself);
   FAQPage. Rendered from a server component so it's in the initial HTML. */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': absoluteUrl('/#website'),
      url: absoluteUrl('/'),
      name: site.name,
      description: site.description,
      inLanguage: site.language,
      publisher: { '@id': absoluteUrl('/#author') },
    },
    {
      '@type': 'Person',
      '@id': absoluteUrl('/#author'),
      name: site.author.name,
      url: site.author.url,
    },
    {
      '@type': 'WebApplication',
      '@id': absoluteUrl('/#app'),
      name: site.name,
      url: absoluteUrl('/'),
      description: site.description,
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Any (web browser)',
      browserRequirements: 'Requires JavaScript.',
      isAccessibleForFree: true,
      inLanguage: site.language,
      image: absoluteUrl(site.ogImage),
      featureList: interactions.map((i) => `${i.name}: ${i.summary}`),
      keywords: site.keywords.join(', '),
      author: { '@id': absoluteUrl('/#author') },
      isPartOf: { '@id': absoluteUrl('/#website') },
    },
    {
      '@type': 'FAQPage',
      '@id': absoluteUrl('/#faq'),
      isPartOf: { '@id': absoluteUrl('/#website') },
      about: { '@id': absoluteUrl('/#app') },
      mainEntity: faq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        // Escape "<" so no string in the data can close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <Home />
    </>
  );
}
