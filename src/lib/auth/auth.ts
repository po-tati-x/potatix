import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, authSchema } from "@/db";

// Get the base domain from environment or default to localhost
const getBaseDomain = () => {
  // Use the explicit base domain if available
  if (process.env.NEXT_PUBLIC_BASE_DOMAIN) {
    return process.env.NEXT_PUBLIC_BASE_DOMAIN;
  }
  
  // Fallback to parsing from APP_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    const url = new URL(appUrl);
    return url.hostname;
  } catch (error) {
    console.warn('Failed to parse NEXT_PUBLIC_APP_URL:', error);
    return 'localhost';
  }
};

// Determine trusted origins for auth system
const getTrustedOrigins = () => {
  const baseDomain = getBaseDomain();
  const isDevelopment = process.env.NODE_ENV === 'development';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Extract protocol from base URL
  let protocol = 'http:';
  try {
    protocol = new URL(baseUrl).protocol;
  } catch {
    console.warn('Failed to parse protocol from NEXT_PUBLIC_APP_URL');
  }
  
  // Development mode needs explicit origins including localhost and port
  if (isDevelopment) {
    return [
      // Base origins
      baseUrl, // The main URL (e.g., http://localhost:3000)
      `${protocol}//${baseDomain}:3000`, // Base domain with port
      
      // Wildcards in both formats
      `${protocol}//*.${baseDomain}:3000`, // Protocol-specific wildcard with port
      `*.${baseDomain}:3000`, // Protocol-agnostic wildcard with port
      
      // Common subdomains
      `${protocol}//www.${baseDomain}:3000`,
      `${protocol}//app.${baseDomain}:3000`,
      `${protocol}//api.${baseDomain}:3000`,
      
      // Known course subdomains
      `${protocol}//danchess.${baseDomain}:3000`, // Explicitly add danchess subdomain
    ];
  }
  
  // Production origins
  return [
    // Base domains
    `${protocol}//${baseDomain}`, // Base domain
    `${protocol}//www.${baseDomain}`, // www subdomain
    
    // Wildcards in both formats
    `${protocol}//*.${baseDomain}`, // Protocol-specific wildcard
    `*.${baseDomain}`, // Protocol-agnostic wildcard
    
    // Common subdomains without port
    `${protocol}//app.${baseDomain}`,
    `${protocol}//api.${baseDomain}`,
    
    // Known course subdomains
    `${protocol}//danchess.${baseDomain}`, // Explicitly add danchess subdomain
  ];
};

// Get cookie domain that works for the main domain and all subdomains
const getCookieDomain = () => {
  const baseDomain = getBaseDomain();
  
  // If it's localhost or an IP, don't set a cookie domain (browser default behavior works)
  if (baseDomain === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(baseDomain)) {
    return undefined;
  }
  
  // For a real domain, prefix with a dot to include all subdomains
  return `.${baseDomain}`;
};

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
  
  // Session configuration
  session: {
    expiresIn: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60 // 5 minutes
    }
  },
  
  // CORS configuration
  trustedOrigins: getTrustedOrigins(),
  
  // PROPERLY CONFIGURED CROSS-SUBDOMAIN COOKIES - THIS IS THE FIXED PART
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: getCookieDomain(),
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    }
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
  
  // Add debug mode in development
  debug: process.env.NODE_ENV === 'development',
});