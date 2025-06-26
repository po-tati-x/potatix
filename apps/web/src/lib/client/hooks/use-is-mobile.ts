import { useEffect, useState } from 'react';

export function useIsMobile(maxWidth = 768): boolean {
  const query = `(max-width: ${maxWidth}px)`;

  const getMatch = () =>
    typeof window !== 'undefined' && window.matchMedia(query).matches;

  const [isMobile, setIsMobile] = useState<boolean>(() => getMatch());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    // Initial value already set via lazy state but media might differ on slow devices
    setIsMobile(media.matches);

    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Safari < 14
      media.addListener(listener);
    }

    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return isMobile;
} 