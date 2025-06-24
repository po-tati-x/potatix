import type { UserProfile } from "@/lib/shared/types/profile";

/**
 * Props for ProfileSection component
 */
export type ProfileSectionProps = {
  userData: UserProfile;
  /**
   * Callback invoked when user uploads or deletes a profile image.
   * If `null` is passed, the image should be removed.
   */
  onImageUpdate: (file: File | null) => void;
  /** Indicates whether the profile image is being uploaded */
  loading: boolean;
};

/**
 * Props for SecuritySection component
 */
export type SecuritySectionProps = {
  onSavePassword: (data: { currentPassword: string; newPassword: string }) => void;
  error: string | null;
};

/**
 * Props for NotificationSection component
 */
export type NotificationSectionProps = {
  emailNotifications: boolean;
  marketingEmails: boolean;
  onToggle: (key: 'emailNotifications' | 'marketingEmails', value: boolean) => void;
};

/**
 * Props for BillingSection component
 */
export type BillingSectionProps = {
  plan: string;
  onUpgrade: () => void;
};

/**
 * Props for DangerZone component
 */
export type DangerZoneProps = {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  isDeletingAccount: boolean;
};

/**
 * Props for FormField component
 */
export type FormFieldProps = {
  label: string;
  required?: boolean;
  description?: string;
  children: React.ReactNode;
}; 