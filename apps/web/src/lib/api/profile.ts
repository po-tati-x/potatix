/**
 * Profile API service
 * Handles all profile-related API calls
 */

import { 
  UserProfile, 
  UpdateProfileParams, 
  UpdatePasswordParams, 
  UpdateNotificationsParams 
} from '@/lib/types/profile';

// API error handling utility
export const handleApiError = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `Failed with status: ${response.status}`);
  }
  return response.json();
};

/**
 * Fetch user profile
 */
export async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch('/api/user/profile');
  return handleApiError(response);
}

/**
 * Update profile information
 */
export async function updateProfile(data: Omit<UpdateProfileParams, 'image'>): Promise<void> {
  const response = await fetch('/api/user/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleApiError(response);
}

/**
 * Upload profile image
 */
export async function uploadProfileImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/user/upload', { 
    method: 'POST', 
    body: formData 
  });
  
  return handleApiError(response);
}

/**
 * Delete profile image
 */
export async function deleteProfileImage(): Promise<void> {
  const response = await fetch('/api/user/upload', { method: 'DELETE' });
  return handleApiError(response);
}

/**
 * Update password
 */
export async function updatePassword(data: UpdatePasswordParams): Promise<void> {
  const response = await fetch('/api/user/update-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleApiError(response);
}

/**
 * Update notification preferences
 */
export async function updateNotifications(data: UpdateNotificationsParams): Promise<void> {
  const response = await fetch('/api/user/update-notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleApiError(response);
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<void> {
  const response = await fetch('/api/user/delete-account', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleApiError(response);
}
