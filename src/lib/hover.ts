/**
 * Hover effects only run on a real hovering pointer AND outside the
 * tablet/mobile breakpoints (≤ 1024px, see page.module.css). Keep in sync
 * with the `@media (hover: hover) and (min-width: 1025px)` blocks in the
 * component stylesheets — CSS can't import this constant.
 */
export const HOVER_QUERY = '(hover: hover) and (min-width: 1025px)';

/** True when hover effects should run right now. Checked at event time,
 *  so resizing across the breakpoint needs no subscription. */
export function canHover(): boolean {
  return (
    typeof window !== 'undefined' && window.matchMedia(HOVER_QUERY).matches
  );
}
