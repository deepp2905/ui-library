/* Tell TS that side-effect CSS imports (`import './foo.css'`) are
   valid — Next.js handles them at build time, but bare TS doesn't
   know that. */
declare module '*.css';
