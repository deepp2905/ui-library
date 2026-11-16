import { absoluteUrl, faq, interactions, site } from '@/lib/site';

/* llms.txt (https://llmstxt.org): a plain-Markdown summary for answer
   engines and LLM agents. Generated from the same site config as the
   metadata so the two can't drift. Prerendered at build time. */
export const dynamic = 'force-static';

export function GET() {
  const body = `# ${site.name}

> ${site.description}

${site.name} is a public, single-page showcase of small UI interactions by [${site.author.name}](${site.author.url}). Every interaction is a working React component you can try directly in the browser; nothing needs to be installed and there is no sign-in.

## What's on the page

${interactions.map((i) => `- **${i.name}**: ${i.summary}`).join('\n')}

## How to use it

- Open ${absoluteUrl('/')} and interact with each tile: click, press and hold, drag or hover.
- On desktop the tiles scroll sideways with the mouse wheel or trackpad. At 1024px wide and below they stack vertically.
- Reduced motion is respected when the operating system requests it.

## Shareable URLs

- ${absoluteUrl('/')}: the homepage and the only canonical URL. The app has no URL parameters or per-component pages, so links to individual interactions aren't available.

## How it works

- Built with Next.js 15 (App Router), React 18 and TypeScript.
- Motion uses Framer Motion springs and transitions; styles use CSS Modules with shared design tokens (an orange #F0660D brand colour on warm neutrals, Geist typeface).
- The components are not published as an npm package. To reuse one, copy its .tsx and .module.css files with the shared tokens and helpers, and install framer-motion.

## FAQ

${faq.map(({ q, a }) => `### ${q}\n\n${a}`).join('\n\n')}

## Links

- [Live site](${absoluteUrl('/')})
- [About the creator](${site.author.url})
- [Sitemap](${absoluteUrl('/sitemap.xml')})
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
