import { Suspense } from "react";

import SignupScreen from "@/components/features/auth/signup-screen";

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          Loading...
        </div>
      }
    >
      <SignupScreen defaultCallbackUrl="/dashboard" />
    </Suspense>
  );
}
