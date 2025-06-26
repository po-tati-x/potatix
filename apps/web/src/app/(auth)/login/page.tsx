import { Suspense } from "react";

import LoginScreen from "@/components/features/auth/login-screen";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center py-8">
          Loading...
        </div>
      }
    >
      <LoginScreen defaultCallbackUrl="/dashboard" />
    </Suspense>
  );
}
