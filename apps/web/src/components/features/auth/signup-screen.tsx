"use client";

import LoginScreen from "./login-screen";

interface SignupScreenProps {
  /**
   * Fallback callback URL when none is provided through the query string.
   */
  defaultCallbackUrl?: string;
}

/**
 * Reusable signup UI with email / password + social providers.
 */
export default function SignupScreen(props: SignupScreenProps) {
  return <LoginScreen {...props} initialMode="signup" />;
} 