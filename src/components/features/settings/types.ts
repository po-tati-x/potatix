import { UserProfile } from "@/lib/types/profile";

/**
 * Props for ProfileSection component
 */
export type ProfileSectionProps = {
  userData: UserProfile;
  onImageUpdate: (file: File | null) => void;
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