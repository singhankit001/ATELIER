import { useCallback, useMemo, useState } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { galleryService, ImageItem, PAGE_SIZE } from '../services/galleryService';
import { flattenGalleryPages, filterImages, getNextGalleryPageParam, GalleryFilter } from './galleryFilter';
import { useDebounce } from '../../../core/hooks/useDebounce';

export type { GalleryFilter };

const GALLERY_QUERY_KEY = ['gallery', 'infinite', PAGE_SIZE];

export const useGalleryController = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<GalleryFilter>('ALL');
  const queryClient = useQueryClient();

  const debouncedSearch = useDebounce(search, 300);

  const query = useInfiniteQuery({
    queryKey: GALLERY_QUERY_KEY,
    queryFn: ({ pageParam }) => galleryService.fetchImages(pageParam, PAGE_SIZE),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => getNextGalleryPageParam(lastPage, allPages, PAGE_SIZE),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const allImages = useMemo(
    () => flattenGalleryPages(query.data?.pages ?? []),
    [query.data]
  );

  const filteredImages = useMemo(
    () => filterImages(allImages, debouncedSearch, filter),
    [allImages, debouncedSearch, filter]
  );

  const isSearchingOrFiltering = debouncedSearch.length > 0 || filter !== 'ALL';

  const loadMore = useCallback(() => {
    // Pagination only makes sense over the unfiltered feed — while the
    // user is searching/filtering, "load more" would fetch pages whose
    // contents they can't even see yet. Search only ever operates over
    // pages already loaded before the search started; this is a
    // deliberate scope choice (Picsum has no author-search endpoint to
    // page against), not an oversight — surfaced in the UI via `hasMore`
    // going false the moment a search/filter is active.
    if (isSearchingOrFiltering) return;
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [isSearchingOrFiltering, query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  /**
   * Pull-to-refresh resets to a clean page 1 rather than refetching every
   * page the user has scrolled through — the default `refetch()` behavior
   * on an infinite query re-requests all currently-loaded pages, which
   * only gets slower the further someone has scrolled, and doesn't match
   * what "pull to refresh" means anywhere else in the app.
   */
  const refresh = useCallback(async () => {
    await queryClient.resetQueries({ queryKey: GALLERY_QUERY_KEY });
  }, [queryClient]);

  return {
    ...query,
    refetch: refresh,
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
