"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AuthForm from "@/components/features/auth/auth-form";
import SocialLogin from "@/components/features/auth/social-login";
import { Suspense, useEffect } from "react";
import { useSession } from "@/lib/auth/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { data: session, isPending } = useSession();

  // Check if user is already logged in
  useEffect(() => {
    if (!isPending && session?.user) {
      // User is already logged in, redirect to dashboard
      console.log(
        "[Auth] User already authenticated, redirecting to dashboard",
      );
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  // Show loading state while checking auth
  if (isPending) {
    return (
      <div className="w-full flex items-center justify-center py-8">
        <div className="h-5 w-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
        <span className="ml-2 text-sm text-slate-500">
          Checking login status...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <AuthForm isLoginMode={true} callbackUrl={callbackUrl} />

      <SocialLogin callbackUrl={callbackUrl} />

      <div className="mt-5 pt-5 border-t border-slate-200">
        <div className="text-center text-sm text-slate-600">
          <span>Don&apos;t have an account?</span>
          <Link
            href="/signup"
            className="ml-1.5 font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center"
          >
            Create account <ArrowRight className="ml-1 w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-8">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
