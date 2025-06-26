"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import AuthForm from "./auth-form";
import SocialLogin from "./social-login";
import { useSession } from "@/lib/auth/auth";

interface SignupScreenProps {
  /**
   * Fallback callback URL when none is provided through the query string.
   */
  defaultCallbackUrl?: string;
}

/**
 * Reusable signup UI with email / password + social providers.
 */
export default function SignupScreen({ defaultCallbackUrl = "/dashboard" }: SignupScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || defaultCallbackUrl;
  const { data: session, isPending } = useSession();

  // Redirect away if the user is already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push(callbackUrl);
    }
  }, [session, isPending, router, callbackUrl]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-5 w-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
        <span className="ml-2 text-sm text-slate-500">Checking login status...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AuthForm isLoginMode={false} callbackUrl={callbackUrl} />

      <SocialLogin callbackUrl={callbackUrl} />
    </div>
  );
} 