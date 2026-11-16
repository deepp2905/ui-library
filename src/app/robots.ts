import type { MetadataRoute } from 'next';
import { absoluteUrl, site } from '@/lib/site';

/* Policy: allow everyone, including AI search and training crawlers.
   They're named explicitly so the intent is unambiguous and easy to
   change later — move a bot into a `disallow: '/'` rule to opt it out.
   /test pages are not disallowed here on purpose: they carry a noindex
   meta tag, which crawlers can only see if they're allowed to fetch. */
const aiCrawlers = [
  // OpenAI
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  // Anthropic
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google (Gemini / AI training opt-out token)
  'Google-Extended',
  // Apple
  'Applebot',
  'Applebot-Extended',
  // Others
  'CCBot',
  'Amazonbot',
  'meta-externalagent',
  'Bytespider',
  'DuckAssistBot',
  'MistralAI-User',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: aiCrawlers, allow: '/' },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: site.url,
  };
}
