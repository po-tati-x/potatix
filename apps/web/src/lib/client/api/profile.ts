import axios from 'axios';
import type { ApiResponse } from '@/lib/shared/types/api';
import type { UserProfile } from '@/lib/shared/types/profile';

export const profileApi = {
  async getMe(): Promise<UserProfile> {
    const { data } = await axios.get<ApiResponse<UserProfile>>('/api/user/profile');
    return data.data;
  },
  async updateMe(payload: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await axios.patch<ApiResponse<UserProfile>>('/api/user/profile', payload);
    return data.data;
  },
}; 