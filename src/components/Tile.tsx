import { cn } from '@/lib/cn';
import styles from './Tile.module.css';

export interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Centre the tile contents both axes. */
  center?: boolean;
  /** Corner geometry. 'squircle' uses iOS-style continuous corners. */
  cornerStyle?: 'rounded' | 'squircle';
}

/**
 * Simple framed surface — useful for showcasing a single component
 * in isolation (demos, docs, empty states).
 */
export function Tile({
  center = true,
  cornerStyle = 'rounded',
  className,
  children,
  ...props
}: TileProps) {
  return (
    <div
      className={cn(
        styles.tile,
        center && styles.center,
        cornerStyle === 'squircle' && styles.squircle,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
