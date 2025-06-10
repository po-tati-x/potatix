import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, authSchema } from "@potatix/db";

// Extract domain from APP_URL, removing the protocol
const getBaseDomain = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";

  try {
    const url = new URL(appUrl);
    return url.hostname;
  } catch (error) {
    console.warn("Failed to parse NEXT_PUBLIC_APP_URL:", error);
    return "localhost";
  }
};

// Get trusted origins - simplified to just use wildcards
const getTrustedOrigins = () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) return ["https://*.localhost"];

  try {
    const url = new URL(baseUrl);
    const domain = url.hostname;

    // If we're on localhost, just return the exact URL
    if (domain === "localhost") return [baseUrl];

    // Get the root domain (e.g. example.com from sub.example.com)
    const parts = domain.split(".");
    const rootDomain =
      parts.length > 1 ? parts.slice(parts.length - 2).join(".") : domain;

    return [
      // The main URL
      baseUrl,
      // Wildcard for all subdomains
      `https://*.${rootDomain}`,
    ];
  } catch (error) {
    console.warn("Failed to parse trusted origins:", error);
    return [baseUrl || "https://localhost:3000"];
  }
};

// Get cookie domain without all the bullshit
const getCookieDomain = () => {
  const domain = getBaseDomain();

  // If it's localhost or IP, don't set a domain (browser default)
  if (domain === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(domain)) {
    return undefined;
  }

  // Get the root domain for cookies (e.g., example.com from sub.example.com)
  const parts = domain.split(".");
  if (parts.length <= 2) return domain; // Already a root domain

  // Return with dot prefix for all subdomains
  return `.${parts.slice(parts.length - 2).join(".")}`;
};

// Check if we're using HTTPS or HTTP
const isSecureConnection = () => {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return appUrl.startsWith("https://");
};

export const auth = betterAuth({
  // Database adapter
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: authSchema.user,
      session: authSchema.session,
      account: authSchema.account,
      verification: authSchema.verification,
    },
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
      maxAge: 5 * 60, // 5 minutes
    },
  },

  // Trusted origins - simple and effective
  trustedOrigins: getTrustedOrigins(),

  // Cross-subdomain cookies
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: getCookieDomain(),
    },
    defaultCookieAttributes: {
      httpOnly: true,
      secure: isSecureConnection(), // Only use secure for HTTPS connections
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    },
  },

  // URL paths
  paths: {
    signIn: "/login",
    signUp: "/signup",
    error: "/login",
    verifyEmail: "/login",
    newUser: "/dashboard",
  },

  // Auth methods
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Social providers
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account", // Always ask to select an account
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  // Secret for encryption
  secret: process.env.BETTER_AUTH_SECRET,

  // Add debug mode in development
  debug: process.env.NODE_ENV === "development",
});
