import { BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';

interface DashboardHeaderProps {
  userName: string;
  onCoursesClick: () => void;
  onNewCourseClick: () => void;
}

export function DashboardHeader({ userName, onCoursesClick, onNewCourseClick }: DashboardHeaderProps) {
  return (
    <header className="mb-6 border-b border-slate-200 pb-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Welcome back, {userName.split(' ')[0]}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            type="outline"
            size="small"
            icon={<BookOpen className="h-3.5 w-3.5" />}
            onClick={onCoursesClick}
          >
            My Courses
          </Button>
          <Button
            type="primary"
            size="small"
            icon={<Plus className="h-3.5 w-3.5" />}
            onClick={onNewCourseClick}
          >
            New Course
          </Button>
        </div>
      </div>
    </header>
  );
} 