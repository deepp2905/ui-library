import { cn } from '@/lib/cn';
import styles from './Badge.module.css';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  /** Show a small leading status dot. */
  dot?: boolean;
}

export function Badge({
  variant = 'neutral',
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)} {...props}>
      {dot && <span className={styles.dot} aria-hidden />}
      {children}
    </span>
  );
}
