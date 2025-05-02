'use client';

import React from 'react';
import { FormSection } from '@/components/ui/form-section';

export function BillingTab() {
  return (
    <FormSection title="Billing & Payments" description="Manage your payment methods and billing history">
      <div className="bg-zinc-50 border border-zinc-200 rounded-md p-4 mb-4">
        <h3 className="text-sm font-medium text-zinc-800 mb-2">Current Plan</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-900">Creator Pro ($29/month)</p>
            <p className="text-xs text-zinc-500">Next billing date: June 15, 2023</p>
          </div>
          <button type="button" className="px-3 py-1.5 bg-white border border-zinc-300 text-xs font-medium rounded-md hover:bg-zinc-50">
            Change Plan
          </button>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <h3 className="text-sm font-medium text-zinc-800 mb-2">Payment Methods</h3>
        <div className="border border-zinc-200 rounded-md overflow-hidden">
          <div className="px-4 py-3 flex justify-between items-center border-b border-zinc-200">
            <div className="flex items-center">
              <div className="h-8 w-12 bg-zinc-100 rounded mr-3 flex items-center justify-center text-xs font-medium">VISA</div>
              <div>
                <p className="text-sm font-medium text-zinc-900">•••• 4242</p>
                <p className="text-xs text-zinc-500">Expires 12/25</p>
              </div>
            </div>
            <span className="text-xs bg-zinc-100 px-2 py-1 rounded">Default</span>
          </div>
        </div>
        <button type="button" className="text-xs text-zinc-700 font-medium flex items-center">
          <span className="mr-1">+</span> Add Payment Method
        </button>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-zinc-800 mb-2">Billing History</h3>
        <div className="border border-zinc-200 rounded-md overflow-hidden">
          <div className="px-4 py-3 flex justify-between items-center border-b border-zinc-200">
            <div>
              <p className="text-sm font-medium text-zinc-900">May 15, 2023</p>
              <p className="text-xs text-zinc-500">Invoice #1043</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">$29.00</p>
              <p className="text-xs text-green-600">Paid</p>
            </div>
          </div>
          <div className="px-4 py-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-zinc-900">Apr 15, 2023</p>
              <p className="text-xs text-zinc-500">Invoice #1024</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-zinc-900">$29.00</p>
              <p className="text-xs text-green-600">Paid</p>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );
} 