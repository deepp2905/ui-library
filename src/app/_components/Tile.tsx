import type { InteractionName } from '@/lib/site';
import styles from '../page.module.css';

/* A framed stage for one component. The title is a real <h2> so each
   demo is named in the server-rendered HTML (for search engines, answer
   engines and screen readers); it's positioned absolutely so the
   component stays optically centred in the tile. */
export function Tile({
  title,
  stretch = false,
  top = false,
  children,
}: {
  /** Heading shown in the tile's bottom-left corner. */
  title: InteractionName;
  stretch?: boolean;
  /** Anchor content to the top of the tile (e.g. a menu that opens downward). */
  top?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={[
        styles.tile,
        stretch && styles.tileStretch,
        top && styles.tileTop,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h2 className={styles.tileTitle}>{title}</h2>
      {children}
    </section>
  );
}
