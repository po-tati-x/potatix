import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userApi, type NotificationPreferences } from "../api/user";
import type { UserProfile } from "@/lib/shared/types/profile";
import { userKeys } from "@/lib/shared/constants/query-keys";
import { profileApi } from '../api/profile';

/**
 * Hook for managing user profile data with React Query
 */
export function useProfile(initialData?: UserProfile) {
  const queryClient = useQueryClient();

  // Fetch profile
  const {
    data: profile,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: userKeys.profile(),
    queryFn: () => profileApi.getMe(),
    initialData,
  });

  // Update profile
  const { mutate: updateProfile, isPending: isUpdating } = useMutation({
    mutationFn: (payload: Partial<UserProfile>) => userApi.updateProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
      toast.success("Profile updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update profile");
    },
  });

  // Update notifications
  const { mutate: updateNotifications, isPending: isUpdatingNotifications } =
    useMutation({
      mutationFn: (prefs: NotificationPreferences) => userApi.updateNotifications(prefs),
      onSuccess: (data) => {
        queryClient.setQueryData(userKeys.profile(), data);
        toast.success("Notification preferences updated");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Failed to update notification preferences");
      },
    });

  // Update password
  const { mutate: updatePassword, isPending: isUpdatingPassword } = useMutation(
    {
      mutationFn: (payload: { currentPassword: string; newPassword: string }) => userApi.updatePassword(payload),
      onSuccess: () => {
        toast.success("Password updated successfully");
      },
      onError: (err: Error) => {
        toast.error(err.message || "Failed to update password");
      },
    },
  );

  // Upload profile image
  const { mutate: uploadImage, isPending: isUploading } = useMutation({
    mutationFn: (file: File) => userApi.uploadProfileImage(file),
    onSuccess: async () => {
      await refetch();
      toast.success("Profile image updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload image");
    },
  });

  // Delete account
  const { mutate: deleteAccount, isPending: isDeleting } = useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      toast.success("Account deleted successfully");
      // Note: Redirection should be handled by the component
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to delete account");
    },
  });

  return {
    // Data
    profile,

    // Loading states
    loading,
    isUpdating,
    isUpdatingNotifications,
    isUpdatingPassword,
    isUploading,
    isDeleting,

    // Error state
    error,

    // Actions
    updateProfile,
    updateNotifications,
    updatePassword,
    uploadImage,
    deleteAccount,

    // Utility
    refetch,
  };
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation<UserProfile, Error, Partial<UserProfile>>({
    mutationFn: (payload) => profileApi.updateMe(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
}
