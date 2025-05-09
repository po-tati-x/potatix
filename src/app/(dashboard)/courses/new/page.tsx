'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

// Define the Lesson type
interface Lesson {
  id: string;
  title: string;
  description: string;
  file?: File;
  fileName?: string;
  fileSize?: string;
  progress: number;
}

export default function NewCoursePage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  // Basic course details state
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  
  // Mock form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that we have at least one lesson
    if (lessons.length === 0) {
      alert('Please add at least one lesson to your course');
      return;
    }
    
    // In a real implementation, this would make API calls to create the course
    setTimeout(() => {
      router.push('/courses');
    }, 1000);
  };
  
  // Add a new lesson
  const addLesson = () => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      description: '',
      progress: 0
    };
    
    setLessons([...lessons, newLesson]);
  };
  
  // Remove a lesson
  const removeLesson = (lessonId: string) => {
    setLessons(lessons.filter(lesson => lesson.id !== lessonId));
  };
  
  // Update lesson details
  const updateLesson = (lessonId: string, field: keyof Lesson, value: string) => {
    setLessons(prevLessons => {
      return prevLessons.map(lesson => {
        if (lesson.id === lessonId) {
          return { ...lesson, [field]: value };
        }
        return lesson;
      });
    });
  };
  
  // Handle file upload for a lesson
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, lessonId: string) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    
    const file = e.target.files[0];
    const fileSize = (file.size / (1024 * 1024)).toFixed(2) + 'MB';
    
    setLessons(prevLessons => {
      return prevLessons.map(lesson => {
        if (lesson.id === lessonId) {
          return { 
            ...lesson, 
            file, 
            fileName: file.name, 
            fileSize, 
            progress: 0 
          };
        }
        return lesson;
      });
    });
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setLessons(prevLessons => {
        const updatedLessons = prevLessons.map(lesson => {
          if (lesson.id === lessonId && lesson.progress < 100) {
            return {
              ...lesson,
              progress: lesson.progress + 10
            };
          }
          return lesson;
        });
        
        // Check if all uploads are complete
        const allComplete = updatedLessons.every(lesson => 
          !lesson.file || lesson.progress === 100
        );
        
        if (allComplete) {
          clearInterval(interval);
          setUploading(false);
        }
        
        return updatedLessons;
      });
    }, 300);
  };
  
  // Move a lesson up or down in the order
  const moveLesson = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === lessons.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newLessons = [...lessons];
    const [movedLesson] = newLessons.splice(index, 1);
    newLessons.splice(newIndex, 0, movedLesson);
    
    setLessons(newLessons);
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
          <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h3 className="text-md font-medium text-neutral-900">Course Details</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                    Course Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="e.g. Advanced TypeScript for React Developers"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    rows={3}
                    placeholder="Briefly describe what students will learn"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-neutral-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="49.99"
                    className="w-40 px-3 py-2 border border-neutral-300 rounded-md"
                    required
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    You'll receive 90% of the revenue (Potatix fee: 10%)
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lessons Section */}
          <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-md font-medium text-neutral-900">Course Lessons</h3>
              <button 
                type="button"
                onClick={addLesson}
                className="flex items-center text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Lesson
              </button>
            </div>
            
            <div className="p-6">
              {lessons.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-neutral-300 rounded-lg">
                  <div className="mb-3 text-neutral-400">
                    <Plus className="h-10 w-10 mx-auto" />
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">
                    Your course doesn't have any lessons yet
                  </p>
                  <button
                    type="button"
                    onClick={addLesson}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-sm"
                  >
                    Add Your First Lesson
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {lessons.map((lesson, index) => (
                    <div key={lesson.id} className="border border-neutral-200 rounded-lg overflow-hidden">
                      <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-neutral-400">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="h-6 w-6 rounded-full bg-neutral-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-neutral-700">{index + 1}</span>
                          </div>
                          <h4 className="font-medium text-neutral-800">
                            {lesson.title || 'Untitled Lesson'}
                          </h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          {index > 0 && (
                            <button 
                              type="button" 
                              onClick={() => moveLesson(index, 'up')}
                              className="p-1 text-neutral-500 hover:text-neutral-700"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                          )}
                          {index < lessons.length - 1 && (
                            <button 
                              type="button" 
                              onClick={() => moveLesson(index, 'down')}
                              className="p-1 text-neutral-500 hover:text-neutral-700"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          )}
                          <button 
                            type="button" 
                            onClick={() => removeLesson(lesson.id)}
                            className="p-1 text-neutral-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                            placeholder="e.g. Introduction to TypeScript"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">
                            Description (Optional)
                          </label>
                          <textarea
                            value={lesson.description}
                            onChange={(e) => updateLesson(lesson.id, 'description', e.target.value)}
                            rows={2}
                            placeholder="What will students learn in this lesson?"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Lesson Video
                          </label>
                          
                          {!lesson.file ? (
                            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                              <input
                                type="file"
                                id={`video-upload-${lesson.id}`}
                                className="hidden"
                                accept="video/*"
                                onChange={(e) => handleFileChange(e, lesson.id)}
                              />
                              
                              <label 
                                htmlFor={`video-upload-${lesson.id}`} 
                                className="flex flex-col items-center justify-center cursor-pointer"
                              >
                                <Upload className="h-8 w-8 text-neutral-400 mb-2" />
                                <p className="text-sm font-medium text-neutral-700">
                                  Upload video for this lesson
                                </p>
                                <p className="text-xs text-neutral-500 mt-1">
                                  MP4, MOV or WebM up to 2GB
                                </p>
                              </label>
                            </div>
                          ) : (
                            <div className="border border-neutral-200 rounded-md p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium truncate max-w-xs">
                                    {lesson.fileName}
                                  </span>
                                  <span className="text-xs text-neutral-500">
                                    {lesson.fileSize}
                                  </span>
                                </div>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLessons(prevLessons => {
                                      return prevLessons.map(l => {
                                        if (l.id === lesson.id) {
                                          const { file, fileName, fileSize, ...rest } = l;
                                          return { ...rest, progress: 0 };
                                        }
                                        return l;
                                      });
                                    });
                                  }}
                                  className="text-neutral-400 hover:text-red-500"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <div className="w-full bg-neutral-100 rounded-full h-1.5">
                                <div
                                  className="bg-emerald-500 h-1.5 rounded-full"
                                  style={{ width: `${lesson.progress}%` }}
                                />
                              </div>
                              
                              <div className="mt-1 flex justify-between text-xs">
                                <span className="text-neutral-500">
                                  {lesson.progress === 100 ? 'Completed' : 'Uploading...'}
                                </span>
                                <span className="text-neutral-500">{lesson.progress}%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
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
              disabled={uploading || lessons.length === 0}
            >
              {uploading ? 'Uploading...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 