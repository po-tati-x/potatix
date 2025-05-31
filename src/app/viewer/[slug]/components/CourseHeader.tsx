import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CourseHeaderProps {
  title: string;
  totalLessons: number;
}

export function CourseHeader({ title, totalLessons }: CourseHeaderProps) {
  const router = useRouter();
  
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/courses')}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Back to courses"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </button>
          
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 line-clamp-1">{title}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{totalLessons} {totalLessons === 1 ? 'lesson' : 'lessons'} available</p>
          </div>
        </div>
      </div>
    </header>
  );
}