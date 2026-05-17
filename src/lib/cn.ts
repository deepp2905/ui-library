/**
 * Tiny className joiner. Filters out falsy values so conditional
 * classes can be written inline: cn(styles.base, active && styles.on).
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
