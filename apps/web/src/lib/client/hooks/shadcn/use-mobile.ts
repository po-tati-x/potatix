import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

function isMobileViewport() {
  return (
    globalThis.window !== undefined &&
    globalThis.window.innerWidth < MOBILE_BREAKPOINT
  );
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(isMobileViewport);

  React.useEffect(() => {
    if (globalThis.window === undefined) return;

    const mql = globalThis.window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );

    const handleChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches);
    };

    mql.addEventListener('change', handleChange);

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}