import { createAuth } from "@potatix/auth/server";
import { getDb } from "@potatix/db";

// Get database connection from singleton
console.log("[Auth] Getting database instance...");
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL environment variable is required for auth");
}

// Get the singleton DB instance
const db = getDb(dbUrl);

declare global {
  // eslint-disable-next-line no-var
  var __potatixAuth: ReturnType<typeof createAuth> | undefined;
}

if (!global.__potatixAuth) {
  console.log("[Auth] Creating auth instance...");
  global.__potatixAuth = createAuth({
    db,
    authSecret: process.env.BETTER_AUTH_SECRET!,
    webUrl: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN || '.potatix.com',
    plugins: [],
  });
}

export const auth = global.__potatixAuth; 