import { cn } from '@/lib/cn';
import styles from './Skeleton.module.css';

export interface SkeletonProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: number | string;
  height?: number | string;
}

export function Skeleton({
  variant = 'rect',
  width,
  height,
  className,
  style,
  ...props
}: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(styles.skeleton, styles[variant], className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
}
