"use client";

import { useEffect, useState, useRef } from 'react';

export function BottomBlur({
  intensity = 0.8,
  height = 150,
}: {
  intensity?: number;
  height?: number;
}) {
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    // Find the footer element
    const footer = document.querySelector('footer');
    
    if (!footer) return;
    
    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Update state based on footer visibility
          setIsFooterVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 } // Trigger when 10% of footer is visible
    );
    
    // Start observing the footer
    observerRef.current.observe(footer);
    
    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);
  
  // Don't render if footer is visible
  if (isFooterVisible) return null;
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 pointer-events-none z-10"
      style={{
        height: `${height}px`,
        maskImage: 'linear-gradient(to top, black, transparent)',
        WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        backdropFilter: `blur(${Math.min(8 * intensity, 8)}px)`,
        WebkitBackdropFilter: `blur(${Math.min(8 * intensity, 8)}px)`,
      }}
    />
  );
} 