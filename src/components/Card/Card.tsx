'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/cn';
import { springSoft } from '@/lib/motion';
import styles from './Card.module.css';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Visual treatment of the card border/elevation. */
  variant?: 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Lift slightly on hover — use for clickable cards. */
  interactive?: boolean;
}

export function Card({
  variant = 'outlined',
  padding = 'md',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      className={cn(
        styles.card,
        styles[variant],
        styles[`pad-${padding}`],
        interactive && styles.interactive,
        className,
      )}
      whileHover={interactive ? { y: -3 } : undefined}
      transition={springSoft}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.header, className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(styles.title, className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(styles.description, className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.footer, className)} {...props} />;
}
