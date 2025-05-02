'use client';

import React from 'react';
import { User, Mail, Lock, CreditCard, Bell } from 'lucide-react';
import { ProfileCard } from '@/components/ui/profile-card';
import { TabButton } from '@/components/ui/tab-button';

type ProfileSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  name: string;
  email: string;
};

export default function ProfileSidebar({ 
  activeTab, 
  setActiveTab, 
  name, 
  email 
}: ProfileSidebarProps) {
  // Tabs configuration - makes it easier to maintain and extend
  const tabs = [
    { id: 'profile', label: 'Personal Information', icon: <User size={16} /> },
    { id: 'account', label: 'Account Details', icon: <Mail size={16} /> },
    { id: 'password', label: 'Password & Security', icon: <Lock size={16} />, hasAlert: true },
    { id: 'billing', label: 'Billing & Payments', icon: <CreditCard size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  ];

  return (
    <div className="lg:col-span-1">
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden h-full">
        <ProfileCard 
          name={name} 
          email={email}
        />
        
        <div className="p-3 space-y-1">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              icon={tab.icon}
              label={tab.label}
              isActive={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              hasAlert={tab.hasAlert}
            />
          ))}
        </div>
        
        <div className="p-4 mt-4">
          <p className="text-xs text-zinc-500 mb-2">Last updated: 2 days ago</p>
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div className="h-full w-4/5 bg-zinc-700 rounded-full"></div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">Profile completion: 80%</p>
        </div>
      </div>
    </div>
  );
} 