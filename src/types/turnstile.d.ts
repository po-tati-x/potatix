// Type definitions for Cloudflare Turnstile
export interface TurnstileInstance {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: 'light' | 'dark' | 'auto';
      callback?: (token: string) => void;
      'error-callback'?: () => void;
      'expired-callback'?: () => void;
      'timeout-callback'?: () => void;
    }
  ) => void;
  reset: (container: HTMLElement) => void;
  remove: (container: HTMLElement) => void;
}

declare global {
  interface Window {
    turnstile: TurnstileInstance;
  }
}

export {}; 