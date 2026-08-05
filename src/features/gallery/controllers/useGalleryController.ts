import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { galleryService, ImageItem } from '../services/galleryService';
import { useDebounce } from '../../../core/hooks/useDebounce';

export type GalleryFilter = 'ALL' | 'A-M' | 'N-Z';

export const useGalleryController = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GalleryFilter>('ALL');
  
  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: ['gallery', 'official-30'],
    queryFn: () => galleryService.fetchImages(),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const allImages = query.data || [];

  const filteredImages = useMemo(() => {
    let result = allImages;

    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.toLowerCase();
      result = result.filter(
        (img: ImageItem) => 
          img.author.toLowerCase().includes(lowerSearch) || 
          img.id.includes(lowerSearch)
      );
    }

    if (filter !== 'ALL') {
      result = result.filter((img: ImageItem) => {
        const firstLetter = img.author.charAt(0).toUpperCase();
        if (filter === 'A-M') {
          return firstLetter >= 'A' && firstLetter <= 'M';
        } else if (filter === 'N-Z') {
          return firstLetter >= 'N' && firstLetter <= 'Z';
        }
        return true;
      });
    }

    return result;
  }, [allImages, debouncedSearch, filter]);

  return {
    ...query,
    search,
    setSearch,
    filter,
    setFilter,
    images: filteredImages,
    isEmpty: filteredImages.length === 0 && !query.isLoading,
  };
};
