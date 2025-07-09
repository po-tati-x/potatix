import React, { type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/new-button';
import { PlusCircle } from 'lucide-react';

export function IconButton({
  icon: Icon,
  onClick,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-6 items-center justify-center rounded text-slate-500 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600"
    >
      <Icon className="size-4" />
    </button>
  );
}

export function AddModuleButton({ courseSlug }: { courseSlug: string }) {
  const router = useRouter();
  const handleClick = () => {
    if (courseSlug) {
      router.push(`/courses/${courseSlug}/edit?addModule=1`);
    }
  };
  return (
    <Button
      type="outline"
      size="small"
      block
      iconLeft={<PlusCircle />}
      className="justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50"
      aria-label="Add module"
      onClick={handleClick}
    >
      Add module
    </Button>
  );
} 