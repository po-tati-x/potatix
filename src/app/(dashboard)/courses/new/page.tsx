'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CourseForm } from '@/components/features/courses/CourseForm';
import { CourseLessonEditor } from '@/components/features/courses/DraggableLessonList';
import { useCourseStore } from '@/lib/stores/courseStore';

export default function NewCoursePage() {
  const router = useRouter();
  
  // Get state and actions from store
  const {
    title,
    description,
    price,
    imageUrl,
    lessons,
    uploading,
    submitting,
    setTitle,
    setDescription,
    setPrice,
    setImageUrl,
    addLesson,
    removeLesson,
    updateLesson,
    moveLesson,
    handleFileUpload,
    removeFile,
    submitCourse,
    reorderLessons
  } = useCourseStore();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const courseId = await submitCourse();
    if (courseId) {
      router.push(`/courses/${courseId}`);
    }
  };
  
  // File change handler - adapts from event to store action
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => {
    if (!e.target.files?.length) return;
    handleFileUpload(e.target.files[0], lessonId);
  };
  
  return (
    <div className="min-h-full w-full py-6 px-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <Link href="/courses" className="text-neutral-500 hover:text-neutral-700">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-semibold text-neutral-900">Create New Course</h1>
          </div>
          <p className="pl-6 text-sm text-neutral-500">
            Upload videos, set a price, and start selling
          </p>
        </div>
        
        {/* Course form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Details */}
          <CourseForm 
            title={title}
            description={description}
            price={price}
            imageUrl={imageUrl}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onPriceChange={setPrice}
            onImageUploaded={setImageUrl}
            onImageRemoved={() => setImageUrl(null)}
          />
          
          {/* Lessons Section */}
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
              lessons={lessons}
              onUpdateLesson={updateLesson}
              onRemoveLesson={removeLesson}
              onReorder={reorderLessons}
              onFileChange={handleFileChange}
              onFileRemove={removeFile}
            />
          </section>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-4">
            <Link href="/courses">
              <button
                type="button"
                className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50"
              >
                Cancel
              </button>
            </Link>
            
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 flex items-center"
              disabled={uploading || submitting || lessons.length === 0}
            >
              {uploading ? 'Uploading...' : submitting ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 