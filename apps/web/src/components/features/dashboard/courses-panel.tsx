'use client';

import { BookOpen, ChevronRight, DollarSign, LineChart, Play, Users } from 'lucide-react';
import { Button } from '@/components/ui/potatix/Button';
import Image from 'next/image';
import { useDashboardStore } from '@/lib/stores/dashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Course } from '@/lib/types/api';
import { formatPrice, formatNumber } from '@/lib/utils/format';

export function CoursesPanel() {
  const router = useRouter();
  
  // Get courses data and state from centralized store
  const { 
    courses, 
    isCoursesLoading, 
    coursesError, 
    fetchCourses 
  } = useDashboardStore();
  
  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);
  
  // Show only up to 3 courses in the dashboard
  const displayCourses = courses?.slice(0, 3) || [];

  // Navigation handlers
  const handleViewAllClick = () => {
    router.push('/courses');
  };
  
  const handleCourseClick = (courseId: string) => {
    router.push(`/courses/${courseId}`);
  };
  
  const handleStatsClick = (courseId: string) => {
    router.push(`/courses/${courseId}/stats`);
  };
  
  const handleContinueClick = (courseId: string) => {
    router.push(`/courses/${courseId}/edit`);
  };

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
      <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-900">Your Courses</h2>
          <Button
            type="text"
            size="tiny"
            onClick={handleViewAllClick}
            iconRight={<ChevronRight className="h-3.5 w-3.5" />}
          >
            View all
          </Button>
        </div>
      </div>
      
      {/* Loading state */}
      {isCoursesLoading && (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mb-2" />
          <p className="text-sm text-slate-500">Loading courses...</p>
        </div>
      )}
      
      {/* Error state */}
      {!isCoursesLoading && coursesError && (
        <div className="p-6 flex flex-col items-center justify-center">
          <div className="bg-red-50 text-red-700 rounded-md p-4 max-w-sm text-sm">
            Failed to load courses. Please try again.
            <Button
              type="danger"
              size="small"
              onClick={fetchCourses}
              block
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {!isCoursesLoading && !coursesError && displayCourses.length === 0 && (
        <div className="p-8 flex flex-col items-center justify-center text-center">
          <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-3">
            <BookOpen className="h-5 w-5 text-slate-400" />
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">No courses yet</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs">
            You don&apos;t have any courses yet. Create your first course to get started.
          </p>
          <Button
            type="outline"
            size="small"
            onClick={() => router.push('/courses/create')}
          >
            Create a Course
          </Button>
        </div>
      )}
      
      {/* Courses list */}
      {!isCoursesLoading && !coursesError && displayCourses.length > 0 && (
        <div className="divide-y divide-slate-100">
          {displayCourses.map(course => (
            <CourseCard 
              key={course.id}
              course={course}
              onCourseClick={() => handleCourseClick(course.id)}
              onStatsClick={() => handleStatsClick(course.id)}
              onContinueClick={() => handleContinueClick(course.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface CourseCardProps {
  course: Course;
  onCourseClick: () => void;
  onStatsClick: () => void;
  onContinueClick: () => void;
}

function CourseCard({ course, onCourseClick, onStatsClick, onContinueClick }: CourseCardProps) {
  // Adapt API data structure to the UI needs
  const courseData = {
    id: course.id,
    title: course.title,
    image: course.imageUrl || '',
    status: course.status,
    students: course.studentCount || 0, // Use actual student count from API
    revenue: course.price || 0 // This should be actual revenue when available
  };

  return (
    <div className="p-4 hover:bg-slate-50 transition-colors">
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-16 h-10 bg-slate-100 rounded overflow-hidden">
          {courseData.image ? (
            <Image 
              src={courseData.image} 
              alt={courseData.title} 
              width={64}
              height={40}
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-slate-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-slate-900 truncate">{courseData.title}</h3>
            <span className={`inline-flex text-xs px-2 py-0.5 rounded-full capitalize ${
              courseData.status === 'published' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {courseData.status}
            </span>
          </div>
          
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs text-slate-600">{formatNumber(courseData.students)}</span>
              </div>
              
              {courseData.status === 'published' && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-600">{formatPrice(courseData.revenue)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {courseData.status === 'published' ? (
                <Button
                  type="outline"
                  size="tiny"
                  icon={<LineChart className="h-3 w-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatsClick();
                  }}
                >
                  Stats
                </Button>
              ) : (
                <Button
                  type="outline"
                  size="tiny"
                  icon={<Play className="h-3 w-3" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onContinueClick();
                  }}
                >
                  Continue
                </Button>
              )}
              
              <Button
                type="text"
                size="tiny"
                icon={<ChevronRight className="h-3.5 w-3.5" />}
                onClick={onCourseClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 