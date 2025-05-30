'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Save } from 'lucide-react';
import { CourseForm } from '@/components/features/courses/CourseForm';
import { CourseLessonEditor } from '@/components/features/courses/DraggableLessonList';
import { useCourseStore } from '@/lib/stores/courseStore';
import { Button } from '@/components/ui/potatix/Button';

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
          onClick={() => router.push('/courses')}
        >
          Back to courses
        </Button>
      </div>
      
      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Create New Course</h1>
            <p className="mt-1 text-sm text-slate-600">
              Upload videos, set a price, and start selling
            </p>
          </div>
        </div>
      </header>
      
      {/* Course form */}
      <form onSubmit={handleSubmit} className="space-y-5">
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
        <div className="border border-slate-200 rounded-md overflow-hidden bg-white">
          <div className="border-b border-slate-200 px-4 py-2.5 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium text-slate-900">Course Content</h2>
              <p className="text-xs text-slate-500 mt-0.5">Add lessons and organize your course content</p>
            </div>
            <Button 
              type="primary"
              size="small"
              icon={<Plus className="h-3.5 w-3.5" />}
              onClick={addLesson}
            >
              Add Lesson
            </Button>
          </div>
          
          <div className="p-4">
            <CourseLessonEditor
              lessons={lessons}
              onUpdateLesson={updateLesson}
              onRemoveLesson={removeLesson}
              onReorder={reorderLessons}
              onFileChange={handleFileChange}
              onFileRemove={removeFile}
              addLesson={addLesson}
            />
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end items-center gap-3 pt-3">
          <Button
            type="outline"
            size="small"
            onClick={() => router.push('/courses')}
          >
            Cancel
          </Button>
          
          <Button
            type="primary"
            size="small"
            icon={<Save className="h-3.5 w-3.5" />}
            disabled={uploading || submitting || !title || lessons.length === 0}
            onClick={handleSubmit}
          >
            {submitting ? 'Creating...' : 'Create Course'}
          </Button>
        </div>
      </form>
    </div>
  );
} 