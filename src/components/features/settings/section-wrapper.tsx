import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

type SectionProps = {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
};

export function SectionWrapper({ title, icon: Icon, children, className = '' }: SectionProps) {
  return (
    <section className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4 text-slate-600" />
          <h2 className="text-sm font-medium text-slate-900">{title}</h2>
        </div>
      </div>
      
      <div className={`p-4 space-y-4 ${className}`}>
        {children}
      </div>
    </section>
  );
} 