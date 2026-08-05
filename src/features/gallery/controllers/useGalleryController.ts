import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { galleryService, ImageItem } from '../services/galleryService';
import { useDebounce } from '../../../core/hooks/useDebounce';

export type GalleryFilter = 'ALL' | 'A-M' | 'N-Z';

export const useGalleryController = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GalleryFilter>('ALL');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: ['gallery', 'official-50'],
    queryFn: () => galleryService.fetchImages(1, 50),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const allImages = query.data || [];

  // Batch display pagination: load 15 initially, increment by 15 on scroll
  const displayedImages = useMemo(() => {
    return allImages.slice(0, page * 15);
  }, [allImages, page]);

  const loadMore = useCallback(() => {
    if (displayedImages.length < allImages.length) {
      setPage((prev) => prev + 1);
    }
  }, [displayedImages.length, allImages.length]);

  const handleRefresh = useCallback(async () => {
    setPage(1);
    await query.refetch();
  }, [query]);

  const filteredImages = useMemo(() => {
    let result = displayedImages;

    if (debouncedSearch) {
      const lowerSearch = debouncedSearch.trim().toLowerCase();
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
  }, [displayedImages, debouncedSearch, filter]);

  return {
    ...query,
    search,
    setSearch,
    filter,
    setFilter,
    images: filteredImages,
    isEmpty: filteredImages.length === 0 && !query.isLoading,
    handleRefresh,
    loadMore,
  };
};
