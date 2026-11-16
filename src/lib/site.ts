/* ============================================================
   Site identity — single source of truth for SEO and branding.
   Metadata, robots.txt, sitemap, web manifest, llms.txt, JSON-LD
   and the README all describe the site using these values. Change
   copy here, not in the individual files.
   ============================================================ */

export const site = {
  name: 'Fun Components & Interactions',
  shortName: 'Interactions',
  url: 'https://interactions.deeepatel.com',
  title: 'Fun Components & Interactions by Deep Patel',
  /* ~155 characters: shown in search snippets and link previews. */
  description:
    'Playful React UI interactions by Deep Patel: a springy switch, hold-to-delete button, slider, heart with confetti and checklist, tuned for feel and motion.',
  tagline:
    'Interactions crafted from hundreds of iterations, fine-tuning details and motion.',
  keywords: [
    'UI interactions',
    'micro-interactions',
    'React components',
    'Framer Motion',
    'design engineering',
    'motion design',
    'toggle switch',
    'hold to delete',
    'slider',
    'like button',
    'checkbox',
    'googly eyes',
    'Next.js',
  ],
  locale: 'en_US',
  language: 'en',
  /* Matches --color-bg (neutral-50) so the browser UI blends with the page. */
  themeColor: '#fafafa',
  brandColor: '#f0660d',
  author: {
    name: 'Deep Patel',
    url: 'https://deeepatel.com',
  },
  /* 1200×630, served from public/. Regenerate with scripts/brand-assets.mjs. */
  ogImage: '/og.png',
  ogImageAlt:
    'Four interaction tiles from Fun Components & Interactions: an orange switch, a hold-to-delete button, a slider and a checklist item.',
} as const;

/* What's on the homepage, in display order. Tile titles, JSON-LD and
   llms.txt all read from this list so they never drift apart. */
export const interactions = [
  {
    name: 'Switch',
    summary: 'Toggles on and off, with the knob springing across the track.',
  },
  {
    name: 'Hold to Delete',
    summary:
      'Confirms only after a press and hold; letting go early cancels it.',
  },
  {
    name: 'Slider',
    summary:
      'Sets a value by dragging, with spring motion and an enlarged touch area on phones.',
  },
  {
    name: 'Tap to Like',
    summary:
      'A heart-shaped like button that bounces and bursts into confetti when tapped.',
  },
  {
    name: 'Checklist',
    summary: 'Checks items off a list with an animated checkmark.',
  },
  {
    name: 'Googly Eyes',
    summary:
      'Follows your cursor above the heading, blinks on its own and reacts to clicks.',
  },
] as const;

export type InteractionName = (typeof interactions)[number]['name'];

/* Written from what the app actually does. Used for FAQPage JSON-LD
   and llms.txt. */
export const faq = [
  {
    q: 'What is Fun Components & Interactions?',
    a: 'A showcase of small, polished UI interactions by Deep Patel. Each one is a working React component you can try in the browser: a switch, a hold-to-delete button, a slider, a tap-to-like heart that bursts into confetti, a checklist and a pair of googly eyes that follow your cursor.',
  },
  {
    q: 'What is it built with?',
    a: 'Next.js 15 (App Router), React 18, TypeScript, Framer Motion for animation and CSS Modules with shared design tokens for styling.',
  },
  {
    q: 'Can I install the components from npm?',
    a: 'No. The components are not published as a package. To reuse one, copy its .tsx and .module.css files along with the shared tokens and helpers, and install framer-motion.',
  },
  {
    q: 'Do the interactions respect reduced motion?',
    a: 'Yes. The homepage uses Framer Motion with reducedMotion set to "user", and the global stylesheet shortens CSS animations when the operating system requests reduced motion.',
  },
  {
    q: 'Does it work on phones and tablets?',
    a: 'Yes. On desktop the tiles scroll sideways with the mouse wheel or trackpad; at 1024px and below they stack vertically, and the slider has a larger touch area on phones.',
  },
  {
    q: 'Who made it?',
    a: 'Deep Patel. More of their work is at deeepatel.com.',
  },
] as const;

export const absoluteUrl = (path = '/') => new URL(path, site.url).toString();
