import {
  pgTable,
  text,
  integer,
  timestamp,
  doublePrecision,
  json,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./better-auth";
import { timestamps } from "../utils/shared";

/**
 * Enum values as objects for type safety and consistent reference
 */
export const COURSE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export const ENROLLMENT_STATUS = {
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const UPLOAD_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];
export type EnrollmentStatus =
  (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];
export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];

/**
 * Course table - the main content unit
 */
export const course = pgTable("course", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull().default(0),
  status: text("status").notNull().default("draft"), // 'draft' or 'published'
  slug: text("slug").unique(), // URL-friendly identifier for the course

  // Ownership - critical for permission checks
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Metadata fields
  imageUrl: text("image_url"),

  // Timestamps matching auth.ts style
  ...timestamps,
});

/**
 * Module table - organizational units within a course
 */
export const courseModule = pgTable("course_module", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),

  // Ordering within the course
  order: integer("order").notNull(),

  // Foreign key to parent course
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),

  // Timestamps
  ...timestamps,
});

/**
 * Lesson table - content units within a module
 */
export const lesson = pgTable("lesson", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),

  // Video identifier (for future MUX integration)
  videoId: text("video_id"),

  // Video upload status and metadata
  uploadStatus: text("upload_status"),
  duration: integer("duration"),

  // Transcript data cached from AI processing
  transcriptData: json("transcript_data").$type<{
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
  order: integer("order").notNull(),

  // Foreign key to parent module
  moduleId: text("module_id")
    .notNull()
    .references(() => courseModule.id, { onDelete: "cascade" }),

  // Keep course relationship for denormalization (faster queries)
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),

  // Timestamps matching auth.ts style
  ...timestamps,
});

/**
 * CourseEnrollment table - tracks user enrollment in courses
 */
export const courseEnrollment = pgTable("course_enrollment", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  enrolledAt: timestamp("enrolled_at", { mode: "date" }).defaultNow().notNull(),
  status: text("status").default("active"),
  ...timestamps,
});

/**
 * LessonProgress table - tracks user progress through lessons
 */
export const lessonProgress = pgTable("lesson_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id")
    .notNull()
    .references(() => lesson.id, { onDelete: "cascade" }),
  courseId: text("course_id")
    .notNull()
    .references(() => course.id, { onDelete: "cascade" }),
  completed: timestamp("completed", { mode: "date" }),
  watchTimeSeconds: integer("watch_time_seconds").default(0),
  lastPosition: integer("last_position").default(0),
  ...timestamps,
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

export const courseModuleRelations = relations(
  courseModule,
  ({ one, many }) => ({
    course: one(course, {
      fields: [courseModule.courseId],
      references: [course.id],
    }),
    lessons: many(lesson),
  }),
);

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

export const courseEnrollmentRelations = relations(
  courseEnrollment,
  ({ one }) => ({
    course: one(course, {
      fields: [courseEnrollment.courseId],
      references: [course.id],
    }),
    user: one(user, {
      fields: [courseEnrollment.userId],
      references: [user.id],
    }),
  }),
);

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
  }),
}));
