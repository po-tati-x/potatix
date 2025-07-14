"use client";

import { Button } from "@/components/ui/new-button";
import { signIn } from "@/lib/auth/auth";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { GitHubDark, Google } from "developer-icons";

type SocialProvider = "github" | "google";

interface SocialLoginProps {
  callbackUrl?: string;
}

export default function SocialLogin({
  callbackUrl = "/dashboard",
}: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<string | undefined>();

  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(provider);
    try {
      await signIn.social(
        {
          provider,
          callbackURL: callbackUrl,
        },
        {
          onError: (ctx: { error: Error }) => {
            toast.error(
              `Failed to sign in with ${provider}: ${ctx.error.message}`,
            );
          },
        },
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Authentication failed: ${errorMessage}`);
    } finally {
      setIsLoading(undefined);
    }
  };

  return (
    <div className="w-full mt-6">
      <div className="relative flex items-center justify-center text-xs text-slate-500 mb-4">
        <hr className="w-full border-t border-slate-200" />
        <span className="px-3 bg-white relative z-10 font-medium whitespace-nowrap">
          or continue with
        </span>
        <hr className="w-full border-t border-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="outline"
          size="small"
          className="border-slate-200 font-medium text-slate-800"
          disabled={Boolean(isLoading)}
          onClick={() => {
            void handleSocialLogin("github");
          }}
          iconLeft={
            isLoading === "github" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <GitHubDark className="h-4 w-4" />
            )
          }
        >
          GitHub
        </Button>

        <Button
          type="outline"
          size="small"
          className="border-slate-200 font-medium text-slate-800"
          disabled={Boolean(isLoading)}
          onClick={() => {
            void handleSocialLogin("google");
          }}
          iconLeft={
            isLoading === "google" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Google className="h-4 w-4" />
            )
          }
        >
          Google
        </Button>
      </div>
    </div>
  );
}
