import { getDb, authSchema, profileSchema } from "@potatix/db";
import { eq } from "drizzle-orm";
import { UserProfile } from '@/lib/shared/types/profile';

const database = getDb();

/**
 * Service for user profile operations
 */
export const profileService = {
  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    // Get core user data
    const users = await database
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, userId))
      .limit(1);

    if (!users.length) {
      return null;
    }

    const user = users[0]!;
    
    // Try to get profile data from userProfile table if it exists
    let profileData = null;
    try {
      const profiles = await database
        .select()
        .from(profileSchema.userProfile)
        .where(eq(profileSchema.userProfile.userId, userId))
        .limit(1);
      
      if (profiles.length) {
        profileData = profiles[0];
      }
    } catch (error) {
      console.error("Error fetching user profile data:", error);
    }
    
    // Combine core user data with profile data
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: profileData?.bio ?? undefined,
      image: user.image ?? undefined,
      createdAt: user.createdAt.toISOString(), // Convert Date to string
    };
  }
}; 