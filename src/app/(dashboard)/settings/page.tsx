'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Shield, Bell, CreditCard, LogOut, Loader2, AlertTriangle } from 'lucide-react';

// Form field component
const FormField = ({ 
  label, 
  children, 
  required = false,
  description 
}: { 
  label: string; 
  children: React.ReactNode; 
  required?: boolean;
  description?: string;
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-neutral-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {description && (
      <p className="text-xs text-neutral-500">{description}</p>
    )}
  </div>
);

// Toggle switch component
const Toggle = ({ 
  id, 
  name, 
  defaultChecked = false 
}: { 
  id: string; 
  name: string; 
  defaultChecked?: boolean; 
}) => (
  <div className="relative">
    <input 
      type="checkbox" 
      id={id} 
      name={name} 
      defaultChecked={defaultChecked}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-neutral-200 rounded-full peer peer-checked:bg-black transition-colors cursor-pointer peer-focus:ring-2 peer-focus:ring-neutral-500"></div>
    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
  </div>
);

export default function SettingsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    setTimeout(() => {
      setSaving(false);
    }, 600);
  };
  
  const handleSignOut = () => {
    router.push('/auth/login');
  };
  
  return (
    <div className="min-h-full w-full py-12 px-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-12">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">
              Settings
            </h1>
            <p className="text-lg text-neutral-600">
              Manage your account settings and preferences.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="submit"
              form="settings-form"
              disabled={saving}
              className="px-5 py-2 bg-black text-white rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors text-sm font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Section */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-neutral-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900">Profile</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Full Name" required>
                    <input
                      type="text"
                      name="name"
                      defaultValue="John Developer"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-colors"
                    />
                  </FormField>
                  
                  <FormField label="Email" description="Email cannot be changed">
                    <input
                      type="email"
                      name="email"
                      defaultValue="john@example.com"
                      disabled
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500 cursor-not-allowed"
                    />
                  </FormField>
                </div>
                
                <FormField label="Bio" description="Brief description for your profile. Max 160 characters.">
                  <textarea
                    name="bio"
                    rows={4}
                    defaultValue="Software developer specializing in TypeScript and React."
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-colors resize-none"
                  />
                </FormField>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-neutral-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900">Security</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <FormField label="Current Password">
                  <input
                    type="password"
                    name="currentPassword"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-colors"
                  />
                </FormField>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="New Password">
                    <input
                      type="password"
                      name="newPassword"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-colors"
                    />
                  </FormField>
                  
                  <FormField label="Confirm New Password" description="Leave password fields empty if you don't want to change it.">
                    <input
                      type="password"
                      name="confirmPassword"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:border-neutral-500 transition-colors"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-neutral-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-neutral-900">Notifications</h2>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900">Email Notifications</h3>
                    <p className="text-sm text-neutral-600 mt-1">Receive emails about your account activity</p>
                  </div>
                  <Toggle id="email-notifications" name="emailNotifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900">Marketing Emails</h3>
                    <p className="text-sm text-neutral-600 mt-1">Receive emails about new features and offers</p>
                  </div>
                  <Toggle id="marketing-emails" name="marketingEmails" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Billing */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-neutral-600" />
                  </div>
                  <h3 className="font-semibold text-neutral-900">Billing</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div className="text-center">
                  <h4 className="font-medium text-neutral-900 mb-2">Free Plan</h4>
                  <p className="text-sm text-neutral-600 mb-4">You're currently on the free plan</p>
                  <button
                    type="button"
                    onClick={() => router.push('/plans')}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors text-sm font-medium"
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
              <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <h3 className="font-semibold text-red-900">Danger Zone</h3>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
                
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}