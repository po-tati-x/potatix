import { createAuthClient } from "better-auth/client";

// Get the base URL from window or fallback in SSR contexts
const getBaseUrl = () => {
  return typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL;
};

/**
 * Auth client for client-side authentication
 */
export const authClient = createAuthClient({
  // Explicitly set the base URL to match the server
  baseURL: getBaseUrl(),
});

// Export convenience methods for more explicit imports
export const { signIn, signUp, signOut } = authClient;
