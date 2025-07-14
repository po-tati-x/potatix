import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import type { NavItem } from '../config/static-nav';
import { cn } from '@/lib/shared/utils/cn';

interface DrillNavProps {
  items: NavItem[];
}

interface StackEntry {
  label: string;
  items: NavItem[];
}

export function DrillNav({ items }: DrillNavProps) {
  const [stack, setStack] = useState<StackEntry[]>([{ label: 'Course', items }]);
  const current = stack.at(-1)!;

  function handleItemClick(item: NavItem) {
    if (item.items && item.items.length > 0) {
      // Navigate deeper
      setStack((prev) => [...prev, { label: item.name, items: item.items! }]);
    }
  }

  function handleBack() {
    if (stack.length > 1) setStack((prev) => prev.slice(0, -1));
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Breadcrumb / Back */}
      {stack.length > 1 && (
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-emerald-700"
        >
          <ChevronLeft className="size-4" /> Back
        </button>
      )}

      <ul className="flex flex-col gap-1">
        {current.items.map((item) => (
          <li key={item.href}>
            {item.items && item.items.length > 0 ? (
              <button
                type="button"
                onClick={() => handleItemClick(item)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md p-2 text-left text-sm hover:bg-slate-200/60',
                )}
              >
                <span>{item.name}</span>
                <ChevronLeft className="size-4 rotate-180 text-slate-500" />
              </button>
            ) : (
              <Link
                href={item.href}
                className="block rounded-md p-2 text-sm hover:bg-slate-200/60"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
} 