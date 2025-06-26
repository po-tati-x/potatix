'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Loader2, User, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

import { SectionWrapper } from "./section-wrapper";
import { ProfileImage } from "./profile-image";
import { FormField } from "./form-field";
import type { ProfileSectionProps } from "./types";

import { useUpdateProfile } from "@/lib/client/hooks/use-profile";

export function ProfileSection({ userData, onImageUpdate, loading }: ProfileSectionProps) {
  /** ---------------------- Image helpers ---------------------- */
  function handleImageUpload(file: File) {
    onImageUpdate(file);
  }

  function handleImageDelete() {
    onImageUpdate(null);
  }

  /** ---------------------- Local state ----------------------- */
  const [name, setName] = useState(userData.name ?? "");
  const [bio, setBio] = useState(userData.bio ?? "");

  /** ---------------------- Mutation -------------------------- */
  const updateProfile = useUpdateProfile();

  /**
   * Debounce util – keeps only the last call within `delay` ms.
   * We re-create the function only once (closure stable).
   */
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(
    (payload: Partial<{ name: string; bio: string }>) => {
      if (debounce.current) clearTimeout(debounce.current);
      debounce.current = setTimeout(() => {
        updateProfile.mutate(payload, {
          onError: (err) => toast.error(err.message || "Failed to update profile"),
        });
      }, 600);
    },
    [updateProfile],
  );

  /** ---------------------- Effects --------------------------- */
  useEffect(() => {
    if (name !== userData.name) {
      scheduleSave({ name });
    }
    // Ignore exhaustive-deps for userData; we purposely compare value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if ((userData.bio || "") !== bio) {
      scheduleSave({ bio });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bio]);

  /** ---------------------- UI helpers ------------------------ */
  const isSaving = updateProfile.isPending;

  return (
    <SectionWrapper title="Profile" icon={User}>
      {/* Profile image upload */}
      <ProfileImage
        image={userData.image}
        isUploading={loading}
        onUpload={handleImageUpload}
        onDelete={handleImageDelete}
      />

      {/* Name + Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
        {/* saving indicator top-right */}
        {isSaving && (
          <span className="absolute top-0 right-0 flex items-center gap-1 text-xs text-slate-500">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving…
          </span>
        )}

        {!isSaving && updateProfile.isSuccess && (
          <span className="absolute top-0 right-0 flex items-center gap-1 text-xs text-emerald-600">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}

        <FormField label="Full Name" required>
          <Input
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Your full name"
          />
        </FormField>

        <FormField label="Email" description="Email cannot be changed">
          <Input
            type="email"
            name="email"
            defaultValue={userData.email}
            disabled
            className="bg-slate-50 text-slate-500 cursor-not-allowed"
          />
        </FormField>
      </div>

      {/* Bio */}
      <FormField label="Bio" description="Brief description for your profile. Max 160 characters.">
        <textarea
          name="bio"
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
        />
      </FormField>

      {/* Error indicator */}
      {updateProfile.isError && (
        <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
          <XCircle className="h-3 w-3" /> Failed to save changes
        </p>
      )}
    </SectionWrapper>
  );
} 