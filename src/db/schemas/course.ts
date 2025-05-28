import { pgTable, text, integer, timestamp, doublePrecision, boolean, json } from "drizzle-orm/pg-core";
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
 * Lesson table - content units within a course
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
  
  // Ordering is critical for correct display
  order: integer('order').notNull(),
  
  // Foreign key to parent course
  courseId: text('courseId').notNull().references(() => course.id, { onDelete: 'cascade' }),
  
  // Timestamps matching auth.ts style
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
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one, many }) => ({
  course: one(course, {
    fields: [lesson.courseId],
    references: [course.id],
  }),
}));
