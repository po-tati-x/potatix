"use client";

import { useEffect, useState } from "react";
import { signOut as authSignOut } from "@/lib/auth/auth";
import { z } from "zod";

export interface User {
  id: string;
  name?: string | undefined;
  email: string;
  image?: string | undefined;
}

export interface Session {
  user?: User | undefined;
}

// Runtime validation schema for session payload
const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string(),
  image: z.string().nullable().optional(),
});

const sessionSchema = z.object({
  user: userSchema.nullable().optional(),
});

export function useSession() {
  // State – undefined until fetched, then populated or {} when unauthenticated
  const [session, setSession] = useState<Session | undefined>();
  const [isPending, setPending] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const raw = (await response.json()) as unknown;
        const parsed = sessionSchema.parse(raw);
        // Normalise null → undefined for user field to satisfy Session type
        const normalized: Session = parsed.user
          ? {
              user: {
                id: parsed.user.id,
                email: parsed.user.email,
                name: parsed.user.name ?? undefined,
                image: parsed.user.image ?? undefined,
              },
            }
          : {};
        setSession(normalized);
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setPending(false);
      }
    };

    void fetchSession();
  }, []);

  return {
    data: session,
    isPending,
  } as const;
}

export const signOut = async () => {
  try {
    // First try the better-auth client's signOut method
    await authSignOut({
      fetchOptions: {
        onSuccess: () => {
          // Force the browser to redirect to the login page after signing out
          globalThis.location.href = "/login";
        },
        onError: (error) => {
          console.error("Error with auth client signOut:", error);
          // Fallback to manual endpoint call if client method fails
          globalThis.location.href = "/login";
        },
      },
    });
  } catch (error) {
    console.error("Failed to sign out:", error);
    // Force the browser to redirect to the login page even if signOut fails
    globalThis.location.href = "/login";
  }
};
