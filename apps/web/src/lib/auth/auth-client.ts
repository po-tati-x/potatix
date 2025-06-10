import { createAuthClient } from "better-auth/client";

/**
 * Auth client for client-side authentication
 * 
 * For cross-subdomain auth, the baseURL should consistently point 
 * to the main domain's API endpoint, not the current subdomain.
 */
export const authClient = createAuthClient({
  // Always use the main domain for auth requests, not the current subdomain
  // This ensures consistent auth behavior across all subdomains
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  
  // Explicitly specify the credentials mode to include cookies
  fetchOptions: {
    credentials: 'include',
    mode: 'cors',
  }
});

// Export convenience methods for more explicit imports
export const { signIn, signUp, signOut } = authClient;
