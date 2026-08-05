import { useState, useMemo } from 'react';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useDebounce } from '../../../core/hooks/useDebounce';
import { ImageItem } from '../../gallery/services/galleryService';

export const useFavoritesController = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const favorites = useFavoritesStore((state) => state.favorites);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isHydrating = useFavoritesStore((state) => state.isHydrating);

  const filteredFavorites = useMemo(() => {
    let result = favorites;
    
    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (img) => 
          img.author.toLowerCase().includes(lowerSearch) || 
          img.id.includes(lowerSearch)
      );
    }
    
    // Sort so newest favorites show up first (assuming they are appended to the end of the array)
    return [...result].reverse();
  }, [favorites, debouncedSearch]);

  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  return {
    search,
    setSearch,
    filteredFavorites,
    hasFavorites: favorites.length > 0,
    isHydrating,
    selectedImage,
    setSelectedImage,
    toggleFavorite,
  };
};
