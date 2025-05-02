'use client';

import React, { ChangeEvent } from 'react';
import { FormField } from '@/components/ui/form-field';
import { FormSection } from '@/components/ui/form-section';
import { UserProfileData } from '@/types';

type ProfileTabProps = {
  formData: UserProfileData;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export function ProfileTab({ formData, onChange }: ProfileTabProps) {
  return (
    <>
      <FormSection title="Personal Information" description="Update your basic profile details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            required
          />
          <FormField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            required
          />
        </div>
        
        <FormField
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          required
          disabled
          helper="Contact support to change your email address"
        />
        
        <FormField
          label="Company/Organization"
          name="company"
          value={formData.company}
          onChange={onChange}
        />
      </FormSection>
      
      <FormSection title="About You" description="Tell others about yourself">
        <FormField
          label="Bio"
          name="bio"
          type="textarea"
          value={formData.bio}
          onChange={onChange}
          helper="Brief description for your profile. This will be displayed publicly."
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Website"
            name="website"
            type="url"
            value={formData.website}
            onChange={onChange}
          />
          <FormField
            label="Twitter"
            name="twitter"
            value={formData.twitter}
            onChange={onChange}
          />
        </div>
      </FormSection>
    </>
  );
} 