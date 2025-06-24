'use client';

import { MessageSquare, Gift, Bell } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface UtilityButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
}

export function UtilityButton({ icon: Icon, onClick }: UtilityButtonProps) {
  return (
    <button 
      className="flex items-center text-sm text-neutral-600 gap-2 rounded-md p-1.5 hover:bg-neutral-200/50"
      onClick={onClick}
    >
      <Icon className="size-4" />
    </button>
  );
}

export function HelpButton({ onClick }: { onClick?: () => void }) {
  return <UtilityButton icon={MessageSquare} onClick={onClick} />;
}

export function ReferButton({ onClick }: { onClick?: () => void }) {
  return <UtilityButton icon={Gift} onClick={onClick} />;
}

export function NewsComponent() {
  return (
    <div className="px-3 pb-2">
      <div className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-3 text-sm">
        <Bell className="size-4 flex-shrink-0 text-neutral-400" />
        <p className="line-clamp-2 text-neutral-600">
          Latest updates
        </p>
      </div>
    </div>
  );
} 