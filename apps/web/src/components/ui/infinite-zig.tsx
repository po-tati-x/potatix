'use client';

import { cn } from '@/lib/shared/utils/cn';
import { motion } from 'framer-motion';

interface InfiniteZigProps {
  position: 'top' | 'bottom';
}

// Reusable infinite-moving zigzag SVG with animated translation.
export function InfiniteZig({ position }: InfiniteZigProps) {
  const uid = position === 'top' ? 'top' : 'bot';

  const segmentPath =
    'M0 20 L10 0 L20 20 L30 0 L40 20 L50 0 L60 20 L70 0 L80 20 L90 0 L100 20 V20 Z';

  return (
    <svg
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-x-0 h-10 w-full overflow-visible',
        position === 'top' ? 'top-2' : 'bottom-2 rotate-180',
      )}
      viewBox="0 0 200 20"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`stormGrad-${uid}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="0">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Moving group containing three segments (300 units wide) */}
      <motion.g
        animate={{ x: [0, -100] }}
        transition={{ repeat: Infinity, repeatType: 'loop', duration: 10, ease: 'linear' }}
      >
        <path d={segmentPath} fill={`url(#stormGrad-${uid})`} filter={`url(#glow-${uid})`} />
        <path d={segmentPath} fill={`url(#stormGrad-${uid})`} filter={`url(#glow-${uid})`} transform="translate(100,0)" />
        <path d={segmentPath} fill={`url(#stormGrad-${uid})`} filter={`url(#glow-${uid})`} transform="translate(200,0)" />
      </motion.g>
    </svg>
  );
} 