import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { coursesApi } from '../utils/api-client';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoId?: string | null;
  file?: File; 
  fileName?: string;
  fileSize?: string;
  progress: number;
}

interface CourseState {
  // Basic course data
  title: string;
  description: string;
  price: string;
  imageUrl: string | null;
  lessons: Lesson[];
  
  // UI states
  uploading: boolean;
  submitting: boolean;
  
  // Actions - course data
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  setPrice: (price: string) => void;
  setImageUrl: (url: string | null) => void;
  
  // Actions - lesson management
  addLesson: () => void;
  removeLesson: (id: string) => void;
  updateLesson: (id: string, field: keyof Lesson, value: string) => void;
  moveLesson: (index: number, direction: 'up' | 'down') => void;
  reorderLessons: (updatedLessons: Lesson[]) => void;
  
  // Actions - file handling
  handleFileUpload: (file: File, lessonId: string) => Promise<void>;
  removeFile: (lessonId: string) => void;
  
  // Actions - form submission
  submitCourse: () => Promise<string | null>;
  reset: () => void;
}

export const useCourseStore = create<CourseState>()(
  devtools(
    (set, get) => ({
      // Initial state
      title: '',
      description: '',
      price: '',
      imageUrl: null,
      lessons: [],
      uploading: false,
      submitting: false,
      
      // Course data actions
      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),
      setPrice: (price) => set({ price }),
      setImageUrl: (imageUrl) => set({ imageUrl }),
      
      // Lesson management
      addLesson: () => set((state) => ({
        lessons: [
          ...state.lessons,
          {
            id: `lesson-${nanoid()}`,
            title: '',
            description: '',
            progress: 0
          }
        ]
      })),
      
      removeLesson: (id) => set((state) => ({
        lessons: state.lessons.filter(lesson => lesson.id !== id)
      })),
      
      updateLesson: (id, field, value) => set((state) => ({
        lessons: state.lessons.map(lesson => 
          lesson.id === id ? { ...lesson, [field]: value } : lesson
        )
      })),
      
      moveLesson: (index, direction) => set((state) => {
        if (
          (direction === 'up' && index === 0) ||
          (direction === 'down' && index === state.lessons.length - 1)
        ) {
          return state;
        }
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        const newLessons = [...state.lessons];
        const [movedLesson] = newLessons.splice(index, 1);
        newLessons.splice(newIndex, 0, movedLesson);
        
        return { lessons: newLessons };
      }),
      
      reorderLessons: (updatedLessons) => set({ lessons: updatedLessons }),
      
      // File handling
      handleFileUpload: async (file, lessonId) => {
        // Update file metadata first
        set((state) => ({
          uploading: true,
          lessons: state.lessons.map(lesson => {
            if (lesson.id === lessonId) {
              const fileSize = (file.size / (1024 * 1024)).toFixed(2) + 'MB';
              return {
                ...lesson,
                file,
                fileName: file.name,
                fileSize,
                progress: 0
              };
            }
            return lesson;
          })
        }));
        
        // Simulate upload progress
        // In production, this should use real video upload with progress tracking
        const simulateProgress = () => {
          return new Promise<void>((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              
              set((state) => ({
                lessons: state.lessons.map(lesson => {
                  if (lesson.id === lessonId) {
                    return {
                      ...lesson,
                      progress: Math.min(progress, 100)
                    };
                  }
                  return lesson;
                })
              }));
              
              if (progress >= 100) {
                clearInterval(interval);
                
                // Set videoId when upload "completes"
                set((state) => ({
                  lessons: state.lessons.map(lesson => {
                    if (lesson.id === lessonId) {
                      return {
                        ...lesson,
                        videoId: `vid-${nanoid()}` // In production, this would be from your video API
                      };
                    }
                    return lesson;
                  })
                }));
                
                // Check if all uploads complete
                const state = get();
                const allComplete = state.lessons.every(lesson => !lesson.file || lesson.progress === 100);
                if (allComplete) {
                  set({ uploading: false });
                }
                
                resolve();
              }
            }, 300);
          });
        };
        
        try {
          await simulateProgress();
        } catch (error) {
          console.error('Upload error:', error);
          // Reset the progress on error
          set((state) => ({
            lessons: state.lessons.map(lesson => {
              if (lesson.id === lessonId) {
                return {
                  ...lesson,
                  progress: 0
                };
              }
              return lesson;
            })
          }));
        }
      },
      
      removeFile: (lessonId) => set((state) => ({
        lessons: state.lessons.map(lesson => {
          if (lesson.id === lessonId) {
            // Remove file properties but keep other lesson data
            const { id, title, description } = lesson;
            return { 
              id, 
              title, 
              description, 
              progress: 0 
            };
          }
          return lesson;
        })
      })),
      
      // Form submission
      submitCourse: async () => {
        const state = get();
        
        // Basic validation
        if (state.lessons.length === 0) {
          alert('Please add at least one lesson to your course');
          return null;
        }
        
        // Check uploads
        const uploadsInProgress = state.lessons.some(lesson => 
          lesson.file && (lesson.progress < 100 || !lesson.videoId)
        );
        
        if (uploadsInProgress || state.uploading) {
          alert('Please wait for all uploads to complete');
          return null;
        }
        
        try {
          set({ submitting: true });
          
          // Format data for API
          const courseData = {
            title: state.title,
            description: state.description,
            price: parseFloat(state.price) || 0,
            imageUrl: state.imageUrl || undefined,
            lessons: state.lessons.map(lesson => ({
              title: lesson.title,
              description: lesson.description,
              videoId: lesson.videoId || null
            }))
          };
          
          // Submit to API
          const result = await coursesApi.create(courseData);
          set({ submitting: false });
          return result.id;
        } catch (error) {
          console.error('Failed to create course:', error);
          set({ submitting: false });
          return null;
        }
      },
      
      // Reset store to initial state
      reset: () => set({
        title: '',
        description: '',
        price: '',
        imageUrl: null,
        lessons: [],
        uploading: false,
        submitting: false
      })
    }),
    { name: 'course-store' }
  )
); 