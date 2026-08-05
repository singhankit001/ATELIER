import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { galleryService, ImageItem } from '../services/galleryService';
import { useDebounce } from '../../../core/hooks/useDebounce';

export type GalleryFilter = 'ALL' | 'A-M' | 'N-Z';

export const useGalleryController = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GalleryFilter>('ALL');
  const [page, setPage] = useState(1);
  const [accumulatedImages, setAccumulatedImages] = useState<ImageItem[]>([]);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const query = useQuery({
    queryKey: ['gallery', 'official-50', page],
    queryFn: async () => {
      const data = await galleryService.fetchImages(page, 50);
      if (page === 1) {
        setAccumulatedImages(data);
      } else {
        setAccumulatedImages((prev) => {
          const existingIds = new Set(prev.map((img) => img.id));
          const uniqueNew = data.filter((img) => !existingIds.has(img.id));
          return [...prev, ...uniqueNew];
        });
      }
      return data;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const handleRefresh = useCallback(async () => {
    setPage(1);
    await query.refetch();
  }, [query]);

  const loadMore = useCallback(async () => {
    if (query.isFetching || isFetchingMore || accumulatedImages.length < 50 * page) return;
    setIsFetchingMore(true);
    setPage((prev) => prev + 1);
    setIsFetchingMore(false);
  }, [query.isFetching, isFetchingMore, accumulatedImages.length, page]);

  const filteredImages = useMemo(() => {
    let result = accumulatedImages;

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
  }, [accumulatedImages, debouncedSearch, filter]);

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
    isFetchingMore,
  };
};
