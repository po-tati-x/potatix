import { pgTable, text, integer, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./users";

/**
 * Course table - the main content unit
 */
export const course = pgTable("course", {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  price: doublePrecision('price').notNull().default(0),
  status: text('status').notNull().default('draft'), // 'draft' or 'published'
  slug: text('slug').unique(), // URL-friendly identifier for the course

  // Ownership - critical for permission checks
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  
  // Metadata fields
  imageUrl: text('imageUrl'),
    
  // Timestamps matching auth.ts style
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
});

/**
 * Module table - organizational units within a course
 */
export const courseModule = pgTable("course_module", {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  
  // Ordering within the course
  order: integer('order').notNull(),
  
  // Foreign key to parent course
  courseId: text('courseId').notNull().references(() => course.id, { onDelete: 'cascade' }),
  
  // Timestamps
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
});

/**
 * Lesson table - content units within a module
 */
export const lesson = pgTable("lesson", {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  
  // Video identifier (for future MUX integration)
  videoId: text('videoId'),
  
  // Video upload status and metadata
  uploadStatus: text('uploadStatus'),
  duration: integer('duration'),
  
  // Transcript data cached from AI processing
  transcriptData: json('transcriptData').$type<{
    chapters: Array<{
      id: string;
      title: string;
      description: string;
      timestamp: number;
    }>;
    textLength: number;
    duration: number;
    processedAt: string;
  }>(),
  
  // Ordering is critical for correct display
  order: integer('order').notNull(),
  
  // Foreign key to parent module
  moduleId: text('moduleId').notNull().references(() => courseModule.id, { onDelete: 'cascade' }),
  
  // Keep course relationship for denormalization (faster queries)
  courseId: text('courseId').notNull().references(() => course.id, { onDelete: 'cascade' }),
  
  // Timestamps matching auth.ts style
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
});

/**
 * CourseEnrollment table - tracks user enrollment in courses
 */
export const courseEnrollment = pgTable("course_enrollment", {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  courseId: text('courseId').notNull().references(() => course.id, { onDelete: 'cascade' }),
  enrolledAt: timestamp('enrolledAt', { mode: 'date' }).defaultNow().notNull(),
  status: text('status').default('active'),
});

/**
 * LessonProgress table - tracks user progress through lessons
 */
export const lessonProgress = pgTable("lesson_progress", {
  id: text('id').primaryKey(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  lessonId: text('lessonId').notNull().references(() => lesson.id, { onDelete: 'cascade' }),
  courseId: text('courseId').notNull().references(() => course.id, { onDelete: 'cascade' }),
  completed: timestamp('completed', { mode: 'date' }),
  watchTimeSeconds: integer('watchTimeSeconds').default(0),
  lastPosition: integer('lastPosition').default(0),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
});

/**
 * Define relationships for better typing and query building
 */
export const courseRelations = relations(course, ({ many, one }) => ({
  owner: one(user, {
    fields: [course.userId],
    references: [user.id],
  }),
  modules: many(courseModule),
  lessons: many(lesson),
  enrollments: many(courseEnrollment),
}));

export const courseModuleRelations = relations(courseModule, ({ one, many }) => ({
  course: one(course, {
    fields: [courseModule.courseId],
    references: [course.id],
  }),
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one }) => ({
  module: one(courseModule, {
    fields: [lesson.moduleId],
    references: [courseModule.id],
  }),
  course: one(course, {
    fields: [lesson.courseId],
    references: [course.id],
  }),
}));

export const courseEnrollmentRelations = relations(courseEnrollment, ({ one }) => ({
  course: one(course, {
    fields: [courseEnrollment.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [courseEnrollment.userId],
    references: [user.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(lesson, {
    fields: [lessonProgress.lessonId],
    references: [lesson.id],
  }),
  course: one(course, {
    fields: [lessonProgress.courseId],
    references: [course.id],
  }),
  user: one(user, {
    fields: [lessonProgress.userId],
    references: [user.id],
  })
}));
