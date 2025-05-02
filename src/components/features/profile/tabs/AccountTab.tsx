'use client';

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { FormSection } from '@/components/ui/form-section';
import { StatusBadge } from '@/components/ui/status-badge';

export function AccountTab() {
  return (
    <FormSection title="Account Details" description="Manage your account preferences">
      <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 mb-4">
        <h3 className="text-sm font-medium text-zinc-800 mb-2">Account Type</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-900">Creator Plan</p>
            <p className="text-xs text-zinc-500">Access to all creator features</p>
          </div>
          <StatusBadge status="success" label="Active" />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-800">Account Control</h3>
        <div className="space-y-2">
          <button type="button" className="w-full text-left px-4 py-3 flex justify-between items-center text-sm border border-zinc-200 rounded-md hover:bg-zinc-50">
            <span className="font-medium text-zinc-800">Download Your Data</span>
            <ChevronRight size={16} className="text-zinc-400" />
          </button>
          <button type="button" className="w-full text-left px-4 py-3 flex justify-between items-center text-sm border border-zinc-200 rounded-md hover:bg-zinc-50">
            <span className="font-medium text-red-600">Deactivate Account</span>
            <ChevronRight size={16} className="text-zinc-400" />
          </button>
        </div>
      </div>
    </FormSection>
  );
} 