'use client';

import React, { ChangeEvent, FormEvent } from 'react';
import { Save, X } from 'lucide-react';
import { UserProfileData } from '@/types';
import { 
  ProfileTab, 
  NotificationsTab, 
  AccountTab, 
  PasswordTab, 
  BillingTab 
} from './tabs';

type ProfileFormProps = {
  activeTab: string;
  formData: UserProfileData;
  setFormData: React.Dispatch<React.SetStateAction<UserProfileData>>;
  saveStatus: null | 'saving' | 'success' | 'error';
  onSave: () => void;
};

export default function ProfileForm({
  activeTab,
  formData,
  setFormData,
  saveStatus,
  onSave
}: ProfileFormProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave();
  };

  // Render the proper content based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab formData={formData} onChange={handleChange} />;
      case 'notifications':
        return <NotificationsTab formData={formData} onChange={handleChange} />;
      case 'account':
        return <AccountTab />;
      case 'password':
        return <PasswordTab />;
      case 'billing':
        return <BillingTab />;
      default:
        return <ProfileTab formData={formData} onChange={handleChange} />;
    }
  };

  return (
    <div className="lg:col-span-3">
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            {renderTabContent()}
  
            {/* Form Actions */}
            <div className="mt-8 pt-5 border-t border-zinc-200 flex justify-end space-x-3">
              <button 
                type="button"
                className="inline-flex items-center px-4 py-2 border border-zinc-300 rounded-md text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50"
              >
                <X size={16} className="mr-2" />
                Cancel
              </button>
              <button 
                type="submit"
                className="inline-flex items-center px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-md hover:bg-zinc-800"
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 