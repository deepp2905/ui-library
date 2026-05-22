import type { SVGProps } from 'react';

export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <line x1="3.5" y1="8" x2="12.5" y2="8" />
    </svg>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <line x1="3.5" y1="8" x2="12.5" y2="8" />
      <line x1="8" y1="3.5" x2="8" y2="12.5" />
    </svg>
  );
}
