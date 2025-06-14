"use client";

import { useSearchParams, useRouter } from "next/navigation";
import AuthForm from "@/components/features/auth/auth-form";
import SocialLogin from "@/components/features/auth/social-login";
import { Suspense, useEffect } from "react";
import { useSession } from "@/lib/auth/auth";
import { Loader2 } from "lucide-react";

function SignupContent() {
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
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
        <span className="ml-2 text-sm text-slate-500">
          Checking login status...
        </span>
      </div>
    );
  }

  return (
    <>
      <AuthForm isLoginMode={false} callbackUrl={callbackUrl} />
      <SocialLogin callbackUrl={callbackUrl} />
    </>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 text-emerald-500 animate-spin" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
