'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import styles from './Avatar.module.css';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Used to derive initials and the fallback when no image is given. */
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Outline shape. 'squircle' is an iOS app-icon style. */
  shape?: 'circle' | 'squircle';
}

function initials(name?: string): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  className,
  ...props
}: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <span
      className={cn(
        styles.avatar,
        styles[size],
        shape === 'squircle' && styles.squircle,
        className,
      )}
      role="img"
      aria-label={alt ?? name ?? 'avatar'}
      {...props}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? ''}
          className={styles.image}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.fallback}>{initials(name)}</span>
      )}
    </span>
  );
}
