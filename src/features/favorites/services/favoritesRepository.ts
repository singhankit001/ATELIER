import { storage } from '../../../core/storage/storage';
import { ImageItem } from '../../gallery/services/galleryService';

const FAVORITES_KEY = 'FAVORITES';

export const favoritesRepository = {
  loadFavorites: async (): Promise<ImageItem[]> => {
    try {
      const data = await storage.getItem<ImageItem[]>(FAVORITES_KEY);
      return data || [];
    } catch (error) {
      console.error('Failed to load favorites from repository:', error);
      return [];
    }
  },

  saveFavorites: async (favorites: ImageItem[]): Promise<void> => {
    try {
      await storage.setItem(FAVORITES_KEY, favorites);
    } catch (error) {
      console.error('Failed to save favorites to repository:', error);
      throw error;
    }
  }
};
