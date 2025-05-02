'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { UserStats, UserPreferences } from '@/types';

export default function ProfileView() {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState(user?.email?.split('@')[0] || '');
  const [userStats, setUserStats] = useState<UserStats>({
    logins: 420, // Would be fetched from the DB in a real app
    lastSeen: new Date().toISOString(),
    accountAge: '69 days',
  });
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    notifications: true,
    publicProfile: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      // Simulate fetching user profile data
      setIsLoading(true);
      setTimeout(() => {
        // This is where you'd fetch actual user data
        setAvatarUrl(`https://api.dicebear.com/7.x/personas/svg?seed=${user.id}`);
        setIsLoading(false);
      }, 600);
    }
  }, [user?.id]);

  if (!user) return null;

  const handleAvatarClick = () => {
    if (editMode) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    alert('File upload not implemented because lol who cares');
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    setTimeout(async () => {
      await signOut();
    }, 500);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div 
          className={`relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 ${editMode ? 'cursor-pointer group' : ''}`}
          onClick={handleAvatarClick}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          {editMode && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        
        <div className="flex-1 space-y-3 text-center sm:text-left">
          {editMode ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Username"
            />
          ) : (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{username}</h2>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">User ID: {user.id.substring(0, 8)}...</p>
        </div>
      </div>
      
      <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">User Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400">Account Age</span>
            <span className="text-sm font-medium">{userStats.accountAge}</span>
          </div>
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400">Last Login</span>
            <span className="text-sm font-medium">{new Date(userStats.lastSeen).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Logins</span>
            <span className="text-sm font-medium">{userStats.logins}</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        {editMode ? (
          <>
            <Button
              variant="secondary"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setEditMode(false);
                alert('Look at you pretending to save profile changes');
              }}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={() => setEditMode(true)}
            >
              Edit Profile
            </Button>
            <Button
              variant="danger"
              onClick={handleSignOut}
              isLoading={isLoading}
            >
              Sign Out
            </Button>
          </>
        )}
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Theme Preference</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Select your preferred theme</p>
            </div>
            <div>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value as 'light' | 'dark' | 'system' })}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System Default</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive email updates</p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                className={`${
                  preferences.notifications ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                <span
                  className={`${
                    preferences.notifications ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                >
                  <span
                    className={`${
                      preferences.notifications ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
                    } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                  >
                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className={`${
                      preferences.notifications ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
                    } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                  >
                    <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">Public Profile</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Allow others to see your profile</p>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setPreferences({ ...preferences, publicProfile: !preferences.publicProfile })}
                className={`${
                  preferences.publicProfile ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                <span
                  className={`${
                    preferences.publicProfile ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                >
                  <span
                    className={`${
                      preferences.publicProfile ? 'opacity-0 ease-out duration-100' : 'opacity-100 ease-in duration-200'
                    } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                  >
                    <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
                      <path
                        d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span
                    className={`${
                      preferences.publicProfile ? 'opacity-100 ease-in duration-200' : 'opacity-0 ease-out duration-100'
                    } absolute inset-0 h-full w-full flex items-center justify-center transition-opacity`}
                  >
                    <svg className="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={() => alert('lmao you thought this would do something')}
          fullWidth
        >
          Save Preferences
        </Button>
      </div>
      
      <div className="pt-5 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Danger Zone</h3>
        <Button
          variant="danger"
          onClick={() => confirm('This button does nothing but good job being a gullible moron')}
          fullWidth
        >
          Delete Account
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-md ${isLoading ? 'opacity-60' : ''}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-50 z-10">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'profile'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-4 text-sm font-medium ${
              activeTab === 'settings'
                ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Settings
          </button>
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'profile' ? renderProfileTab() : renderSettingsTab()}
      </div>
    </div>
  );
} 