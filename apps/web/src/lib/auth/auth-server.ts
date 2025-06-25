import { createAuth } from "@potatix/auth/server";
import { getDb } from "@potatix/db";
import { env } from "@/env.server";

// Get database connection from singleton
console.log("[Auth] Getting database instance...");
const dbUrl = env.DATABASE_URL;

// env schema ensures presence

// Get the singleton DB instance
const db = getDb(dbUrl);

declare global {
  var __potatixAuth: ReturnType<typeof createAuth> | undefined;
}

if (!global.__potatixAuth) {
  console.log("[Auth] Creating auth instance...");
  global.__potatixAuth = createAuth({
    db,
    authSecret: env.BETTER_AUTH_SECRET,
    webUrl: (() => {
      const url = env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL;
      if (!url) {
        throw new Error(
          "[Auth] BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL must be defined – refusing to default to https://potatix.com"
        );
      }
      return url;
    })(),
    cookieDomain: env.AUTH_COOKIE_DOMAIN ?? '.potatix.com',
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        scopes: ["user:email"],
      },
    },
    plugins: [],
  } as any);
}

export const auth = global.__potatixAuth; 