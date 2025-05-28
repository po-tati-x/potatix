import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Course, Lesson as APILesson, coursesApi } from '../utils/api-client';
import { Lesson as CourseStoreLesson } from './courseStore';

type WithLessons = {
  lessons?: CourseStoreLesson[];
};

interface CourseEditState {
  // Data 
  courseId: string | null;
  formData: Partial<Course> & WithLessons;
  
  // UI states
  loading: boolean;
  saving: boolean;
  error: string | null;
  
  // Image upload states
  courseImage: File | null;
  imagePreview: string | null;
  imageUploading: boolean;
  
  // Actions - data fetching  
  fetchCourse: (id: string) => Promise<void>;
  
  // Actions - form handling
  setField: <K extends keyof Course>(field: K, value: Course[K]) => void;
  
  // Actions - image handling
  handleImageUpload: (file: File) => Promise<void>;
  removeImage: () => void;
  
  // Actions - lesson management
  addLesson: () => void;
  removeLesson: (id: string) => void;
  updateLesson: (id: string, field: keyof CourseStoreLesson, value: string) => void;
  reorderLessons: (updatedLessons: CourseStoreLesson[]) => void;
  handleLessonFileUpload: (file: File, lessonId: string) => Promise<void>;
  removeLessonFile: (lessonId: string) => void;
  
  // Actions - save
  saveCourse: () => Promise<boolean>;
  
  // Reset
  reset: () => void;
}

// Convert API lesson to courseStore lesson format
const convertToStoreLesson = (apiLesson: APILesson): CourseStoreLesson => ({
  id: apiLesson.id,
  title: apiLesson.title,
  description: apiLesson.description || '',
  videoId: apiLesson.videoId || null,
  progress: 0,
  fileName: '',
  fileSize: '',
});

export const useCourseEditStore = create<CourseEditState>()(
  devtools(
    (set, get) => ({
      // Initial state
      courseId: null,
      formData: {
        title: '',
        description: '',
        price: 0,
        status: 'draft',
        imageUrl: '',
        lessons: [],
      },
      loading: true,
      saving: false,
      error: null,
      
      // Image states
      courseImage: null,
      imagePreview: null,
      imageUploading: false,
      
      // Action - Fetch course for editing
      fetchCourse: async (id: string) => {
        if (!id) {
          set({ error: 'Invalid course ID', loading: false });
          return;
        }
        
        set({ loading: true, error: null, courseId: id });
        
        try {
          const data = await coursesApi.getById(id);
          
          // Transform API lessons to CourseStore lesson format
          const transformedLessons = data.lessons?.map(convertToStoreLesson) || [];
          
          // Use type assertion to bypass type checking
          set({
            formData: {
              title: data.title,
              description: data.description || '',
              price: data.price,
              status: data.status,
              imageUrl: data.imageUrl || '',
              lessons: transformedLessons,
            } as any,
            loading: false,
            // Set image preview if there's an existing image
            imagePreview: data.imageUrl || null
          });
        } catch (err) {
          console.error('Failed to fetch course:', err);
          set({ 
            error: err instanceof Error ? err.message : 'Failed to load course',
            loading: false
          });
        }
      },
      
      // Action - Update a form field
      setField: (field, value) => set(state => ({
        formData: {
          ...state.formData,
          [field]: value
        }
      })),
      
      // Action - Handle image upload
      handleImageUpload: async (file: File) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file (JPEG, PNG, WebP)');
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }
        
        // Set uploading state and file
        set({ imageUploading: true, courseImage: file });
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          set({ imagePreview: e.target?.result as string });
        };
        reader.readAsDataURL(file);
        
        try {
          // Upload to R2
          const result = await coursesApi.uploadImage(file);
          
          // Update form data with the new image URL
          set(state => ({
            formData: {
              ...state.formData,
              imageUrl: result.fileUrl
            },
            imageUploading: false
          }));
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Failed to upload image. Please try again.');
          set({ 
            courseImage: null, 
            imagePreview: null,
            imageUploading: false
          });
        }
      },
      
      // Action - Remove image
      removeImage: () => set(state => ({
        courseImage: null,
        imagePreview: null,
        formData: {
          ...state.formData,
          imageUrl: ''
        }
      })),
      
      // Action - Add a new lesson
      addLesson: () => set((state: any) => {
        const newLesson: CourseStoreLesson = {
          id: `lesson-${nanoid()}`,
          title: '',
          description: '',
          videoId: null,
          progress: 0,
          fileName: '',
          fileSize: '',
        };

        return {
          formData: {
            ...state.formData,
            lessons: [...(state.formData.lessons || []), newLesson]
          }
        };
      }),
      
      // Action - Remove a lesson
      removeLesson: (id: string) => set((state: any) => {
        return {
          formData: {
            ...state.formData,
            lessons: state.formData.lessons?.filter((lesson: any) => lesson.id !== id)
          }
        };
      }),
      
      // Action - Update a lesson field
      updateLesson: (id: string, field: keyof CourseStoreLesson, value: string) => set((state: any) => {
        return {
          formData: {
            ...state.formData,
            lessons: state.formData.lessons?.map((lesson: any) => 
              lesson.id === id ? { ...lesson, [field]: value } : lesson
            )
          }
        };
      }),
      
      // Action - Reorder lessons
      reorderLessons: (updatedLessons: CourseStoreLesson[]) => set((state: any) => {
        return {
          formData: {
            ...state.formData,
            lessons: updatedLessons
          }
        };
      }),
      
      // Action - Handle lesson file upload
      handleLessonFileUpload: async (file: File, lessonId: string) => {
        // TODO: Implement video file upload logic
        // For now just update the lesson with file info
        set((state: any) => {
          return {
            formData: {
              ...state.formData,
              lessons: state.formData.lessons?.map((lesson: any) => 
                lesson.id === lessonId ? { 
                  ...lesson, 
                  file,
                  fileName: file.name,
                  fileSize: `${Math.round(file.size / 1024)}KB`, 
                  progress: 100
                } : lesson
              )
            }
          };
        });
      },
      
      // Action - Remove a lesson file
      removeLessonFile: (lessonId: string) => set((state: any) => {
        return {
          formData: {
            ...state.formData,
            lessons: state.formData.lessons?.map((lesson: any) => 
              lesson.id === lessonId ? { 
                ...lesson, 
                file: undefined,
                fileName: '',
                fileSize: '',
                progress: 0 
              } : lesson
            )
          }
        };
      }),
      
      // Action - Save the course
      saveCourse: async () => {
        const { courseId, formData, imageUploading } = get();
        
        if (!courseId) return false;
        
        // Check if image upload is still in progress
        if (imageUploading) {
          alert('Image upload is still in progress. Please wait.');
          return false;
        }
        
        set({ saving: true, error: null });
        
        try {
          // Convert CourseStoreLesson back to APILesson format for saving
          const apiFormData = {
            ...formData,
            lessons: formData.lessons?.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              videoId: lesson.videoId,
              // Any other API fields would go here
            }))
          };
          
          await coursesApi.update(courseId, apiFormData as any);
          set({ saving: false });
          return true;
        } catch (err) {
          console.error('Failed to update course:', err);
          set({
            error: err instanceof Error ? err.message : 'Failed to update course',
            saving: false
          });
          return false;
        }
      },
      
      // Reset store
      reset: () => set({
        courseId: null,
        formData: {
          title: '',
          description: '',
          price: 0,
          status: 'draft',
          imageUrl: '',
          lessons: [],
        },
        loading: true,
        saving: false,
        error: null,
        courseImage: null,
        imagePreview: null,
        imageUploading: false
      })
    }),
    { name: 'course-edit-store' }
  )
); 