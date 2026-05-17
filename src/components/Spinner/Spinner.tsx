import { cn } from '@/lib/cn';
import styles from './Spinner.module.css';

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'sm' | 'md' | 'lg';
  /** Colour treatment. */
  tone?: 'primary' | 'neutral';
  label?: string;
}

export function Spinner({
  size = 'md',
  tone = 'primary',
  label = 'Loading',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(styles.spinner, styles[size], styles[tone], className)}
      {...props}
    />
  );
}
