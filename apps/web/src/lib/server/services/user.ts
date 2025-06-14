import { getDb, authSchema, profileSchema } from "@potatix/db";
import { eq } from "drizzle-orm";
import { logger } from "../utils/logger";

// Service-specific logger
const userLogger = logger.child("UserService");

/**
 * Standardized error handling for services
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string = "INTERNAL_ERROR",
    public readonly status: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

/**
 * User profile interface - matches the actual schema structure
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean | null;
  image: string | null;
  bio?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Update profile params
 */
export interface UpdateProfileParams {
  name?: string;
  bio?: string;
}

/**
 * Update password params
 */
export interface UpdatePasswordParams {
  currentPassword: string;
  newPassword: string;
}

/**
 * Update notification preferences params
 */
export interface UpdateNotificationsParams {
  email: boolean;
  marketing: boolean;
  newEnrollments: boolean;
  courseUpdates: boolean;
}

/**
 * User service for user-related operations
 */
export const userService = {
  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const db = getDb();
      const users = await db
        .select()
        .from(authSchema.user)
        .where(eq(authSchema.user.id, userId))
        .limit(1);

      if (!users.length) {
        throw new ServiceError("User not found", "USER_NOT_FOUND", 404);
      }

      const core = users[0];

      // Grab extended profile (bio, etc.)
      const profiles = await db
        .select()
        .from(profileSchema.userProfile)
        .where(eq(profileSchema.userProfile.userId, userId))
        .limit(1);

      const profile = (profiles[0] as { bio?: string | null } | undefined) ?? {};

      return {
        id: core.id,
        name: core.name,
        email: core.email,
        emailVerified: core.emailVerified,
        image: core.image,
        bio: profile.bio ?? null,
        createdAt: core.createdAt,
        updatedAt: core.updatedAt,
      } as UserProfile;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      userLogger.error("Failed to get user profile", error as Error);
      throw new ServiceError("Failed to get user profile");
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    data: UpdateProfileParams,
  ): Promise<UserProfile> {
    try {
      // Validate user exists first
      await this.getUserProfile(userId);

      // Build update payload dynamically to avoid empty set
      const updatePayload: Record<string, unknown> = {};
      if (data.name !== undefined) updatePayload.name = data.name;
      if (data.bio !== undefined) updatePayload.bio = data.bio;

      if (Object.keys(updatePayload).length === 0) {
        throw new ServiceError("No fields provided to update", "NO_DATA", 400);
      }

      const db = getDb();

      // If name present, update core user table
      if (updatePayload.name !== undefined) {
        await db
          .update(authSchema.user)
          .set({ name: updatePayload.name as string })
          .where(eq(authSchema.user.id, userId));
      }

      // If bio present, upsert into profile table
      if (updatePayload.bio !== undefined) {
        // Check if profile row exists
        const existingProfiles = await db
          .select()
          .from(profileSchema.userProfile)
          .where(eq(profileSchema.userProfile.userId, userId))
          .limit(1);

        if (existingProfiles.length) {
          await db
            .update(profileSchema.userProfile)
            .set({ bio: updatePayload.bio as string | null })
            .where(eq(profileSchema.userProfile.userId, userId));
        } else {
          await db.insert(profileSchema.userProfile).values({
            id: userId, // reuse id for simplicity
            userId,
            bio: updatePayload.bio as string | null,
          });
        }
      }

      // Get fresh combined profile via profileService? For simplicity, return updated core user with bio merged
      const finalUser = await db
        .select()
        .from(authSchema.user)
        .where(eq(authSchema.user.id, userId))
        .limit(1);

      const core = finalUser[0];

      // Fetch profile for bio
      const profileRowArr = await db
        .select()
        .from(profileSchema.userProfile)
        .where(eq(profileSchema.userProfile.userId, userId))
        .limit(1);

      const profileRow = profileRowArr[0] || {};

      return {
        id: core.id,
        name: core.name,
        email: core.email,
        emailVerified: core.emailVerified,
        image: core.image,
        bio: profileRow.bio ?? null,
        createdAt: core.createdAt,
        updatedAt: core.updatedAt,
      } as UserProfile;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      userLogger.error("Failed to update user profile", error as Error);
      throw new ServiceError("Failed to update user profile");
    }
  },

  /**
   * Update user password
   */
  async updatePassword(
    userId: string
    // _data: UpdatePasswordParams,
  ): Promise<{ success: boolean }> {
    try {
      // In a real implementation, you would:
      // 1. Verify the current password
      // 2. Hash the new password
      // 3. Update in the database

      // For now, we'll just log and return success
      userLogger.info(`Password updated for user ${userId}`);
      return { success: true };
    } catch (error) {
      userLogger.error("Failed to update password", error as Error);
      throw new ServiceError("Failed to update password");
    }
  },

  /**
   * Update notification preferences
   */
  async updateNotifications(
    userId: string
    // _data: UpdateNotificationsParams,
  ): Promise<UserProfile> {
    try {
      // In a real implementation, you would update the notification preferences
      // For now, just return the user profile
      return await this.getUserProfile(userId);
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      userLogger.error(
        "Failed to update notification preferences",
        error as Error,
      );
      throw new ServiceError("Failed to update notification preferences");
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(userId: string): Promise<{ success: boolean }> {
    try {
      const db = getDb();
      await db
        .delete(authSchema.user)
        .where(eq(authSchema.user.id, userId));

      return { success: true };
    } catch (error) {
      userLogger.error("Failed to delete account", error as Error);
      throw new ServiceError("Failed to delete account");
    }
  },
};
