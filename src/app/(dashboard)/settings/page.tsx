'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Shield, Bell, Mail, CreditCard, LogOut } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Mock submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Fake API call delay
    setTimeout(() => {
      setSaving(false);
    }, 600);
  };
  
  // Sign out handler
  const handleSignOut = () => {
    // In a real app, this would call your auth signOut method
    router.push('/auth/login');
  };
  
  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-1">
          <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
          <p className="text-sm text-neutral-500">
            Manage your account settings and preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Settings */}
          <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center">
                <User className="h-4 w-4 text-neutral-500 mr-2" />
                <h3 className="text-md font-medium text-neutral-900">Profile</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    defaultValue="John Developer"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue="john@example.com"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50"
                    disabled
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Email cannot be changed
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-neutral-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    defaultValue="Software developer specializing in TypeScript and React."
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Brief description for your profile. Max 160 characters.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Account Security */}
          <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center">
                <Shield className="h-4 w-4 text-neutral-500 mr-2" />
                <h3 className="text-md font-medium text-neutral-900">Security</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-neutral-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current-password"
                    name="currentPassword"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="new-password" className="block text-sm font-medium text-neutral-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      name="newPassword"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirmPassword"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    />
                  </div>
                </div>
                
                <p className="text-xs text-neutral-500">
                  Leave password fields empty if you don't want to change it.
                </p>
              </div>
            </div>
          </div>
          
          {/* Notifications */}
          <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center">
                <Bell className="h-4 w-4 text-neutral-500 mr-2" />
                <h3 className="text-md font-medium text-neutral-900">Notifications</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="email-notifications" className="font-medium text-neutral-900 text-sm">
                      Email Notifications
                    </label>
                    <p className="text-xs text-neutral-500">Receive emails about your account activity</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="email-notifications" 
                      name="emailNotifications" 
                      defaultChecked
                      className="sr-only peer"
                    />
                    <div className="h-4 w-10 bg-neutral-200 rounded-full peer peer-checked:bg-emerald-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-emerald-500">
                    </div>
                    <div className="absolute -left-1 -top-1 peer-checked:left-5 transition-all duration-200 ease-in-out block w-6 h-6 rounded-full bg-white border border-neutral-300 shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="marketing-emails" className="font-medium text-neutral-900 text-sm">
                      Marketing Emails
                    </label>
                    <p className="text-xs text-neutral-500">Receive emails about new features and offers</p>
                  </div>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input 
                      type="checkbox" 
                      id="marketing-emails" 
                      name="marketingEmails"
                      className="sr-only peer"
                    />
                    <div className="h-4 w-10 bg-neutral-200 rounded-full peer peer-checked:bg-emerald-500 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-emerald-500">
                    </div>
                    <div className="absolute -left-1 -top-1 peer-checked:left-5 transition-all duration-200 ease-in-out block w-6 h-6 rounded-full bg-white border border-neutral-300 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Billing */}
          <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 text-neutral-500 mr-2" />
                <h3 className="text-md font-medium text-neutral-900">Billing</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-neutral-900">Free Plan</h4>
                  <p className="text-xs text-neutral-500 mt-1">You're currently on the free plan</p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded text-sm"
                  onClick={() => router.push('/plans')}
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>
          
          {/* Danger Zone */}
          <div className="rounded-lg border border-red-200 bg-white overflow-hidden">
            <div className="border-b border-red-200 px-6 py-4">
              <div className="flex items-center">
                <LogOut className="h-4 w-4 text-red-500 mr-2" />
                <h3 className="text-md font-medium text-red-700">Account Actions</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col space-y-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full md:w-auto px-4 py-2 bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
                
                <button
                  type="button"
                  className="w-full md:w-auto px-4 py-2 bg-white border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
            >
              {saving ? (
                <>
                  <span className="mr-2">Saving</span>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 