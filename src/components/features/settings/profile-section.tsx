'use client';

import { User } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { ProfileImage } from './profile-image';
import { FormField } from './form-field';
import { ProfileSectionProps } from './types';

export function ProfileSection({ userData, onImageUpdate, loading }: ProfileSectionProps) {
  const handleImageUpload = (file: File) => {
    onImageUpdate(file);
  };
  
  const handleImageDelete = () => {
    onImageUpdate(null);
  };
  
  return (
    <SectionWrapper title="Profile" icon={User}>
      <ProfileImage 
        image={userData.image} 
        isUploading={loading}
        onUpload={handleImageUpload}
        onDelete={handleImageDelete}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Full Name" required>
          <input
            type="text"
            name="name"
            defaultValue={userData.name}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </FormField>
        
        <FormField label="Email" description="Email cannot be changed">
          <input
            type="email"
            name="email"
            defaultValue={userData.email}
            disabled
            className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 text-slate-500 cursor-not-allowed text-sm"
          />
        </FormField>
      </div>
      
      <FormField label="Bio" description="Brief description for your profile. Max 160 characters.">
        <textarea
          name="bio"
          rows={3}
          defaultValue={userData.bio || ''}
          maxLength={160}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
        />
      </FormField>
    </SectionWrapper>
  );
} 