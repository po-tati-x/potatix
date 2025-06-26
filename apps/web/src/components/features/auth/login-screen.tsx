"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

import AuthForm from "./auth-form";
import SocialLogin from "./social-login";
import { useSession } from "@/lib/auth/auth";

interface LoginScreenProps {
  /**
   * Fallback callback URL when none is provided through the query string.
   * For root login we default to "/dashboard"; for course viewer we usually
   * provide something like `/viewer/${slug}`.
   */
  defaultCallbackUrl?: string;
}

/**
 * Reusable login UI with email / password + social providers.
 * Note: This is a *client component* because it relies on hooks from Next.js
 * navigation and our auth library.
 */
export default function LoginScreen({ defaultCallbackUrl = "/dashboard" }: LoginScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || defaultCallbackUrl;
  const { data: session, isPending } = useSession();

  // If already authenticated, bounce away immediately.
  useEffect(() => {
    if (!isPending && session?.user) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

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
      <AuthForm isLoginMode callbackUrl={callbackUrl} />

      <SocialLogin callbackUrl={callbackUrl} />

      <div className="mt-5 pt-5 border-t border-slate-200">
        <div className="text-center text-sm text-slate-600">
          <span>Don&apos;t have an account?</span>
          <Link
            href={`/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="ml-1.5 font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center"
          >
            Create account <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
} 