"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  X,
  Image as ImageIcon,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { useCourseEditStore } from "@/lib/stores/courseEditStore";
import { CourseLessonEditor } from "@/components/features/courses/DraggableLessonList";
import { Lesson } from "@/lib/stores/courseStore";

// Status badge component
const StatusBadge = ({
  status,
  onChange,
}: {
  status: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => {
  const statusStyles =
    {
      draft: "bg-amber-50 text-amber-800 border-amber-200",
      published: "bg-emerald-50 text-emerald-800 border-emerald-200",
      archived: "bg-neutral-100 text-neutral-600 border-neutral-200",
    }[status as keyof typeof statusStyles] ||
    "bg-neutral-100 text-neutral-600 border-neutral-200";

  return (
    <div className="relative">
      <select
        name="status"
        value={status}
        onChange={onChange}
        className={`px-3 py-1.5 text-sm font-medium rounded-full border capitalize cursor-pointer appearance-none pr-8 ${statusStyles} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
      >
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
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
  <div className="space-y-2">
    <label className="block text-sm font-medium text-neutral-700">
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
  } = useCourseEditStore() as any;

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
      setField(name, parseFloat(value) || 0);
    } else {
      setField(name as any, value);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-neutral-300 animate-spin mb-4" />
          <p className="text-neutral-500 animate-pulse">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full py-12 px-8 max-w-7xl mx-auto">
      {/* Back button */}
      <div className="mb-8">
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          <span>Back to course</span>
        </Link>
      </div>

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
            Edit Course
          </h1>
          <StatusBadge
            status={formData.status || "draft"}
            onChange={handleChange}
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${courseId}`}
            className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 hover:border-neutral-400 transition-all text-sm font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="course-edit-form"
            disabled={saving || imageUploading}
            className="px-5 py-2 bg-black text-white rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors text-sm font-medium"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Error message */}
      {error && (
        <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      <form id="course-edit-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <h2 className="text-xl font-semibold text-neutral-900">
                  Course Information
                </h2>
              </div>

              <div className="p-6 space-y-6">
                <FormField label="Course Title" required>
                  <input
                    name="title"
                    type="text"
                    required
                    value={formData.title || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="Enter a compelling course title"
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                    placeholder="Describe what students will learn in this course"
                  />
                </FormField>

                <FormField label="Price" required>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-neutral-500 sm:text-sm">$</span>
                    </div>
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price || 0}
                      onChange={handleChange}
                      className="w-full pl-7 pr-4 py-3 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Course Content */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">
                    Course Content
                  </h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    Add lessons and organize your course content
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addLesson}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Lesson</span>
                </button>
              </div>

              <div className="p-6">
                <CourseLessonEditor
                  lessons={formData.lessons || []}
                  onUpdateLesson={handleUpdateLesson}
                  onRemoveLesson={removeLesson}
                  onReorder={reorderLessons}
                  onFileChange={handleFileChange}
                  onFileRemove={removeLessonFile}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cover Image */}
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Cover Image
                </h2>
              </div>

              <div className="p-6">
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors">
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
                      <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-neutral-200 transition-colors">
                        <ImageIcon className="h-6 w-6 text-neutral-500" />
                      </div>
                      <p className="text-sm font-medium text-neutral-700 mb-1">
                        Upload cover image
                      </p>
                      <p className="text-xs text-neutral-500">
                        JPEG, PNG, or WebP (max 5MB)
                      </p>
                    </label>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="relative aspect-video bg-neutral-100">
                        <img
                          src={imagePreview}
                          alt="Course cover preview"
                          className="w-full h-full object-cover"
                          onError={() => removeImage()}
                        />
                        {imageUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80 transition-colors"
                          disabled={imageUploading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors text-sm font-medium"
                      disabled={imageUploading}
                    >
                      Change Image
                    </button>

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
            <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
              <div className="bg-neutral-50 border-b border-neutral-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-neutral-900">
                  Course Stats
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Lessons</span>
                  <span className="text-lg font-semibold text-neutral-900">
                    {formData.lessons?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Status</span>
                  <span className="text-sm font-medium capitalize text-neutral-900">
                    {formData.status || "draft"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-500">Price</span>
                  <span className="text-lg font-semibold text-neutral-900">
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
