import type { ImageItem } from '../services/galleryService';

/**
 * Pure gallery transformation logic, deliberately kept free of any
 * React/React Native/network import — so it (and its tests) can never be
 * destabilized by a native-module mock or a network mock going stale.
 */

export type GalleryFilter = 'ALL' | 'A-M' | 'N-Z';

/** Flattens paginated results into one list, de-duping defensively across page boundaries. */
export const flattenGalleryPages = (pages: ImageItem[][]): ImageItem[] => {
  const seen = new Set<string>();
  const flattened: ImageItem[] = [];
  for (const page of pages) {
    for (const image of page) {
      if (!seen.has(image.id)) {
        seen.add(image.id);
        flattened.push(image);
      }
    }
  }
  return flattened;
};

/** Author-name/id search (case-insensitive) + A-M/N-Z author-initial filter, applied together. */
export const filterImages = (
  images: ImageItem[],
  search: string,
  filter: GalleryFilter
): ImageItem[] => {
  let result = images;

  if (search) {
    const lowerSearch = search.toLowerCase();
    result = result.filter(
      (img) =>
        img.author.toLowerCase().includes(lowerSearch) ||
        img.id.includes(lowerSearch)
    );
  }

  if (filter !== 'ALL') {
    result = result.filter((img) => {
      const firstLetter = img.author.charAt(0).toUpperCase();
      if (filter === 'A-M') return firstLetter >= 'A' && firstLetter <= 'M';
      if (filter === 'N-Z') return firstLetter >= 'N' && firstLetter <= 'Z';
      return true;
    });
  }

  return result;
};

/** Mirrors the getNextPageParam logic used by useInfiniteQuery, as a pure function for testing. */
export const getNextGalleryPageParam = (
  lastPage: ImageItem[],
  allPages: ImageItem[][],
  pageSize: number
): number | undefined => {
  if (lastPage.length < pageSize) return undefined;
  return allPages.length + 1;
};
