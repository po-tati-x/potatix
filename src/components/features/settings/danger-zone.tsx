'use client';

import { AlertTriangle } from 'lucide-react';
import { SectionWrapper } from './section-wrapper';
import { Button } from '@/components/ui/potatix/Button';

type DangerZoneProps = {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  isDeletingAccount?: boolean;
};

export function DangerZone({ onSignOut, onDeleteAccount, isDeletingAccount = false }: DangerZoneProps) {
  return (
    <SectionWrapper title="Danger Zone" icon={AlertTriangle} className="!space-y-5">
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-2">Sign Out</h3>
        <p className="text-sm text-slate-600 mb-3">
          Sign out from the current session on this device.
        </p>
        <Button
          type="secondary"
          size="small"
          onClick={onSignOut}
        >
          Sign Out
        </Button>
      </div>
      
      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-medium text-red-600 mb-2">Delete Account</h3>
        <p className="text-sm text-slate-600 mb-3">
          Permanently delete your account and all of your data. This action cannot be undone.
        </p>
        <Button
          type="danger"
          size="small"
          onClick={onDeleteAccount}
          loading={isDeletingAccount}
          disabled={isDeletingAccount}
        >
          Delete Account
        </Button>
      </div>
    </SectionWrapper>
  );
} 