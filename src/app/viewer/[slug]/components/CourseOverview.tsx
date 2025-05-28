import { BookOpen, Calendar, Users, Play } from 'lucide-react';
import { Course } from '@/lib/utils/api-client';

interface CourseOverviewProps {
  course: Course;
  totalLessons: number;
  lessonsWithVideos: number;
}

export function CourseOverview({ course, totalLessons, lessonsWithVideos }: CourseOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Course image placeholder */}
      <div className="aspect-video bg-neutral-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
          <p className="text-neutral-500">Select a lesson to start learning</p>
        </div>
      </div>
      
      {/* Course description */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">About This Course</h2>
        <div className="prose prose-neutral max-w-none">
          <p className="text-neutral-700 leading-relaxed text-lg">
            {course.description || 'No description available for this course.'}
          </p>
        </div>
      </div>
      
      {/* Course stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center p-6 bg-neutral-50 rounded-xl">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="h-6 w-6 text-neutral-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{totalLessons}</div>
          <div className="text-sm text-neutral-500 mt-1">Total Lessons</div>
        </div>
        
        <div className="text-center p-6 bg-neutral-50 rounded-xl">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Play className="h-6 w-6 text-neutral-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">{lessonsWithVideos}</div>
          <div className="text-sm text-neutral-500 mt-1">Video Lessons</div>
        </div>
        
        <div className="text-center p-6 bg-neutral-50 rounded-xl">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="h-6 w-6 text-neutral-600" />
          </div>
          <div className="text-2xl font-bold text-neutral-900">
            {course.createdAt ? new Date(course.createdAt).getFullYear() : 'N/A'}
          </div>
          <div className="text-sm text-neutral-500 mt-1">Created</div>
        </div>
      </div>
    </div>
  );
}