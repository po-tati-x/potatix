import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'sonner';
import type { 
  UserProfile, 
  FormState, 
  UpdateProfileParams,
  UpdatePasswordParams,
  UpdateNotificationsParams 
} from '@/lib/types/profile';

// Import API functions
import {
  fetchProfile as fetchProfileApi,
  updateProfile as updateProfileApi,
  uploadProfileImage,
  deleteProfileImage,
  updatePassword as updatePasswordApi,
  updateNotifications as updateNotificationsApi,
  deleteAccount as deleteAccountApi
} from '@/lib/api/profile';

interface ProfileState {
  // User data
  profile: UserProfile | null;
  
  // UI states
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Form states
  profileForm: FormState;
  securityForm: FormState;
  notificationsForm: FormState;
  
  // Settings
  emailNotifications: boolean;
  marketingEmails: boolean;
}

interface ProfileActions {
  // Data fetching
  fetchProfile: () => Promise<void>;
  
  // Data mutations
  updateProfile: (data: UpdateProfileParams) => Promise<void>;
  updatePassword: (data: UpdatePasswordParams) => Promise<void>;
  updateNotifications: (data: UpdateNotificationsParams) => Promise<void>;
  deleteAccount: () => Promise<void>;
  
  // State management
  setFormError: (form: 'profileForm' | 'securityForm' | 'notificationsForm', error: string | null) => void;
  setFormDirty: (form: 'profileForm' | 'securityForm' | 'notificationsForm', isDirty: boolean) => void;
  
  reset: () => void;
}

type ProfileStore = ProfileState & ProfileActions;

// Initial state
const initialState: ProfileState = {
  profile: null,
  loading: false,
  saving: false,
  error: null,
  profileForm: { dirty: false, error: null },
  securityForm: { dirty: false, error: null },
  notificationsForm: { dirty: false, error: null },
  emailNotifications: true,
  marketingEmails: false,
};

export const useProfileStore = create<ProfileStore>()(
  devtools(
    (set, get) => ({
      // State
      ...initialState,
      
      // Data fetching
      fetchProfile: async () => {
        set({ loading: true, error: null });
        
        try {
          const profile = await fetchProfileApi();
          
          set({ 
            profile,
            emailNotifications: profile.emailNotifications ?? true,
            marketingEmails: profile.marketingEmails ?? false,
            loading: false
          });
          
          return profile;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
          set({ error: errorMessage, loading: false });
          toast.error(errorMessage);
        }
      },
      
      // Data mutations
      updateProfile: async (data) => {
        set({ saving: true });
        
        try {
          // Handle image updates separately
          if (data.image !== undefined) {
            // Delete or upload image
            if (data.image === null) {
              await deleteProfileImage();
            } else if (data.image instanceof File) {
              await uploadProfileImage(data.image);
            }
          }
          
          // Only send API request if there are text fields to update
          const profileData = Object.fromEntries(
            Object.entries(data).filter(([key]) => key !== 'image')
          );
          if (Object.keys(profileData).length > 0) {
            await updateProfileApi(profileData);
          }
          
          // Refresh profile data
          await get().fetchProfile();
          
          toast.success('Profile updated successfully');
          set({ saving: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
          set({ saving: false });
          toast.error(errorMessage);
        }
      },
      
      updatePassword: async (data) => {
        set({ saving: true });
        
        try {
          await updatePasswordApi(data);
          
          toast.success('Password updated successfully');
          set({ 
            saving: false,
            securityForm: { ...get().securityForm, error: null, dirty: false } 
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
          set({ 
            saving: false,
            securityForm: { ...get().securityForm, error: errorMessage } 
          });
          toast.error(errorMessage);
        }
      },
      
      updateNotifications: async (data) => {
        set({ saving: true });
        
        try {
          await updateNotificationsApi(data);
          
          // Update local state with new values
          if (data.emailNotifications !== undefined) {
            set({ emailNotifications: data.emailNotifications });
          }
          
          if (data.marketingEmails !== undefined) {
            set({ marketingEmails: data.marketingEmails });
          }
          
          toast.success('Notification preferences updated');
          set({ saving: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update notification preferences';
          set({ saving: false });
          toast.error(errorMessage);
        }
      },
      
      deleteAccount: async () => {
        set({ saving: true });
        
        try {
          await deleteAccountApi();
          
          toast.success('Account deleted successfully');
          set({ saving: false });
          // Note: Redirection after deleting account should be handled by the component
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete account';
          set({ saving: false });
          toast.error(errorMessage);
        }
      },
      
      // State management
      setFormError: (form, error) => set((state) => ({
        [form]: { ...state[form], error }
      })),
      
      setFormDirty: (form, isDirty) => set((state) => ({
        [form]: { ...state[form], dirty: isDirty }
      })),
      
      reset: () => set(initialState)
    }),
    { name: 'profile-store' }
  )
);
