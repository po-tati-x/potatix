import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP } from "better-auth/plugins";
import { sendOTPEmail } from "@/lib/auth/email";
import { db, authSchema } from "@/db";

// Validate environment vars early to avoid runtime issues
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

if (!process.env.NEXT_PUBLIC_APP_URL) {
  console.warn("NEXT_PUBLIC_APP_URL not set. Using localhost as fallback.");
}

/**
 * Server-side auth configuration with minimal options to avoid errors
 */
export const auth = betterAuth({
  // Use drizzle adapter with minimal config
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification
    }
  }),
  
  // Basic config
  config: {
    siteName: "Potatix",
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    session: {
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    paths: {
      signIn: '/login',
      signUp: '/signup',
      error: '/login',
      verifyEmail: '/login',
      newUser: '/dashboard'
    }
  },
  
  // Basic email & password authentication
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    autoSignIn: false,
  },
  
  // Email OTP plugin for verification
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      async sendVerificationOTP({ email, otp, type }) {
        try {
          const emailType = type === 'sign-in' 
            ? 'sign-in' 
            : type === 'email-verification'
              ? 'email-verification'
              : 'password-reset';
          
          await sendOTPEmail({
            to: email,
            emailType,
            otp,
            expiresIn: "5 minutes"
          });
        } catch (error) {
          console.error("Failed to send OTP email:", error);
          throw new Error("Failed to send verification code");
        }
      },
      otpLength: 6,
      expiresIn: 300,
    })
  ],
  
  // Secret
  secret: process.env.BETTER_AUTH_SECRET,
});