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

export function DeleteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M4 5.5v7a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5v-7" />
      <g className="lid">
        <line x1="2.5" y1="4" x2="13.5" y2="4" />
        <path d="M6 4V2.5A.5.5 0 0 1 6.5 2h3a.5.5 0 0 1 .5.5V4" />
      </g>
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
