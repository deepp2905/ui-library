import { cn } from '@/lib/cn';
import styles from './Tile.module.css';

export interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Centre the tile contents both axes. */
  center?: boolean;
}

/**
 * Simple framed surface — useful for showcasing a single component
 * in isolation (demos, docs, empty states).
 */
export function Tile({ center = true, className, children, ...props }: TileProps) {
  return (
    <div
      className={cn(styles.tile, center && styles.center, className)}
      {...props}
    >
      {children}
    </div>
  );
}
