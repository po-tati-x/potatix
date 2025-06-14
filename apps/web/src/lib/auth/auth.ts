"use client";

import { createAuthClient } from "@potatix/auth/client";

export const authClient = createAuthClient({
  // Use relative URL so requests go to current origin (supports sub-domains)
  apiBaseUrl:
    typeof window !== "undefined"
      ? ""
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient; 