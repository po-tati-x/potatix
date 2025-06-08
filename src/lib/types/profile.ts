/**
 * Core user profile data structure
 */
export type UserProfile = {
  id?: string;
  name: string;
  email: string;
  bio?: string | null;
  image?: string | null;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  createdAt?: string;
  tier?: string;
};

/**
 * Profile update parameters
 */
export type UpdateProfileParams = {
  name?: string;
  bio?: string | null;
  image?: File | null;
};

/**
 * Password update parameters
 */
export type UpdatePasswordParams = {
  currentPassword: string;
  newPassword: string;
};

/**
 * Notification preferences update parameters
 */
export type UpdateNotificationsParams = {
  emailNotifications?: boolean;
  marketingEmails?: boolean;
};

/**
 * Form state type
 */
export type FormState = {
  dirty: boolean;
  error: string | null;
}; 