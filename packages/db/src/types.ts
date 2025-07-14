import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Auth tables
import { user, session, account, verification } from './schemas/better-auth';
// Course tables
import {
  course,
  courseModule,
  lesson,
  courseEnrollment,
  lessonProgress,
} from './schemas/course';

// ---------------------------------------------------------------------------
// Select (read) models
// ---------------------------------------------------------------------------
export type User = InferSelectModel<typeof user>;
export type Session = InferSelectModel<typeof session>;
export type Account = InferSelectModel<typeof account>;
export type Verification = InferSelectModel<typeof verification>;

export type Course = InferSelectModel<typeof course>;
export type CourseModule = InferSelectModel<typeof courseModule>;
export type Lesson = InferSelectModel<typeof lesson>;
export type CourseEnrollment = InferSelectModel<typeof courseEnrollment>;
export type LessonProgress = InferSelectModel<typeof lessonProgress>;

// ---------------------------------------------------------------------------
// Insert (write) models
// ---------------------------------------------------------------------------
export type NewUser = InferInsertModel<typeof user>;
export type NewSession = InferInsertModel<typeof session>;
export type NewAccount = InferInsertModel<typeof account>;
export type NewVerification = InferInsertModel<typeof verification>;

export type NewCourse = InferInsertModel<typeof course>;
export type NewCourseModule = InferInsertModel<typeof courseModule>;
export type NewLesson = InferInsertModel<typeof lesson>;
export type NewCourseEnrollment = InferInsertModel<typeof courseEnrollment>;
export type NewLessonProgress = InferInsertModel<typeof lessonProgress>;

// ---------------------------------------------------------------------------
// Grouped exports for convenience
// ---------------------------------------------------------------------------
export const dbModels = {
  user,
  session,
  account,
  verification,
  course,
  courseModule,
  lesson,
  courseEnrollment,
  lessonProgress,
}; 