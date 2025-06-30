import {
  pgTable,
  text,
  json,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './better-auth';
import { course } from './course';
import { timestamps } from '../utils/shared';

/**
 * Instructor table – standalone profile for anyone who can appear in a course.
 * This decouples course authorship from auth users, allowing guest experts.
 */
export const instructor = pgTable('instructor', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  /** Optional – display title like "Senior Engineer" */
  title: text('title'),
  /** Short biography */
  bio: text('bio'),
  /** Avatar image CDN URL */
  avatarUrl: text('avatar_url'),
  /** String array of credentials / badges */
  credentials: json('credentials').$type<string[]>(),
  /** Optional link to a real user that "owns" this instructor profile */
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
  ...timestamps,
});

/**
 * Many-to-many pivot linking instructors to courses.
 * Use explicit surrogate key for easier mutations & ordering.
 */
export const courseInstructor = pgTable('course_instructor', {
  id: text('id').primaryKey(),
  courseId: text('course_id')
    .notNull()
    .references(() => course.id, { onDelete: 'cascade' }),
  instructorId: text('instructor_id')
    .notNull()
    .references(() => instructor.id, { onDelete: 'cascade' }),
  /** Role of the instructor within this course */
  role: text('role').default('co'), // 'primary' | 'co' | 'guest'
  /** Display order for client */
  sortOrder: integer('sort_order').default(0),
  /** Optional per-course title override */
  titleOverride: text('title_override'),
  ...timestamps,
}, (table) => ({
  uniqueCourseInstructor: uniqueIndex('course_instructor_unique_idx').on(
    table.courseId,
    table.instructorId,
  ),
  courseIdIdx: index('course_instructor_course_idx').on(table.courseId),
  instructorIdIdx: index('course_instructor_instructor_idx').on(table.instructorId),
}));

// ────────────────────────────────────────────────────────────────────────────────
// Relations
// ────────────────────────────────────────────────────────────────────────────────
export const instructorRelations = relations(instructor, ({ many, one }) => ({
  user: one(user, {
    fields: [instructor.userId],
    references: [user.id],
  }),
  courses: many(courseInstructor),
}));

export const courseInstructorRelations = relations(
  courseInstructor,
  ({ one }) => ({
    course: one(course, {
      fields: [courseInstructor.courseId],
      references: [course.id],
    }),
    instructor: one(instructor, {
      fields: [courseInstructor.instructorId],
      references: [instructor.id],
    }),
  }),
);

// ---------------------------------------------------------------------------
// Grouped schema export for external usage
// ---------------------------------------------------------------------------

export const instructorSchema = {
  instructor,
  courseInstructor,
}; 