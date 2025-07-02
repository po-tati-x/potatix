import { ReactNode } from "react";

interface BlurProps {
  /** Content to blur */
  children: ReactNode;
  /** Intensity of the blur in px – defaults to 6 */
  amount?: number;
  /** Optional additional class names */
  className?: string;
  /** Optional translucent overlay colour (e.g. 'rgba(255,255,255,0.6)') */
  overlayColor?: string;
}

/**
 * Re-usable wrapper that visually blurs its children.
 *
 * Keeps semantics (children stay in the DOM) but obfuscates their
 * contents for teaser/paywall style UIs.
 *
 * Usage:
 *   <Blur amount={8} overlayColor="rgba(255,255,255,.6)">
 *     <SomeSecretComponent />
 *   </Blur>
 */
export default function Blur({
  children,
  amount = 6,
  className = "",
  overlayColor,
}: BlurProps) {
  return (
    <div className={`relative ${className}`} style={{ pointerEvents: "none" }}>
      {/* Blurred child content */}
      <div style={{ filter: `blur(${amount}px)` }}>{children}</div>
      {/* Optional colour overlay to strengthen the obfuscation */}
      {overlayColor && (
        <div
          className="absolute inset-0"
          style={{ background: overlayColor }}
          aria-hidden="true"
        />
      )}
    </div>
  );
} 