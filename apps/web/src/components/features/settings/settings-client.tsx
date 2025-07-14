"use client";

import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/new-button";
import { ProfileSection } from "@/components/features/settings/profile-section";
import { SecuritySection } from "@/components/features/settings/security-section";
import { BillingSection } from "@/components/features/settings/billing-section";
import { DangerZone } from "@/components/features/settings/danger-zone";

import type { UserProfile } from "@/lib/shared/types/profile";
import { useProfile } from "@/lib/client/hooks/use-profile";

interface Props {
  initialData?: UserProfile;
}

export default function SettingsClient({ initialData }: Props) {
  const router = useRouter();

  // Query user profile (seed with server data)
  const {
    profile,
    loading: isLoading,
    error,
    uploadImage,
    isUploading,
    refetch,
  } = useProfile(initialData || undefined);

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!profile || error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="p-4 bg-red-50 rounded border border-red-200 text-red-700">
          Failed to load profile data.
        </div>
      </div>
    );
  }

  // Handle image upload/delete (sync wrapper to satisfy void-return requirement)
  function handleImageUpdate(file?: File): void {
    if (file === undefined) {
      void (async () => {
        try {
          await fetch("/api/user/profile/image", { method: "DELETE" });
          await refetch();
        } catch (error_) {
          console.error("Failed to update profile image", error_);
        }
      })();
    } else {
      // uploadImage is already asynchronous but we don't await it to keep return type void
      uploadImage(file);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-6">
        <Button
          type="text"
          size="tiny"
          icon={
            <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
              <ArrowLeft className="h-3 w-3" />
            </span>
          }
          className="text-slate-500 hover:text-slate-900 group"
          onClick={() => router.push("/dashboard")}
        >
          Back to dashboard
        </Button>
      </div>

      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Settings</h1>
            <p className="mt-1 text-sm text-slate-600">
              Manage your account settings and preferences.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          <ProfileSection
            userData={profile}
            onImageUpdate={handleImageUpdate}
            loading={isUploading}
          />
          <SecuritySection />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <BillingSection plan="pro" onUpgrade={() => router.push("/plans")} />
          <DangerZone
            onSignOut={() => router.push("/login")}
            onDeleteAccount={() => {}}
            isDeletingAccount={false}
          />
        </div>
      </div>
    </div>
  );
} 