/**
 * Custom user profile schema that extends the Better Auth user table
 * Add any custom user fields here, NOT in better-auth.ts
 */

import { pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './better-auth';
import { timestamps } from '../utils/shared';

/**
 * UserProfile table - extends the core user table with app-specific fields
 * Use this table for your custom user fields instead of modifying better-auth.ts
 */
export const userProfile = pgTable('user_profile', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' })
    .unique(),
  bio: text('bio'),
  // Add other custom user fields here
  ...timestamps,
});

// Establish relations
export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}));
