"use client";

import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/new-button";
import { useRouter } from "next/navigation";
import { formatMonthYear } from "@/lib/shared/utils/format";
import { useDashboardData, useSignOut } from "@/lib/client/hooks/use-dashboard";
import type { UserProfile } from "@/lib/shared/types/profile";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Profile card for the dashboard displaying user information
 * and account actions
 */
export function ProfileCard() {
  const router = useRouter();
  const { data, isLoading } = useDashboardData();
  const { mutate: signOut } = useSignOut();
  
  const profile = data?.profile as UserProfile | undefined;

  // Handle edit profile
  const handleEditProfile = () => {
    router.push("/settings");
  };

  // Loading state with skeleton
  if (isLoading || !profile) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-100">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Use proper data extraction, no hardcoded fallbacks
  const memberSince = formatMonthYear(profile.createdAt);
  const accountType = "Pro"; // Default to Pro since tier doesn't exist in UserProfile

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">Account Details</h2>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
            {profile.name?.charAt(0) || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-900 truncate">
              {profile.name}
            </h3>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Account Type</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">
              {accountType}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">Member Since</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">
              {memberSince}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="outline"
            size="small"
            icon={<User className="h-3.5 w-3.5" />}
            onClick={handleEditProfile}
            className="w-full justify-center"
          >
            Edit Profile
          </Button>

          <Button
            type="text"
            size="small"
            icon={<LogOut className="h-3.5 w-3.5" />}
            onClick={() => signOut()}
            className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
