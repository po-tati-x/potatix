"use client";

import { useEffect, useState } from "react";
import { signOut as authSignOut } from "@/lib/auth/auth";

export type User = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export type Session = {
  user: User | null;
};

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  return {
    data: session,
    loading,
  };
};

export const signOut = async () => {
  try {
    // First try the better-auth client's signOut method
    await authSignOut({
      fetchOptions: {
        onSuccess: () => {
          // Force the browser to redirect to the login page after signing out
          window.location.href = "/login";
        },
        onError: (error) => {
          console.error("Error with auth client signOut:", error);
          // Fallback to manual endpoint call if client method fails
          window.location.href = "/login";
        },
      },
    });
  } catch (error) {
    console.error("Failed to sign out:", error);
    // Force the browser to redirect to the login page even if signOut fails
    window.location.href = "/login";
  }
};
