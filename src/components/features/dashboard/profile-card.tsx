'use client';

import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import { useRouter } from 'next/navigation';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { useEffect } from 'react';
import { formatMonthYear } from '@/lib/utils/format';

/**
 * Profile card for the dashboard displaying user information
 * and account actions
 */
export function ProfileCard() {
  const router = useRouter();
  
  // Get profile data and actions from the centralized store
  const { 
    profile, 
    isProfileLoading, 
    fetchProfile, 
    signOut: handleSignOut 
  } = useDashboardStore();
  
  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);
  
  // Handle edit profile
  const handleEditProfile = () => {
    router.push('/settings');
  };
  
  // Loading or no profile state
  if (isProfileLoading || !profile) {
    return (
      <div className="border border-slate-200 rounded-md overflow-hidden bg-white h-[232px] animate-pulse">
        <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              <div className="h-2 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-100">
            <div className="space-y-1">
              <div className="h-2 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
            <div className="space-y-1">
              <div className="h-2 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="h-8 bg-slate-200 rounded"></div>
            <div className="h-8 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Member since information - using a placeholder for now, would be replaced with real data
  const memberSince = formatMonthYear(profile.createdAt || '2023-05-01');
  
  // Account type - would be fetched from a subscription service in a real app
  const accountType = profile.tier || 'Free';

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <h2 className="text-sm font-medium text-slate-900">Account Details</h2>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-medium">
            {profile.name?.charAt(0) || '?'}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-900 truncate">{profile.name}</h3>
            <p className="text-xs text-slate-500 truncate">{profile.email}</p>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500">Account Type</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{accountType}</p>
          </div>
          
          <div>
            <p className="text-xs text-slate-500">Member Since</p>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{memberSince}</p>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col gap-2">
          <Button
            type="outline"
            size="small"
            icon={<User className="h-3.5 w-3.5" />}
            onClick={handleEditProfile}
            className="w-full justify-center"
          >
            Edit Profile
          </Button>
          
          <Button
            type="text"
            size="small"
            icon={<LogOut className="h-3.5 w-3.5" />}
            onClick={() => handleSignOut()}
            className="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
} 