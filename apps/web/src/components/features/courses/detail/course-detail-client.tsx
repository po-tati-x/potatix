"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Play,
  Lock,
  ExternalLink,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  Loader2,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/new-button";
import type { Module, Lesson } from "@/lib/shared/types/courses";
import { useCourseDetail } from "@/components/providers/courses/course-detail-context";

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusMap: Record<string, string> = {
    draft: "bg-amber-50 text-amber-700 border border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    archived: "bg-slate-50 text-slate-600 border border-slate-200",
  };

  const statusStyles =
    statusMap[status] || "bg-slate-50 text-slate-600 border border-slate-200";

  return (
    <div
      className={`px-3 py-1 text-sm font-medium rounded-md flex items-center ${statusStyles}`}
    >
      <span className="capitalize">{status}</span>
    </div>
  );
};

// Module component with collapsible content
const ModuleItem = ({ module, index }: { module: Module; index: number }) => {
  const { expandedModules, toggleModuleExpanded } = useCourseDetail();
  const moduleId = module.id;

  // Check if module is expanded
  const isExpanded = expandedModules[moduleId] ?? false;
  const hasLessons = module.lessons && module.lessons.length > 0;

  return (
    <div className="border border-slate-200 rounded-md overflow-hidden bg-white mb-4">
      <div
        className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between cursor-pointer"
        onClick={() => toggleModuleExpanded(moduleId)}
      >
        <div className="flex items-center gap-2">
          <div className="p-1 hover:bg-slate-200 rounded-md transition-colors">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </div>

          <h3 className="text-sm font-medium text-slate-900">
            {module.title || `Module ${index + 1}`}
          </h3>
        </div>

        <span className="text-xs text-slate-500">
          {module.lessons?.length || 0} lessons
        </span>
      </div>

      {isExpanded && hasLessons && (
        <div className="divide-y divide-slate-100">
          {module.lessons?.map((lesson: Lesson, idx: number) => (
            <div
              key={lesson.id}
              className="p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium">{idx + 1}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-slate-900 mb-1">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-xs text-slate-500">
                      {lesson.description}
                    </p>
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
      )}

      {isExpanded && !hasLessons && (
        <div className="p-4 text-center text-sm text-slate-500">
          No lessons in this module
        </div>
      )}
    </div>
  );
};

/**
 * Client component for the course detail page.
 * Uses the CourseDetailContext for state management.
 */
export default function CourseDetailClient({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Get all data and actions from context
  const { 
    course, 
    isLoading, 
    error, 
    deleteCourse, 
    isDeleting,
    formatDate
  } = useCourseDetail();

  // Handlers
  const handleDeleteCourse = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    await deleteCourse();
    setShowDeleteModal(false);
    router.push("/courses");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">Loading course data...</p>
      </div>
    );
  }

  // Error state
  if (error || !course || !course.id) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center py-10">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-lg">
            <h2 className="text-red-700 text-lg font-medium mb-2">
              Course Not Found
            </h2>
            <p className="text-red-600 mb-4">
              {error instanceof Error
                ? error.message
                : "The course you're looking for doesn't exist or you don't have access to it."}
            </p>
            <div className="flex justify-center">
              <Button
                type="outline"
                size="small"
                icon={<ArrowLeft className="h-3.5 w-3.5" />}
                onClick={() => router.push("/courses")}
              >
                Back to Courses
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const modules = course.modules || [];
  const lessons = course.lessons || [];
  const hasModules = modules.length > 0;

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
                <h3 className="text-sm font-medium text-slate-900">
                  Are you sure?
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  This will permanently delete the course and all associated
                  lessons.
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
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back Button - separated like in course-header */}
        <div className="mb-6">
          <Button
            type="text"
            size="tiny"
            icon={
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">
                <ArrowLeft className="h-3 w-3" />
              </span>
            }
            className="text-slate-500 hover:text-slate-900 group"
            onClick={() => router.push("/courses")}
          >
            Back to courses
          </Button>
        </div>

        {/* Header with border bottom like in course-header */}
        <header className="mb-6 border-b border-slate-200 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-medium text-slate-900">
                {course.title}
              </h1>
              <StatusBadge status={course.status} />
            </div>

            <div className="flex items-center gap-3">
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
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </header>

        {/* Course details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course image */}
            <div className="relative aspect-video rounded-md overflow-hidden bg-slate-100 border border-slate-200">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <FileText className="h-12 w-12 text-slate-300" />
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white border border-slate-200 rounded-md p-5">
              <h2 className="text-sm font-medium text-slate-900 mb-3">
                Description
              </h2>
              <div className="prose prose-sm max-w-none text-slate-700">
                {course.description || (
                  <p className="text-slate-500 italic">
                    No description provided
                  </p>
                )}
              </div>
            </div>

            {/* Modules and lessons */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-3 bg-slate-50">
                <h2 className="text-sm font-medium text-slate-900">
                  Course Content
                </h2>
              </div>

              <div className="p-5">
                {hasModules ? (
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <ModuleItem
                        key={module.id}
                        module={module}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <p className="mb-2">No modules or lessons yet</p>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => router.push(`/courses/${courseId}/edit`)}
                    >
                      Add Content
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course stats */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-3 bg-slate-50">
                <h2 className="text-sm font-medium text-slate-900">
                  Course Details
                </h2>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-shrink-0 text-slate-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="text-sm text-slate-900">
                      {formatDate(course.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-shrink-0 text-slate-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Price</p>
                    <p className="text-sm text-slate-900">
                      {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 flex items-center gap-3">
                  <div className="flex-shrink-0 text-slate-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Content</p>
                    <p className="text-sm text-slate-900">
                      {modules.length} modules, {lessons.length} lessons
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white border border-slate-200 rounded-md overflow-hidden">
              <div className="border-b border-slate-200 px-5 py-3 bg-slate-50">
                <h2 className="text-sm font-medium text-slate-900">Actions</h2>
              </div>

              <div className="p-5 space-y-3">
                <Button
                  type="primary"
                  size="small"
                  icon={<ExternalLink className="h-4 w-4" />}
                  className="w-full"
                  onClick={() => {
                      window.open(
                        `https://${course.slug}.potatix.com`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                  }}
                >
                  Preview Course
                </Button>

                <Button
                  type="outline"
                  size="small"
                  icon={<Users className="h-4 w-4" />}
                  className="w-full"
                  onClick={() => router.push(`/courses/${courseId}/students`)}
                >
                  Manage Students
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 