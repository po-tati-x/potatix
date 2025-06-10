import { User } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/potatix/Button';
import { ThemeSelector } from './ThemeSelector';
import { AppearanceTabProps } from './types';

export function AppearanceTab({ 
  profile, 
  themeOptions, 
  onProfileChange, 
  onThemeChange 
}: AppearanceTabProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-medium text-slate-900 mb-3">Profile Information</h2>
        
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.displayName}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-slate-400">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <Button
                  type="outline"
                  size="small"
                >
                  Change Photo
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profile.displayName}
                  onChange={(e) => onProfileChange('displayName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Username
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                    potatix.so/
                  </span>
                  <input
                    type="text"
                    value={profile.username}
                    onChange={(e) => onProfileChange('username', e.target.value)}
                    className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-none rounded-r-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => onProfileChange('bio', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
              />
              <p className="text-xs text-slate-500">
                Brief description that appears below your name. Max 160 characters.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <ThemeSelector
        activeThemeId={profile.theme}
        themeOptions={themeOptions}
        onThemeChange={onThemeChange}
      />
    </div>
  );
} 