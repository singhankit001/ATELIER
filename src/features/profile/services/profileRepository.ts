import { storage } from '../../../core/storage/storage';
import { User } from '../../auth/store/useAuthStore';

const PROFILE_KEY = 'AUTH_USER'; // Intentionally sharing the key with auth for synchronization

export const profileRepository = {
  /**
   * Updates the user profile and persists it.
   */
  async updateProfile(updatedUser: User): Promise<void> {
    try {
      await storage.setItem(PROFILE_KEY, updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Could not persist profile changes.');
    }
  }
};
