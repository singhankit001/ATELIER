import { create } from 'zustand';
import { favoritesRepository } from '../services/favoritesRepository';
import { ImageItem } from '../../gallery/services/galleryService';
import { toggleFavoriteInList, isFavoriteInList } from './favoritesLogic';

interface FavoritesState {
  favorites: ImageItem[];
  isHydrating: boolean;
  toggleFavorite: (image: ImageItem) => void;
  isFavorite: (id: string) => boolean;
  hydrate: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  isHydrating: true,

  toggleFavorite: (image) => {
    const currentFavorites = get().favorites;
    const newFavorites = toggleFavoriteInList(currentFavorites, image);

    // Optimistic UI Update
    set({ favorites: newFavorites });

    // Background persistence with rollback on failure
    favoritesRepository.saveFavorites(newFavorites).catch((error) => {
      console.error('Failed to persist favorite toggle, rolling back UI state.', error);
      set({ favorites: currentFavorites });
    });
  },

  isFavorite: (id) => isFavoriteInList(get().favorites, id),

  hydrate: async () => {
    try {
      const stored = await favoritesRepository.loadFavorites();
      set({ favorites: stored, isHydrating: false });
    } catch {
      set({ isHydrating: false });
    }
  },
}));
