'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import { signOut } from '@/lib/auth/auth-client';
import { toast } from 'sonner';

// Import components
import { ProfileSection } from '@/components/features/settings/profile-section';
import { SecuritySection } from '@/components/features/settings/security-section';
import { BillingSection } from '@/components/features/settings/billing-section';
import { DangerZone } from '@/components/features/settings/danger-zone';

// Import store and types
import { useProfileStore } from '@/lib/stores/profile';
import { UserProfile } from '@/lib/types/profile';

// Default empty profile when data is loading
const DEFAULT_USER_PROFILE: UserProfile = {
  name: '',
  email: '',
};

export default function SettingsPage() {
  const router = useRouter();
  
  // Get state and actions from zustand store
  const { 
    profile,
    loading,
    saving,
    error,
    securityForm,
    fetchProfile,
    updateProfile,
    updatePassword,
    deleteAccount,
  } = useProfileStore();
  
  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  // Handle profile update
  const handleSaveProfile = (data: Pick<UserProfile, 'name' | 'bio'>) => {
    updateProfile(data);
  };
  
  // Handle profile image update  
  const handleImageUpdate = (file: File | null) => {
    updateProfile({ image: file });
  };
  
  // Handle password change
  const handleSavePassword = (data: { currentPassword: string; newPassword: string }) => {
    updatePassword(data);
  };
  
  // Handle plan upgrade
  const handleUpgradePlan = () => {
    router.push('/plans');
  };
  
  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => router.push('/login')
        }
      });
    } catch (error) {
      console.error("Sign out failed:", error);
      router.push('/login');
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      deleteAccount();
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const bio = formData.get('bio') as string;
    
    if (!name) {
      toast.error('Name is required');
      return;
    }
    
    handleSaveProfile({ name, bio: bio || null });
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="p-4 bg-red-50 rounded border border-red-200 text-red-700">
          Failed to load profile data. Please try refreshing the page.
        </div>
      </div>
    );
  }
  
  // User data with fallback to default
  const userData = profile || DEFAULT_USER_PROFILE;

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
          onClick={() => router.push('/dashboard')}
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
          
          <div className="flex items-center">
            <Button
              type="primary"
              size="small"
              icon={saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              disabled={saving}
              htmlType="submit"
              form="settings-form"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile Section */}
            <ProfileSection 
              userData={userData}
              onImageUpdate={handleImageUpdate}
              loading={saving}
            />

            {/* Security Section */}
            <SecuritySection 
              onSavePassword={handleSavePassword}
              error={securityForm.error}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-5">
            {/* Billing */}
            <BillingSection plan="free" onUpgrade={handleUpgradePlan} />

            {/* Danger Zone */}
            <DangerZone 
              onSignOut={handleSignOut}
              onDeleteAccount={handleDeleteAccount}
              isDeletingAccount={saving}
            />
          </div>
        </div>
      </form>
    </div>
  );
}