'use client';

import React from 'react';
import { StatusBadge } from '@/components/ui/status-badge';

type ProfileHeaderProps = {
  saveStatus: null | 'saving' | 'success' | 'error';
};

export default function ProfileHeader({ saveStatus }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Profile Settings</h1>
        <p className="text-sm text-zinc-500">Manage your account information and preferences</p>
      </div>
      
      {saveStatus && (
        <div className="flex items-center">
          {saveStatus === 'saving' && (
            <div className="flex items-center text-zinc-600">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving changes...
            </div>
          )}
          {saveStatus === 'success' && (
            <StatusBadge status="success" label="Changes saved successfully" />
          )}
          {saveStatus === 'error' && (
            <StatusBadge status="error" label="Error saving changes" />
          )}
        </div>
      )}
    </div>
  );
} 