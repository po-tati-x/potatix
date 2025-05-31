"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  Image as ImageIcon,
  Plus,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useCourseEditStore } from "@/lib/stores/courseEditStore";
import { CourseLessonEditor } from "@/components/features/courses/DraggableLessonList";
import { Lesson } from "@/lib/stores/courseStore";
import { Button } from "@/components/ui/potatix/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/potatix/dropdown-menu";

// Status badge component with proper typing
const StatusBadge = ({
  status,
  onChange,
}: {
  status: 'draft' | 'published' | 'archived';
  onChange: (status: 'draft' | 'published' | 'archived') => void;
}) => {
  const statusOptions = {
    draft: "bg-amber-50 text-amber-700 border border-amber-200",
    published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    archived: "bg-slate-50 text-slate-600 border border-slate-200",
  };
  
  const statusStyles = statusOptions[status] || statusOptions.archived;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={`px-3 py-1 text-sm font-medium rounded-md flex items-center gap-1.5 ${statusStyles} transition-colors duration-150 group`}>
          <span className="capitalize">{status}</span>
          <ChevronDown className="h-3 w-3 opacity-70 transition-transform duration-200 ease-in-out group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-32 bg-white rounded-md shadow-lg border border-slate-100 overflow-hidden p-0.5"
        sideOffset={4}
        avoidCollisions
        collisionPadding={8}
      >
        <DropdownMenuItem 
          className={`${status === 'draft' ? 'bg-amber-50 text-amber-700' : 'text-slate-700'} capitalize transition-colors duration-150 hover:bg-amber-50 hover:text-amber-700 rounded-sm`}
          onClick={() => onChange('draft')}
        >
          Draft
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`${status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'} capitalize transition-colors duration-150 hover:bg-emerald-50 hover:text-emerald-700 rounded-sm`}
          onClick={() => onChange('published')}
        >
          Published
        </DropdownMenuItem>
        <DropdownMenuItem 
          className={`${status === 'archived' ? 'bg-slate-50 text-slate-600' : 'text-slate-700'} capitalize transition-colors duration-150 hover:bg-slate-50 hover:text-slate-600 rounded-sm`}
          onClick={() => onChange('archived')}
        >
          Archived
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Form field component
const FormField = ({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-slate-700">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get state and actions from store
  const {
    formData,
    loading,
    saving,
    error,
    imagePreview,
    imageUploading,
    fetchCourse,
    setField,
    handleImageUpload,
    removeImage,
    saveCourse,

    // Lesson management actions
    addLesson,
    removeLesson,
    updateLesson,
    handleLessonFileUpload,
    removeLessonFile,
    reorderLessons,
  } = useCourseEditStore();

  // Load course data on component mount
  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId);
    }
  }, [courseId, fetchCourse]);

  // Handle image upload from input event
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    handleImageUpload(e.target.files[0]);
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "price") {
      setField("price", parseFloat(value) || 0);
    } else if (name === "title") {
      setField("title", value);
    } else if (name === "description") {
      setField("description", value);
    } else {
      // Fallback for other fields
      console.warn(`Unhandled field name: ${name}`);
    }
  };

  // Handle status change from dropdown
  const handleStatusChange = (status: 'draft' | 'published' | 'archived') => {
    setField('status', status);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveCourse();

    if (success) {
      router.push(`/courses/${courseId}`);
    }
  };

  // Reset file input when removing image
  const handleRemoveImage = () => {
    removeImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle lesson file upload
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    lessonId: string,
  ) => {
    if (!e.target.files?.length) return;
    handleLessonFileUpload(e.target.files[0], lessonId);
  };

  // Update lesson field
  const handleUpdateLesson = (
    id: string,
    field: keyof Lesson,
    value: string,
  ) => {
    updateLesson(id, field, value);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">Loading course data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back button */}
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
          onClick={() => router.push(`/courses/${courseId}`)}
        >
          Back to course
        </Button>
        
      </div>

      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-medium text-slate-900">Edit Course</h1>
            <StatusBadge
              status={formData.status || "draft"}
              onChange={handleStatusChange}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="outline"
              size="small"
              asChild
            >
              <Link href={`/courses/${courseId}`}>Cancel</Link>
            </Button>
            
            <Button
              type="primary"
              size="small"
              iconLeft={saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              onClick={handleSubmit}
              disabled={saving || imageUploading}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="mb-5 border border-red-200 bg-red-50 rounded-md p-3">
          <div className="flex">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form id="course-edit-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            {/* Basic Information */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                <h2 className="text-sm font-medium text-slate-900">Course Information</h2>
              </div>

              <div className="p-4 space-y-4">
                <FormField label="Course Title" required>
                  <input
                    name="title"
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="Enter a compelling course title"
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm resize-none"
                    placeholder="Describe what students will learn in this course"
                  />
                </FormField>

                <FormField label="Price" required>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-500 sm:text-sm">$</span>
                    </div>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price || 0}
                      onChange={handleChange}
                      className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Course Content */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-slate-900">Course Content</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Add lessons and organize your course content</p>
                </div>
                <Button
                  type="primary"
                  size="small"
                  iconLeft={<Plus className="h-3.5 w-3.5" />}
                  onClick={addLesson}
                >
                  Add Lesson
                </Button>
              </div>

              <div className="p-4">
                <CourseLessonEditor
                  lessons={formData.lessons || []}
                  onUpdateLesson={handleUpdateLesson}
                  onRemoveLesson={removeLesson}
                  onReorder={reorderLessons}
                  onFileChange={handleFileChange}
                  onFileRemove={removeLessonFile}
                  addLesson={addLesson}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Cover Image */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                <h2 className="text-sm font-medium text-slate-900">Cover Image</h2>
              </div>

              <div className="p-4">
                {!imagePreview ? (
                  <div className="border border-dashed border-slate-300 rounded-md p-4 text-center hover:border-slate-400 transition-colors">
                    <input
                      type="file"
                      id="cover-image"
                      className="hidden"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                    />

                    <label
                      htmlFor="cover-image"
                      className="flex flex-col items-center justify-center cursor-pointer group"
                    >
                      <div className="h-9 w-9 bg-slate-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-slate-200 transition-colors">
                        <ImageIcon className="h-4 w-4 text-slate-500" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        Upload cover image
                      </p>
                      <p className="text-xs text-slate-500">
                        JPEG, PNG, or WebP (max 5MB)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-md overflow-hidden">
                      <div className="relative aspect-video bg-slate-100">
                        <Image
                          src={imagePreview || ''}
                          alt="Course cover preview"
                          className="object-cover"
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          onError={() => removeImage()}
                        />
                        {imageUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <Loader2 className="h-5 w-5 text-white animate-spin" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-colors"
                          disabled={imageUploading}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <Button
                      type="outline"
                      size="small"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="w-full"
                    >
                      Change Image
                    </Button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
              <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50">
                <h2 className="text-sm font-medium text-slate-900">Course Stats</h2>
              </div>

              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Lessons</span>
                  <span className="text-sm font-medium text-slate-900">
                    {formData.lessons?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="text-xs font-medium capitalize text-slate-900">
                    {formData.status || "draft"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Price</span>
                  <span className="text-sm font-medium text-slate-900">
                    ${(formData.price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
