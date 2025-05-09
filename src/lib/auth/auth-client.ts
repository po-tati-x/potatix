import { createAuthClient } from "better-auth/client";
import { emailOTPClient } from "better-auth/client/plugins";

// Get the base URL from window or fallback in SSR contexts
const getBaseUrl = () => {
  return typeof window !== 'undefined'
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

/**
 * Auth client for client-side authentication
 * 
 * This client is used for all client-side authentication operations
 * including sign in, sign up, sign out, and email verification
 */
export const authClient = createAuthClient({
  // Explicitly set the base URL to match the server
  baseURL: getBaseUrl(),
  
  // Enable debug logging in development
  debug: process.env.NODE_ENV === 'development',
  
  plugins: [
    emailOTPClient(),
  ]
});

// Export convenience methods for more explicit imports
export const { signIn, signUp, signOut } = authClient;
