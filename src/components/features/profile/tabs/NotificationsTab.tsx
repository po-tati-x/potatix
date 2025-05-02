'use client';

import React, { ChangeEvent } from 'react';
import { FormSection } from '@/components/ui/form-section';
import { UserProfileData } from '@/types';

type NotificationsTabProps = {
  formData: UserProfileData;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

export function NotificationsTab({ formData, onChange }: NotificationsTabProps) {
  return (
    <FormSection title="Notification Preferences" description="Manage how and when we contact you">
      <div className="space-y-3 bg-zinc-50 p-4 rounded-md border border-zinc-200">
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="email"
              name="email"
              type="checkbox"
              checked={formData.notifications.email}
              onChange={onChange}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-600"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="email" className="text-sm font-medium text-zinc-700">Course Activity</label>
            <p className="text-xs text-zinc-500">Get notified when students enroll or complete your courses</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="updates"
              name="updates"
              type="checkbox"
              checked={formData.notifications.updates}
              onChange={onChange}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-600"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="updates" className="text-sm font-medium text-zinc-700">Platform Updates</label>
            <p className="text-xs text-zinc-500">Get notified about new features and improvements</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="marketing"
              name="marketing"
              type="checkbox"
              checked={formData.notifications.marketing}
              onChange={onChange}
              className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-600"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="marketing" className="text-sm font-medium text-zinc-700">Marketing</label>
            <p className="text-xs text-zinc-500">Receive tips and marketing communications</p>
          </div>
        </div>
      </div>
    </FormSection>
  );
} 