"use client";

import { AlertTriangle } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";
import { Button } from "@/components/ui/new-button";

type DangerZoneProps = {
  onSignOut: () => void;
  onDeleteAccount: () => void;
  isDeletingAccount?: boolean;
};

export function DangerZone({
  onSignOut,
  onDeleteAccount,
  isDeletingAccount = false,
}: DangerZoneProps) {
  return (
    <SectionWrapper
      title="Danger Zone"
      icon={AlertTriangle}
      className="!space-y-5"
    >
      <div>
        <h3 className="text-sm font-medium text-slate-900 mb-2">Sign Out</h3>
        <p className="text-sm text-slate-600 mb-3">
          Sign out from this device. You can sign back in anytime.
        </p>
        <Button
          type="outline"
          size="small"
          block
          onClick={onSignOut}
        >
          Sign Out
        </Button>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <h3 className="text-sm font-medium text-red-600 mb-2">
          Delete Account
        </h3>
        <p className="text-sm text-slate-600 mb-3">
          This will permanently erase all your data. <span className="font-semibold">This action cannot be undone.</span>
        </p>
        <Button
          type="danger"
          size="small"
          block
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
