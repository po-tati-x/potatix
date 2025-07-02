'use client';
import { cn } from '@/lib/shared/utils/cn';
import type { ReactNode, HTMLAttributes } from 'react';

// ---------------------------------------------------------------------------
// Utility – limited class map so Tailwind can statically detect the classes.
// Extend when design adds new colour variants. Keep it small => purge friendly.
// ---------------------------------------------------------------------------
const BG_MAP = {
  white: 'bg-white',
  slate: 'bg-slate-50',
  'slate-100': 'bg-slate-100',
  'slate-200': 'bg-slate-200',
  'slate-gradient': 'bg-gradient-to-b from-slate-50 via-slate-50/60 to-white',
} as const;

type BgKey = keyof typeof BG_MAP;

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Background colour token – see BG_MAP */
  bg?: BgKey;
  /** If true, wrap children in the standard responsive container */
  container?: boolean;
  /** Extra className forwarded to inner container */
  containerClassName?: string;
}

/*
 * Section – one canonical wrapper for marketing slices.
 * Handles padding, max-width container and background colour so we stop
 * duplicating `mx-auto max-w-5xl px-4 sm:px-6 lg:px-8` everywhere.
 */
export function Section({
  children,
  bg = 'white',
  className,
  container = true,
  containerClassName,
  ...rest
}: SectionProps) {
  const bgClass = BG_MAP[bg] ?? BG_MAP.white;

  const content = container ? (
    <div
      className={cn('mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8', containerClassName)}
    >
      {children}
    </div>
  ) : (
    children
  );

  return (
    <section className={cn(bgClass, className)} {...rest}>
      {content}
    </section>
  );
} 