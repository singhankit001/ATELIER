import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { galleryService, ImageItem, PAGE_SIZE } from '../services/galleryService';
import { useDebounce } from '../../../core/hooks/useDebounce';

export type GalleryFilter = 'ALL' | 'A-M' | 'N-Z';

export const useGalleryController = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GalleryFilter>('ALL');

  const debouncedSearch = useDebounce(search, 300);

  const query = useInfiniteQuery({
    queryKey: ['gallery', 'infinite', PAGE_SIZE],
    queryFn: ({ pageParam }) => galleryService.fetchImages(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Picsum returning fewer items than requested means we've hit the end.
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length + 1;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const allImages = useMemo(() => {
    const pages = query.data?.pages ?? [];
    const seen = new Set<string>();
    const flattened: ImageItem[] = [];
    for (const page of pages) {
      for (const image of page) {
        // Defensive de-dupe — protects FlatList's keyExtractor if the API
        // ever overlaps a page boundary.
        if (!seen.has(image.id)) {
          seen.add(image.id);
          flattened.push(image);
        }
      }
    }
    return flattened;
  }, [query.data]);

  const filteredImages = useMemo(() => {
    let result = allImages;

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
  }, [allImages, debouncedSearch, filter]);

  const isSearchingOrFiltering = debouncedSearch.length > 0 || filter !== 'ALL';

  const loadMore = useCallback(() => {
    // Pagination only makes sense over the unfiltered feed — while the
    // user is searching/filtering, "load more" would fetch pages whose
    // contents they can't even see yet.
    if (isSearchingOrFiltering) return;
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [isSearchingOrFiltering, query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  return {
    ...query,
    search,
    setSearch,
    filter,
    setFilter,
    images: filteredImages,
    isEmpty: filteredImages.length === 0 && !query.isLoading,
    loadMore,
    isLoadingMore: query.isFetchingNextPage,
    hasMore: isSearchingOrFiltering ? false : (query.hasNextPage ?? false),
  };
};
