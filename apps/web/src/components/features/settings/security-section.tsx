'use client';

import { Shield } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { FormField } from './form-field';
import { useForm } from 'react-hook-form';

type SecuritySectionProps = {
  onSavePassword: (data: { currentPassword: string; newPassword: string }) => void;
  error: string | null;
};

type PasswordFormData = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function SecuritySection({ error }: SecuritySectionProps) {
  const { register, formState: { errors } } = useForm<PasswordFormData>({
    mode: 'onBlur'
  });
  
  return (
    <SectionWrapper title="Security" icon={Shield}>
      <FormField label="Current Password" error={error}>
        <input
          type="password"
          {...register('currentPassword', { required: 'Current password is required' })}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
        />
      </FormField>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <FormField label="New Password" error={errors.newPassword?.message}>
          <input
            type="password"
            {...register('newPassword', { 
              minLength: { value: 8, message: 'Password must be at least 8 characters' } 
            })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </FormField>
        
        <FormField 
          label="Confirm New Password" 
          description="Leave password fields empty if you don't want to change it."
          error={errors.confirmPassword?.message}
        >
          <input
            type="password"
            {...register('confirmPassword')}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
          />
        </FormField>
      </div>
    </SectionWrapper>
  );
} 