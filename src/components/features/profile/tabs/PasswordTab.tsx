'use client';

import React, { useState, ChangeEvent } from 'react';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { StatusBadge } from '@/components/ui/status-badge';

export function PasswordTab() {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <FormSection title="Password & Security" description="Update your password and security settings">
      <StatusBadge status="warning" label="Your password hasn't been updated in over 90 days" />
      
      <div className="mt-4 space-y-4">
        <FormField
          label="Current Password"
          name="currentPassword"
          type="password"
          value={passwordData.currentPassword}
          onChange={handleChange}
          required
        />
        
        <FormField
          label="New Password"
          name="newPassword"
          type="password"
          value={passwordData.newPassword}
          onChange={handleChange}
          required
          helper="At least 8 characters, including a number and a symbol"
        />
        
        <FormField
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={passwordData.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="mt-6 bg-zinc-50 border border-zinc-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-zinc-800 mb-2">Two-Factor Authentication</h3>
        <p className="text-xs text-zinc-500 mb-3">Add an extra layer of security to your account</p>
        <button type="button" className="px-3 py-2 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-800">
          Enable 2FA
        </button>
      </div>
    </FormSection>
  );
} 