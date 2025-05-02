// This file is now a stub since we're using the Fastify backend
// We're keeping it to prevent imports from breaking, but it's not functional
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";

/**
 * Primary auth configuration using better-auth
 */
export const auth = betterAuth({
  // Use drizzle adapter instead of raw pool
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  
  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true, // auto sign-in after sign-up
  },
  
  // Session settings
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh session every day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes cache
    }
  },

  // Require HTTPS in production
  cookies: {
    secure: process.env.NODE_ENV === "production",
  },
  
  // Secret key should be set in environment variables
  secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-me-in-production',
  
  // Site base URL
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Debug mode (disable in production)
  debug: process.env.NODE_ENV !== "production",
});