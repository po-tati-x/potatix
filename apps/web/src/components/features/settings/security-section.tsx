'use client';

import { ShieldOff } from "lucide-react";
import { SectionWrapper } from "./section-wrapper";

export function SecuritySection() {
  return (
    <SectionWrapper title="Security" icon={ShieldOff}>
      <div className="flex flex-col items-center justify-center text-center py-6">
        <ShieldOff className="h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm text-slate-600 max-w-xs">
          Password change functionality will land in the next release. Sit tight – your account is still protected.
        </p>
      </div>
    </SectionWrapper>
  );
} 