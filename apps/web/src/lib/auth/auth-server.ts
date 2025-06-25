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
    webUrl: env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL ?? "https://potatix.com",
    cookieDomain: env.AUTH_COOKIE_DOMAIN ?? '.ptx.com',
    plugins: [],
  });
}

export const auth = global.__potatixAuth; 