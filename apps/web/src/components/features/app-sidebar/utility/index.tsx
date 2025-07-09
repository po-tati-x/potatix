'use client';

import { MessageSquare, Gift } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface UtilityButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
}

function UtilityButton({ icon: Icon, onClick }: UtilityButtonProps) {
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