# Fun Components & Interactions

A small library of polished React components and micro-interactions, crafted with subtle motion and fine-tuned detail.

**Live demo:** https://fun-components-and-interactions.vercel.app/

## What's on the homepage

The homepage shows a horizontally-scrolling grid of tiles, each presenting one interactive component:

- **Switch** — an animated on/off toggle.
- **Hold to Delete** — a button you press and hold to confirm deletion, with an animated trash-can icon.
- **Slider** — a value slider with a springy thumb.
- **Checkbox** — a stacked group of labeled checkboxes.

On desktop the grid scrolls horizontally (the mouse wheel is mapped to horizontal scroll); on tablet and mobile the tiles stack vertically.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- React 18 + TypeScript
- [Framer Motion](https://www.framer.com/motion/) for animation
- CSS Modules with design tokens

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run typecheck
```
