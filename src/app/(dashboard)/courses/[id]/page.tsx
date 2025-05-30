'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Edit, Trash2, BookOpen, Play, Lock, ExternalLink, 
  Calendar, DollarSign, Clock, FileText, AlertTriangle, X, Loader2, Users
} from 'lucide-react';
import { useCourseDetailStore } from '@/lib/stores/courseDetailStore';
import Modal from '@/components/ui/potatix/Modal';
import { Button } from '@/components/ui/potatix/Button';

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, string> = {
    draft: "bg-amber-50 text-amber-700 border border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200", 
    archived: "bg-slate-50 text-slate-600 border border-slate-200"
  };
  
  const statusStyles = statusMap[status] || "bg-slate-50 text-slate-600 border border-slate-200";
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-md ${statusStyles}`}>
      {status}
    </span>
  );
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
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
  
  const handleDeleteCourse = () => {
    setShowDeleteModal(true);
  };
  
  const confirmDelete = async () => {
    const success = await deleteCourse();
    if (success) {
      router.push('/courses');
    }
    setShowDeleteModal(false);
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
        <Loader2 className="h-6 w-6 text-slate-400 animate-spin" />
      </div>
    );
  }
  
  // Error state
  if (error || !course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center py-10">
          <div className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 bg-slate-50 mb-4">
            <BookOpen className="h-6 w-6 text-slate-400" />
          </div>
          <h1 className="text-xl font-medium text-slate-900 mb-2">Course Not Found</h1>
          <p className="text-slate-600 mb-6 max-w-md">
            {error || "The course you're looking for doesn't exist or you don't have access to it."}
          </p>
          <Button
            type="outline"
            size="small"
            icon={<ArrowLeft />}
            onClick={() => router.push("/courses")}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const lessons = course.lessons || [];
  const hasLessons = lessons.length > 0;

  return (
    <>
      {showDeleteModal && (
        <Modal
          title="Delete Course"
          onClose={() => setShowDeleteModal(false)}
          size="sm"
          blurStrength="lg"
        >
          <div className="p-5">
            <div className="flex gap-3 mb-4">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-900">Are you sure?</h3>
                <p className="mt-1 text-sm text-slate-600">
                  This will permanently delete the course and all associated lessons.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <Button
                type="outline"
                size="small"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="danger"
                size="small"
                onClick={confirmDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
      
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back link */}
        <div className="mb-8">
          <Button
            type="text"
            size="tiny"
            icon={<ArrowLeft className="h-3 w-3" />}
            className="text-slate-500 hover:text-slate-900"
            onClick={() => router.push("/courses")}
          >
            Back to courses
          </Button>
        </div>
        
        {/* Header */}
        <header className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-medium text-slate-900">{course.title}</h1>
                <StatusBadge status={course.status} />
              </div>
              
              {course.description && (
                <p className="text-sm text-slate-600 max-w-2xl">
                  {course.description}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0 mt-2 md:mt-0">
              <Button
                type="outline"
                size="small"
                icon={<Edit className="h-3.5 w-3.5" />}
                onClick={() => router.push(`/courses/${courseId}/edit`)}
              >
                Edit
              </Button>
              
              <Button 
                type="danger"
                size="small"
                icon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={handleDeleteCourse}
              >
                Delete
              </Button>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Main content */}
          <div className="md:col-span-2 space-y-6">
            {/* Cover image */}
            <div className="aspect-video border border-slate-200 rounded-md overflow-hidden bg-slate-50">
              {course.imageUrl ? (
                <img 
                  src={course.imageUrl} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <BookOpen className="h-10 w-10 text-slate-300 mb-2" />
                  <span className="text-xs text-slate-400">No cover image</span>
                </div>
              )}
            </div>
            
            {/* Lessons */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-slate-900">Course Content</h2>
                  <span className="text-xs text-slate-500">{lessons.length} lessons</span>
                </div>
              </div>
              
              {hasLessons ? (
                <div className="divide-y divide-slate-100">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-slate-900 mb-1">{lesson.title}</h3>
                          {lesson.description && (
                            <p className="text-xs text-slate-500">{lesson.description}</p>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          {lesson.videoId ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-xs">
                              <Play className="h-2.5 w-2.5" />
                              <span>Video</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded text-xs">
                              <Lock className="h-2.5 w-2.5" />
                              <span>No Video</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-4 text-center">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 mb-3">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 mb-1">No lessons yet</h3>
                  <p className="text-xs text-slate-500 mb-4">Start building your course by adding lessons.</p>
                  <Button
                    type="primary"
                    size="small"
                    icon={<Edit className="h-3.5 w-3.5" />}
                    onClick={() => router.push(`/courses/${courseId}/edit`)}
                  >
                    Add Lessons
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Right column - Sidebar */}
          <div className="space-y-5">
            {/* Course details */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                <h3 className="text-sm font-medium text-slate-900">Course Details</h3>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border border-slate-200 rounded-full flex items-center justify-center bg-slate-50">
                    <DollarSign className="h-3 w-3 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Price</p>
                    <p className="text-sm font-medium text-slate-900">${course.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border border-slate-200 rounded-full flex items-center justify-center bg-slate-50">
                    <Users className="h-3 w-3 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Lessons</p>
                    <p className="text-sm font-medium text-slate-900">{lessons.length}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border border-slate-200 rounded-full flex items-center justify-center bg-slate-50">
                    <Calendar className="h-3 w-3 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="text-sm font-medium text-slate-900">{formatDate(course.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border border-slate-200 rounded-full flex items-center justify-center bg-slate-50">
                    <Clock className="h-3 w-3 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Updated</p>
                    <p className="text-sm font-medium text-slate-900">{formatDate(course.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Public URL */}
            {course.status === 'published' && course.slug && (
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
                <div className="border-b border-slate-200 px-4 py-3 bg-slate-50">
                  <h3 className="text-sm font-medium text-slate-900">Public URL</h3>
                </div>
                
                <div className="p-4">
                  <Link 
                    href={`/viewer/${course.slug}`}
                    target="_blank"
                    className="group flex items-center gap-2 p-2.5 border border-slate-200 rounded-md hover:border-slate-300 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">/viewer/{course.slug}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Public course link</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
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