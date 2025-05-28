'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Trash2, BookOpen, Play, Lock, ExternalLink, 
  Calendar, DollarSign, Clock, FileText, AlertTriangle, X, Loader2, Users
} from 'lucide-react';
import { useCourseDetailStore } from '@/lib/stores/courseDetailStore';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles = {
    draft: "bg-amber-50 text-amber-800 border-amber-200",
    published: "bg-emerald-50 text-emerald-800 border-emerald-200", 
    archived: "bg-neutral-100 text-neutral-600 border-neutral-200"
  }[status as keyof typeof statusStyles] || "bg-neutral-100 text-neutral-600 border-neutral-200";
  
  return (
    <span className={`px-3 py-1.5 text-sm font-medium rounded-full border capitalize ${statusStyles}`}>
      {status}
    </span>
  );
};

// Delete modal component
function DeleteModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  courseTitle 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  courseTitle: string;
}) {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">Delete Course</h3>
              <p className="text-sm text-neutral-600">This action cannot be undone.</p>
            </div>
            <button 
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-neutral-700 mb-2">Are you sure you want to delete:</p>
          <p className="font-semibold text-neutral-900 mb-4">{courseTitle}</p>
          <p className="text-sm text-neutral-600 mb-6">
            All course content, lessons, and videos will be permanently removed.
          </p>
          
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const {
    course,
    loading,
    error,
    fetchCourse,
    deleteCourse,
  } = useCourseDetailStore();
  
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);
  
  const handleDeleteCourse = () => setIsDeleteModalOpen(true);
  
  const confirmDelete = async () => {
    const success = await deleteCourse();
    if (success) {
      router.push('/courses');
    }
    setIsDeleteModalOpen(false);
  };
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-neutral-300 animate-spin mb-4" />
          <p className="text-neutral-500">Loading course...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !course) {
    return (
      <div className="min-h-full w-full py-12 px-8 max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
            <BookOpen className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Course Not Found</h1>
          <p className="text-neutral-600 mb-8">
            {error || "The course you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Link 
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Courses</span>
          </Link>
        </div>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const hasLessons = lessons.length > 0;

  return (
    <>
      <DeleteModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        courseTitle={course.title}
      />
      
      <div className="min-h-full w-full py-12 px-8 max-w-7xl mx-auto">
        {/* Back button */}
        <div className="mb-8">
          <Link 
            href="/courses" 
            className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to courses</span>
          </Link>
        </div>
        
        {/* Header */}
        <header className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Title and status */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900">{course.title}</h1>
                <StatusBadge status={course.status} />
              </div>
              
              {course.description && (
                <p className="text-lg text-neutral-600 max-w-3xl leading-relaxed">
                  {course.description}
                </p>
              )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link 
                href={`/courses/${courseId}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Link>
              
              <button 
                onClick={handleDeleteCourse}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors font-medium"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Course image */}
            <div className="aspect-video bg-neutral-100 rounded-xl overflow-hidden">
              {course.imageUrl ? (
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <BookOpen className="h-16 w-16 text-neutral-300 mb-4" />
                  <span className="text-neutral-400">No cover image</span>
                </div>
              )}
            </div>
            
            {/* Course content */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="border-b border-neutral-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-neutral-900">Course Content</h2>
                  <span className="text-sm text-neutral-500">{lessons.length} lessons</span>
                </div>
              </div>
              
              {hasLessons ? (
                <div className="divide-y divide-neutral-100">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="p-6 hover:bg-neutral-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-neutral-900 mb-2">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-neutral-600 leading-relaxed">{lesson.description}</p>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          {lesson.videoId ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              <Play className="h-3 w-3" />
                              <span>Video</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium">
                              <Lock className="h-3 w-3" />
                              <span>No Video</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mb-6">
                    <FileText className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No lessons yet</h3>
                  <p className="text-neutral-500 mb-6">Start building your course by adding lessons.</p>
                  <Link 
                    href={`/courses/${courseId}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Add Lessons</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course details */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="border-b border-neutral-200 px-6 py-4">
                <h3 className="font-semibold text-neutral-900">Course Details</h3>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Price</p>
                    <p className="font-semibold text-neutral-900">${course.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Lessons</p>
                    <p className="font-semibold text-neutral-900">{lessons.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Created</p>
                    <p className="font-semibold text-neutral-900">{formatDate(course.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Updated</p>
                    <p className="font-semibold text-neutral-900">{formatDate(course.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Public URL */}
            {course.status === 'published' && course.slug && (
              <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
                <div className="border-b border-neutral-200 px-6 py-4">
                  <h3 className="font-semibold text-neutral-900">Public URL</h3>
                </div>
                
                <div className="p-6">
                  <Link 
                    href={`/viewer/${course.slug}`}
                    target="_blank"
                    className="group flex items-center gap-2 p-3 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">/viewer/{course.slug}</p>
                      <p className="text-xs text-neutral-500 mt-1">Public course link</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}