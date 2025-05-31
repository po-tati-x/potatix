'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, User, Shield, Bell, CreditCard, LogOut, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';

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
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {description && (
      <p className="text-xs text-slate-500">{description}</p>
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
    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-emerald-600 transition-colors cursor-pointer peer-focus:ring-2 peer-focus:ring-emerald-500"></div>
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
              onClick={handleSubmit}
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
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-600" />
                  <h2 className="text-sm font-medium text-slate-900">Profile</h2>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Full Name" required>
                    <input
                      type="text"
                      name="name"
                      defaultValue="John Developer"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </FormField>
                  
                  <FormField label="Email" description="Email cannot be changed">
                    <input
                      type="email"
                      name="email"
                      defaultValue="john@example.com"
                      disabled
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
                    />
                  </FormField>
                </div>
                
                <FormField label="Bio" description="Brief description for your profile. Max 160 characters.">
                  <textarea
                    name="bio"
                    rows={3}
                    defaultValue="Software developer specializing in TypeScript and React."
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                  />
                </FormField>
              </div>
            </div>

            {/* Security Section */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-slate-600" />
                  <h2 className="text-sm font-medium text-slate-900">Security</h2>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <FormField label="Current Password">
                  <input
                    type="password"
                    name="currentPassword"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </FormField>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="New Password">
                    <input
                      type="password"
                      name="newPassword"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </FormField>
                  
                  <FormField label="Confirm New Password" description="Leave password fields empty if you don't want to change it.">
                    <input
                      type="password"
                      name="confirmPassword"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                <div className="flex items-center gap-3">
                  <Bell className="h-4 w-4 text-slate-600" />
                  <h2 className="text-sm font-medium text-slate-900">Notifications</h2>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Email Notifications</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Receive emails about your account activity</p>
                  </div>
                  <Toggle id="email-notifications" name="emailNotifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Marketing Emails</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Receive emails about new features and offers</p>
                  </div>
                  <Toggle id="marketing-emails" name="marketingEmails" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-5">
            {/* Billing */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                  <h3 className="text-sm font-medium text-slate-900">Billing</h3>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  <div className="text-center">
                    <h4 className="text-sm font-medium text-slate-900">Free Plan</h4>
                    <p className="text-xs text-slate-600 mt-0.5 mb-3">You&apos;re currently on the free plan</p>
                  </div>
                  <Button
                    type="outline"
                    size="small"
                    onClick={() => router.push('/plans')}
                    className="w-full"
                  >
                    Upgrade Plan
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-red-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-red-200 px-4 py-2.5 bg-red-50">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <h3 className="text-sm font-medium text-red-900">Danger Zone</h3>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <Button
                  type="outline"
                  size="small"
                  icon={<LogOut className="h-3.5 w-3.5" />}
                  onClick={() => router.push('/auth/sign-in')}
                  className="w-full"
                >
                  Sign Out
                </Button>
                
                <Button
                  type="danger"
                  size="small"
                  className="w-full"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}