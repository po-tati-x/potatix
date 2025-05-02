import { createAuthClient } from "better-auth/react";

// Get the base URL for auth endpoints
const getBaseUrl = () => {
  // Use current domain or fall back to environment variable
  return typeof window !== 'undefined' 
    ? window.location.origin
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
};

// Create and export the auth client instance
export const authClient = createAuthClient({
  // The baseURL is optional if you're using the same domain
  baseURL: getBaseUrl(),
  
  // We can remove custom endpoint mappings as better-auth already
  // uses the correct paths by default
});

// Export commonly used methods for convenience
export const { 
  signIn, 
  signUp, 
  signOut, 
  useSession,
  getSession
} = authClient; 