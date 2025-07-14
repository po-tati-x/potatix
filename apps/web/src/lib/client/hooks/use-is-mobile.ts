import { useEffect, useState } from 'react';

export function useIsMobile(maxWidth = 768): boolean {
  const query = `(max-width: ${maxWidth}px)`;

  const getMatch = () =>
    globalThis.window !== undefined &&
    globalThis.window.matchMedia(query).matches;

  const [isMobile, setIsMobile] = useState<boolean>(getMatch);

  useEffect(() => {
    if (globalThis.window === undefined) return;

    const media = globalThis.window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Safari < 14 fallback
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