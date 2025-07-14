// Base API types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Course related types
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  playbackId?: string;
  /** Total length of the video in seconds */
  duration?: number;
  /** CDN URL or data URI representing a frame of the lesson video */
  thumbnailUrl?: string;
  uploadStatus?: string;
  order: number;
  /** Visibility of lesson: 'public' preview or 'enrolled' gated */
  visibility?: 'public' | 'enrolled';
  /** Intrinsic video width reported by Mux asset */
  width?: number;
  /** Intrinsic video height reported by Mux asset */
  height?: number;
  /** Convenience ratio (w/h) stored for quick initial layout */
  aspectRatio?: number;
  courseId: string;
  moduleId: string;
  createdAt: string;
  updatedAt: string;
  // Transcript data from AI processing
  transcriptData?: {
    chapters: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: number;
    }>;
    textLength: number;
    duration: number;
    processedAt: string;
  };

  /** Cached AI-generated chat prompts */
  aiPrompts?: string[];
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  lessons?: Lesson[];
}

// Add legacy type alias for backward compatibility 
export type Module = CourseModule;

export interface Course {
  id: string;
  title: string;
  description?: string;
  price: number;
  status: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  userId: string;
  lessonCount?: number;
  studentCount?: number; // Number of active students enrolled
  createdAt: string;
  updatedAt?: string;
  lessons?: Lesson[];
  modules?: CourseModule[];
  slug?: string;

  /** Marketing sections */
  perks?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
}

export interface CreateCourseData {
  title: string;
  description?: string;
  price: number;
  status?: 'draft' | 'published' | 'archived';
  imageUrl?: string;
  slug?: string;
  lessons?: {
    title: string;
    description?: string;
    playbackId?: string | undefined;
  }[];

  /** Marketing sections */
  perks?: string[];
  learningOutcomes?: string[];
  prerequisites?: string[];
}

export interface CreateModuleData {
  title: string;
  description?: string;
  order: number;
  courseId: string;
}

export interface CreateLessonData {
  title: string;
  description?: string;
  playbackId?: string;
  order: number;
  moduleId: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// Instructor models (for Course Spotlight & editing forms)
// ────────────────────────────────────────────────────────────────────────────────

export interface Instructor {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  avatarUrl?: string | undefined;
  credentials?: string[];
  /** If the instructor is a registered user */
  userId?: string | undefined;
  /** Active students across this course (when provided) */
  totalStudents?: number;
}

export interface CourseInstructor {
  id: string;
  courseId: string;
  instructorId: string;
  role: 'primary' | 'co' | 'guest';
  sortOrder: number;
  titleOverride?: string;
  instructor: Instructor;
} 