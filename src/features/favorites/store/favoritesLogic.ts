import type { ImageItem } from '../../gallery/services/galleryService';

/**
 * Pure favorites-list logic — no Zustand/AsyncStorage — testable directly.
 * Full ImageItem objects are stored (not just ids) deliberately: with
 * infinite pagination, an id-only favorites list could reference an
 * image whose page was never fetched (or was evicted), leaving nothing
 * to render. Storing the object keeps a favorite renderable and correct
 * independent of whatever the gallery has currently loaded.
 */
export const toggleFavoriteInList = (favorites: ImageItem[], image: ImageItem): ImageItem[] => {
  const exists = favorites.some((f) => f.id === image.id);
  return exists
    ? favorites.filter((f) => f.id !== image.id)
    : [...favorites, image];
};

export const isFavoriteInList = (favorites: ImageItem[], id: string): boolean =>
  favorites.some((f) => f.id === id);
