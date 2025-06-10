"use client";

export function TopBlur({
  intensity = 0.7,
  height = 130,
}: {
  intensity?: number;
  height?: number;
}) {
  return (
    <div 
      className="fixed top-0 left-0 right-0 pointer-events-none z-10"
      style={{
        height: `${height}px`,
        maskImage: 'linear-gradient(to bottom, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
        backdropFilter: `blur(${Math.min(6 * intensity, 6)}px)`,
        WebkitBackdropFilter: `blur(${Math.min(6 * intensity, 6)}px)`,
      }}
    />
  );
} 