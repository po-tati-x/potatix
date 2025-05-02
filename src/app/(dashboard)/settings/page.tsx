'use client';

import { useState } from 'react';
import { Shield, Globe, PaintBucket, Moon, Sun, Monitor, Save } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Define types for settings
type AppearanceSettings = {
  theme: string;
  density: string;
  reduceMotion: boolean;
  fontSize: string;
};

type AccountSettings = {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  loginNotifications: boolean;
};

type PrivacySettings = {
  publicProfile: boolean;
  showCourses: boolean;
  dataCollection: string;
};

type AllSettings = {
  appearance: AppearanceSettings;
  account: AccountSettings;
  privacy: PrivacySettings;
};

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('appearance');
  const [settings, setSettings] = useState<AllSettings>({
    appearance: {
      theme: 'system',
      density: 'default',
      reduceMotion: false,
      fontSize: 'medium',
    },
    account: {
      twoFactorEnabled: false,
      sessionTimeout: '30',
      loginNotifications: true,
    },
    privacy: {
      publicProfile: false,
      showCourses: true,
      dataCollection: 'minimal',
    }
  });

  const handleThemeChange = (theme: string) => {
    setSettings({
      ...settings,
      appearance: {
        ...settings.appearance,
        theme
      }
    });
  };

  // Type-safe version of toggle switch
  const handleToggleSwitch = (category: keyof AllSettings, setting: string) => {
    if (category === 'appearance') {
      const key = setting as keyof AppearanceSettings;
      // Only toggle boolean values
      if (typeof settings.appearance[key] === 'boolean') {
        setSettings({
          ...settings,
          appearance: {
            ...settings.appearance,
            [key]: !settings.appearance[key]
          }
        });
      }
    } else if (category === 'account') {
      const key = setting as keyof AccountSettings;
      if (typeof settings.account[key] === 'boolean') {
        setSettings({
          ...settings,
          account: {
            ...settings.account,
            [key]: !settings.account[key]
          }
        });
      }
    } else if (category === 'privacy') {
      const key = setting as keyof PrivacySettings;
      if (typeof settings.privacy[key] === 'boolean') {
        setSettings({
          ...settings,
          privacy: {
            ...settings.privacy,
            [key]: !settings.privacy[key]
          }
        });
      }
    }
  };

  // Type-safe version of select change
  const handleSelectChange = (category: keyof AllSettings, setting: string, value: string) => {
    if (category === 'appearance') {
      const key = setting as keyof AppearanceSettings;
      setSettings({
        ...settings,
        appearance: {
          ...settings.appearance,
          [key]: value
        }
      });
    } else if (category === 'account') {
      const key = setting as keyof AccountSettings;
      setSettings({
        ...settings,
        account: {
          ...settings.account,
          [key]: value
        }
      });
    } else if (category === 'privacy') {
      const key = setting as keyof PrivacySettings;
      setSettings({
        ...settings,
        privacy: {
          ...settings.privacy,
          [key]: value
        }
      });
    }
  };

  const handleSave = () => {
    // In a real application, this would save settings to the backend
    alert('Settings saved!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row gap-2 mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Settings</h1>
        <span className="text-sm text-zinc-500 sm:self-end sm:ml-2">Configure your workspace</span>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <aside className="col-span-1 border-r border-zinc-200">
            <nav className="p-4 space-y-1">
              <button 
                onClick={() => setActiveCategory('appearance')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeCategory === 'appearance' 
                    ? 'bg-zinc-100 text-zinc-900' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <PaintBucket size={16} className="mr-3 flex-shrink-0" />
                Appearance
              </button>
              <button 
                onClick={() => setActiveCategory('account')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeCategory === 'account' 
                    ? 'bg-zinc-100 text-zinc-900' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Shield size={16} className="mr-3 flex-shrink-0" />
                Account Security
              </button>
              <button 
                onClick={() => setActiveCategory('privacy')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeCategory === 'privacy' 
                    ? 'bg-zinc-100 text-zinc-900' 
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Globe size={16} className="mr-3 flex-shrink-0" />
                Privacy & Visibility
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <div className="col-span-1 lg:col-span-3 p-6">
            <form>
              {/* Appearance Settings */}
              {activeCategory === 'appearance' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-medium text-zinc-900 mb-5">Appearance Settings</h2>
                    <p className="mb-5 text-sm text-zinc-500">Customize how your dashboard looks and feels.</p>
                    
                    {/* Theme Selector */}
                    <div className="mb-8">
                      <label className="text-sm font-medium text-zinc-700 mb-4 block">Theme</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                          type="button"
                          onClick={() => handleThemeChange('light')}
                          className={`relative flex flex-col items-center p-4 border rounded-lg ${
                            settings.appearance.theme === 'light' 
                              ? 'border-zinc-900 bg-zinc-50' 
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="bg-white border border-zinc-200 rounded-full p-2 mb-3">
                            <Sun size={18} className="text-zinc-800" />
                          </div>
                          <span className="text-sm font-medium text-zinc-900">Light</span>
                          
                          {settings.appearance.theme === 'light' && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
                            </span>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleThemeChange('dark')}
                          className={`relative flex flex-col items-center p-4 border rounded-lg ${
                            settings.appearance.theme === 'dark' 
                              ? 'border-zinc-900 bg-zinc-50' 
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="bg-zinc-800 border border-zinc-700 rounded-full p-2 mb-3">
                            <Moon size={18} className="text-zinc-100" />
                          </div>
                          <span className="text-sm font-medium text-zinc-900">Dark</span>
                          
                          {settings.appearance.theme === 'dark' && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
                            </span>
                          )}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => handleThemeChange('system')}
                          className={`relative flex flex-col items-center p-4 border rounded-lg ${
                            settings.appearance.theme === 'system' 
                              ? 'border-zinc-900 bg-zinc-50' 
                              : 'border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="bg-gradient-to-r from-white to-zinc-800 border border-zinc-300 rounded-full p-2 mb-3">
                            <Monitor size={18} className="text-zinc-600" />
                          </div>
                          <span className="text-sm font-medium text-zinc-900">System</span>
                          
                          {settings.appearance.theme === 'system' && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-500"></span>
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    {/* Density Setting */}
                    <div className="mb-6">
                      <label htmlFor="density" className="block text-sm font-medium text-zinc-700 mb-1">UI Density</label>
                      <select
                        id="density"
                        value={settings.appearance.density}
                        onChange={(e) => handleSelectChange('appearance', 'density', e.target.value)}
                        className="w-full max-w-xs border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-zinc-500"
                      >
                        <option value="compact">Compact</option>
                        <option value="default">Default</option>
                        <option value="comfortable">Comfortable</option>
                      </select>
                      <p className="mt-1 text-xs text-zinc-500">Controls the spacing between elements.</p>
                    </div>
                    
                    {/* Font Size Setting */}
                    <div className="mb-6">
                      <label htmlFor="fontSize" className="block text-sm font-medium text-zinc-700 mb-1">Font Size</label>
                      <select
                        id="fontSize"
                        value={settings.appearance.fontSize}
                        onChange={(e) => handleSelectChange('appearance', 'fontSize', e.target.value)}
                        className="w-full max-w-xs border border-zinc-300 rounded-md px-3 py-2 focus:outline-none focus:border-zinc-500"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                    
                    {/* Reduce Motion Toggle */}
                    <div className="flex items-center justify-between max-w-md">
                      <div>
                        <h3 className="text-sm font-medium text-zinc-700">Reduce Motion</h3>
                        <p className="text-xs text-zinc-500">Minimize animations and transitions</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleToggleSwitch('appearance', 'reduceMotion')}
                          className={`${
                            settings.appearance.reduceMotion ? 'bg-zinc-800' : 'bg-zinc-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                          <span
                            className={`${
                              settings.appearance.reduceMotion ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Security Settings */}
              {activeCategory === 'account' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-medium text-zinc-900 mb-5">Account Security</h2>
                    <p className="mb-6 text-sm text-zinc-500">Manage your account security settings and preferences.</p>
                    
                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between py-4 border-b border-zinc-100 max-w-md">
                      <div>
                        <h3 className="text-sm font-medium text-zinc-900">Two-Factor Authentication</h3>
                        <p className="text-xs text-zinc-500">Add an extra layer of security to your account</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleToggleSwitch('account', 'twoFactorEnabled')}
                          className={`${
                            settings.account.twoFactorEnabled ? 'bg-zinc-800' : 'bg-zinc-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                          <span
                            className={`${
                              settings.account.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>
                    </div>
                    
                    {/* Session Timeout */}
                    <div className="py-4 border-b border-zinc-100 max-w-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-zinc-900">Session Timeout</h3>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3">Automatically log out after a period of inactivity</p>
                      <select
                        value={settings.account.sessionTimeout}
                        onChange={(e) => handleSelectChange('account', 'sessionTimeout', e.target.value)}
                        className="block w-full max-w-xs border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="240">4 hours</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                    
                    {/* Login Notifications */}
                    <div className="flex items-center justify-between py-4 border-b border-zinc-100 max-w-md">
                      <div>
                        <h3 className="text-sm font-medium text-zinc-900">Login Notifications</h3>
                        <p className="text-xs text-zinc-500">Get notified when someone logs into your account</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleToggleSwitch('account', 'loginNotifications')}
                          className={`${
                            settings.account.loginNotifications ? 'bg-zinc-800' : 'bg-zinc-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                          <span
                            className={`${
                              settings.account.loginNotifications ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Privacy Settings */}
              {activeCategory === 'privacy' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-lg font-medium text-zinc-900 mb-5">Privacy & Visibility</h2>
                    <p className="mb-6 text-sm text-zinc-500">Control what information is visible to others.</p>
                    
                    {/* Public Profile Toggle */}
                    <div className="flex items-center justify-between py-4 border-b border-zinc-100 max-w-md">
                      <div>
                        <h3 className="text-sm font-medium text-zinc-900">Public Profile</h3>
                        <p className="text-xs text-zinc-500">Allow others to see your profile information</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleToggleSwitch('privacy', 'publicProfile')}
                          className={`${
                            settings.privacy.publicProfile ? 'bg-zinc-800' : 'bg-zinc-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                          <span
                            className={`${
                              settings.privacy.publicProfile ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>
                    </div>
                    
                    {/* Show Courses Toggle */}
                    <div className="flex items-center justify-between py-4 border-b border-zinc-100 max-w-md">
                      <div>
                        <h3 className="text-sm font-medium text-zinc-900">Show Courses</h3>
                        <p className="text-xs text-zinc-500">Display your created courses publicly on your profile</p>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => handleToggleSwitch('privacy', 'showCourses')}
                          className={`${
                            settings.privacy.showCourses ? 'bg-zinc-800' : 'bg-zinc-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                        >
                          <span
                            className={`${
                              settings.privacy.showCourses ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                          />
                        </button>
                      </div>
                    </div>
                    
                    {/* Data Collection */}
                    <div className="py-4 border-b border-zinc-100 max-w-md">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-zinc-900">Data Collection</h3>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3">Choose how much data we can collect to improve your experience</p>
                      <select
                        value={settings.privacy.dataCollection}
                        onChange={(e) => handleSelectChange('privacy', 'dataCollection', e.target.value)}
                        className="block w-full max-w-xs border border-zinc-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-zinc-500"
                      >
                        <option value="none">None - Essential only</option>
                        <option value="minimal">Minimal - Basic analytics</option>
                        <option value="full">Full - Complete usage data</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Save Button */}
              <div className="mt-8 pt-5 border-t border-zinc-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800"
                >
                  <Save size={16} className="mr-2" />
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 