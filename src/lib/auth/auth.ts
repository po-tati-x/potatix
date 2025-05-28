import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, authSchema } from "@/db";

export const auth = betterAuth({
  // Database adapter configuration
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification
    }
  }),
  
  // Site configuration
  siteName: "Potatix.com",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL,
  
  // Session configuration - using default cookie-based sessions
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  
  // URL paths
  paths: {
    signIn: '/login',
    signUp: '/signup',
    error: '/login',
    verifyEmail: '/login',
    newUser: '/dashboard'
  },
  
  // Auth methods
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8
  },
  
  // Secret for encryption
  secret: process.env.BETTER_AUTH_SECRET,
});