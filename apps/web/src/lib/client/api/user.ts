/**
 * Client-side API functions for user-related operations
 */
import axios from "axios";

/**
 * Profile data interface
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  bio?: string;
  createdAt: string;
}

/**
 * Interface for profile update data
 */
export interface ProfileUpdateData {
  name?: string;
  bio?: string;
}

/**
 * Interface for notification preferences
 */
export interface NotificationPreferences {
  email: boolean;
  marketing: boolean;
  newEnrollments: boolean;
  courseUpdates: boolean;
}

/**
 * Interface for password update data
 */
export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

/**
 * User API functions
 */
export const userApi = {
  async getProfile(): Promise<UserProfile> {
    const response = await axios.get<UserProfile>("/api/user/profile");
    return response.data;
  },

  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    const response = await axios.patch<UserProfile>("/api/user/profile", data);
    return response.data;
  },

  async updateNotifications(
    data: NotificationPreferences,
  ): Promise<UserProfile> {
    const response = await axios.patch<UserProfile>(
      "/api/user/notifications",
      data,
    );
    return response.data;
  },

  async updatePassword(data: PasswordUpdateData): Promise<{ success: boolean }> {
    const response = await axios.post<{ success: boolean }>(
      "/api/user/password",
      data,
    );
    return response.data;
  },

  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post<{ imageUrl: string }>(
      "/api/user/profile/image",
      formData,
    );
    return response.data;
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    const response = await axios.delete<{ success: boolean }>("/api/user");
    return response.data;
  },
};
