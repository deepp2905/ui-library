# Fun Components & Interactions

A little playground of components that feel nice to poke at. Built with hundreds of iterations, a lot of subtle motion, and way too much time spent on the final layer of polish.

**Go play:** https://fun-components-and-interactions.vercel.app/

## What's on the homepage

A grid of tiles you can scroll sideways, each one a component begging to be touched:

- **Switch** — flick it on and off and watch it settle.
- **Hold to Delete** — press and *hold*; let go too early and nothing happens. The little trash can reacts as you go.
- **Slider** — drag it around. The thumb has a springy bounce that overshoots just a touch before landing.
- **Heart** — tap to like. It dips on press, rebounds with a bouncy overshoot, and bursts a little confetti on the way up.
- **Checkbox** — a tidy stack of checks that tick in with a satisfying little pop.

Scroll the grid sideways with your mouse wheel on desktop; on a phone the tiles just stack and scroll like normal.

## The rest of the box

The homepage only shows a few favourites. The component library in [`src/components/`](src/components/) has more to play with — `Button`, `Counter`, `Input`, and a `Toast` system (`ToastProvider` + `useToast`) alongside the ones above. Import them from one place:

```ts
import { Button, Counter, Input, Switch, useToast } from '@/components';
```

## Running it locally

```bash
npm install
npm run dev
```

Then open it up and start clicking things.
