import { useEffect } from 'react';

let lockCount = 0;

export function useScrollLock(shouldLock: boolean): void {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;

    if (shouldLock) {
      if (lockCount === 0) {
        html.classList.add('overflow-hidden');
      }
      lockCount += 1;
    } else if (lockCount > 0) {
      lockCount -= 1;
      if (lockCount === 0) {
        html.classList.remove('overflow-hidden');
      }
    }

    return () => {
      if (shouldLock && lockCount > 0) {
        lockCount -= 1;
        if (lockCount === 0) {
          html.classList.remove('overflow-hidden');
        }
      }
    };
  }, [shouldLock]);
} 