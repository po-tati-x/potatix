"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AuthForm from "./auth-form";
import SocialLogin from "./social-login";
import { useSession } from "@/lib/auth/auth";

type AuthMode = "login" | "signup";

interface AuthScreenProps {
  /**
   * Fallback callback URL when none is provided through the query string.
   */
  defaultCallbackUrl?: string;

  /**
   * Initial mode when mounting – defaults to "login" so existing imports work.
   */
  initialMode?: AuthMode;
}

/**
 * Unified auth screen – toggles between login and signup in-place instead of
 * forcing a full navigation. This keeps modals lightweight and also avoids
 * hitting rewrites / 404s on course sub-domains.
 */
export default function LoginScreen({
  defaultCallbackUrl = "/dashboard",
  initialMode = "login",
}: AuthScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || defaultCallbackUrl;
  const { data: session, isPending } = useSession();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const isLoginMode = mode === "login";

  // Authenticated? Redirect immediately.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push(callbackUrl);
    }
  }, [session, isPending, router, callbackUrl]);

  // Pending session check – show a quick spinner.
  if (isPending) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="h-5 w-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
        <span className="ml-2 text-sm text-slate-500">Checking login status...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AuthForm
        isLoginMode={isLoginMode}
        callbackUrl={callbackUrl}
        onToggleMode={() => setMode(isLoginMode ? "signup" : "login")}
      />

      <SocialLogin callbackUrl={callbackUrl} />
    </div>
  );
} 