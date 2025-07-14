import React, { type ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/new-button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useCreateModule } from '@/lib/client/hooks/use-courses';

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

interface AddModuleButtonProps {
  courseSlug: string;
  courseId: string;
}

export function AddModuleButton({ courseSlug, courseId }: AddModuleButtonProps) {
  const router = useRouter();
  const { mutate: createModule, isPending } = useCreateModule();

  const handleClick = () => {
    if (!courseId) {
      // fallback navigate if id missing
      router.push(`/courses/${courseSlug}/edit?addModule=1`);
      return;
    }
    createModule({ courseId, title: 'New Module' });
  };

  return (
    <Button
      type="outline"
      size="small"
      block
      iconLeft={isPending ? <Loader2 className="animate-spin" /> : <PlusCircle />}
      className={`justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 ${
        isPending ? 'opacity-60 cursor-not-allowed' : ''
      }`}
      aria-label="Add module"
      onClick={handleClick}
      disabled={isPending}
    >
      Add module
    </Button>
  );
} 