"use client";

import Link from "next/link";
import { LayoutDashboard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { useSession } from "@/lib/auth/auth";
import React from "react";

export function HeroCTAButtons() {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4">
      {isLoggedIn ? (
        <Link href="/dashboard" className="col-span-1">
          <Button
            type="primary"
            size="small"
            iconLeft={<LayoutDashboard className="h-3.5 w-3.5" />}
            className="w-full"
            aria-label="Go to your dashboard"
          >
            Dashboard
          </Button>
        </Link>
      ) : (
        <Link href="/login" className="col-span-1">
          <Button
            type="primary"
            size="small"
            iconRight={<Sparkles className="h-3.5 w-3.5" />}
            className="w-full"
            aria-label="Login to your account"
          >
            Login
          </Button>
        </Link>
      )}

      <Link href="#features" className="col-span-1">
        <Button
          type="outline"
          size="small"
          className="w-full"
          aria-label="See features"
        >
          See Features
        </Button>
      </Link>
    </div>
  );
} 