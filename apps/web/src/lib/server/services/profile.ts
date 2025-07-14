import { getDatabase, authSchema, profileSchema } from "@potatix/db";
import { eq } from "drizzle-orm";
import { UserProfile } from '@/lib/shared/types/profile';

const database = getDatabase();

/**
 * Service for user profile operations
 */
export const profileService = {
  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    // Get core user data
    const users = await database
      .select()
      .from(authSchema.user)
      .where(eq(authSchema.user.id, userId))
      .limit(1);

    if (users.length === 0) {
      return undefined;
    }

    const user = users[0]!;
    
    // Try to get profile data from userProfile table if it exists
    let profileData: { bio?: string | null } | undefined;
    try {
      const profiles = await database
        .select()
        .from(profileSchema.userProfile)
        .where(eq(profileSchema.userProfile.userId, userId))
        .limit(1);
      
      if (profiles.length > 0) {
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