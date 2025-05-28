'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { useCourseEditStore } from '@/lib/stores/courseEditStore';
import { CourseLessonEditor } from '@/components/features/courses/DraggableLessonList';
import { Lesson } from '@/lib/stores/courseStore';

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
    reorderLessons
  } = useCourseEditStore() as any; // Using 'as any' to bypass TypeScript errors
  
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for price field to ensure it's a number
    if (name === 'price') {
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
      fileInputRef.current.value = '';
    }
  };

  // Handle lesson file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => {
    if (!e.target.files?.length) return;
    handleLessonFileUpload(e.target.files[0], lessonId);
  };

  // Update lesson field
  const handleUpdateLesson = (id: string, field: keyof Lesson, value: string) => {
    updateLesson(id, field, value);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href={`/courses/${courseId}`} className="text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-900">Edit Course</h1>
          </div>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic course info section */}
          <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
            <h2 className="text-lg font-medium text-neutral-900 border-b pb-2">Course Information</h2>
            
            {/* Course Image */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Cover Image
              </label>
              {!imagePreview ? (
                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
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
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <ImageIcon className="h-10 w-10 text-neutral-400 mb-2" />
                    <p className="text-sm font-medium text-neutral-700">
                      Upload course cover image
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      JPEG, PNG, or WebP (max 5MB)
                    </p>
                  </label>
                </div>
              ) : (
                <div className="border border-neutral-200 rounded-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <img
                      src={imagePreview}
                      alt="Course cover preview"
                      className="w-full h-full object-cover"
                      onError={() => removeImage()}
                    />
                    {imageUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-opacity-30 border-t-white"></div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-1 bg-black bg-opacity-60 text-white rounded-full hover:bg-opacity-80"
                      disabled={imageUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                Course Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter course title"
              />
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Describe your course"
              ></textarea>
            </div>
            
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-1">
                Price ($)
              </label>
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price || 0}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="0.00"
              />
            </div>
            
            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status || 'draft'}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          {/* Course content section */}
          <section>
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-neutral-900">Course Content</h2>
              <button 
                type="button"
                onClick={addLesson}
                className="px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
              >
                Add Lesson
              </button>
            </header>
            
            <CourseLessonEditor
              lessons={formData.lessons || []}
              onUpdateLesson={handleUpdateLesson}
              onRemoveLesson={removeLesson}
              onReorder={reorderLessons}
              onFileChange={handleFileChange}
              onFileRemove={removeLessonFile}
            />
          </section>
          
          {/* Buttons */}
          <div className="flex justify-end space-x-3">
            <Link href={`/courses/${courseId}`}>
              <button 
                type="button"
                className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
              >
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              disabled={saving || imageUploading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center space-x-2"
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
        </form>
      </div>
    </div>
  );
} 