import { flattenGalleryPages, filterImages, getNextGalleryPageParam } from './galleryFilter';
import type { ImageItem } from '../services/galleryService';

const makeImage = (id: string, author: string): ImageItem => ({
  id,
  author,
  width: 400,
  height: 400,
  url: `https://picsum.photos/id/${id}/400/400`,
  download_url: `https://picsum.photos/id/${id}/400/400`,
  thumbnailUrl: `https://picsum.photos/id/${id}/600/900`,
});

describe('flattenGalleryPages', () => {
  it('flattens multiple pages into one list, preserving order', () => {
    const page1 = [makeImage('1', 'Alice'), makeImage('2', 'Bob')];
    const page2 = [makeImage('3', 'Carol')];
    expect(flattenGalleryPages([page1, page2]).map((i) => i.id)).toEqual(['1', '2', '3']);
  });

  it('de-dupes by id across page boundaries', () => {
    const page1 = [makeImage('1', 'Alice')];
    const page2 = [makeImage('1', 'Alice'), makeImage('2', 'Bob')]; // '1' overlaps
    expect(flattenGalleryPages([page1, page2]).map((i) => i.id)).toEqual(['1', '2']);
  });

  it('returns an empty list for no pages', () => {
    expect(flattenGalleryPages([])).toEqual([]);
  });
});

describe('filterImages', () => {
  const images = [
    makeImage('0', 'Alejandro Escamilla'),
    makeImage('1', 'John Doe'),
    makeImage('2', 'Zara Khan'),
    makeImage('3', 'Nadia Ray'),
  ];

  it('returns everything when there is no search and filter is ALL', () => {
    expect(filterImages(images, '', 'ALL')).toHaveLength(4);
  });

  it('search is case-insensitive', () => {
    expect(filterImages(images, 'JOHN', 'ALL').map((i) => i.id)).toEqual(['1']);
    expect(filterImages(images, 'john', 'ALL').map((i) => i.id)).toEqual(['1']);
    expect(filterImages(images, 'JoHn', 'ALL').map((i) => i.id)).toEqual(['1']);
  });

  it('search matches a partial author string', () => {
    expect(filterImages(images, 'esc', 'ALL').map((i) => i.id)).toEqual(['0']);
  });

  it('search also matches by id', () => {
    expect(filterImages(images, '2', 'ALL').map((i) => i.id)).toEqual(['2']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterImages(images, 'nonexistent-author', 'ALL')).toEqual([]);
  });

  it('filters by A-M author initial', () => {
    // Alejandro (A), John (J) — Nadia is N, Zara is Z, both out of range
    expect(filterImages(images, '', 'A-M').map((i) => i.id).sort()).toEqual(['0', '1']);
  });

  it('filters by N-Z author initial', () => {
    // Nadia (N), Zara (Z)
    expect(filterImages(images, '', 'N-Z').map((i) => i.id).sort()).toEqual(['2', '3']);
  });

  it('applies search and filter together', () => {
    // N-Z filter + search "ray" should only keep Nadia Ray
    expect(filterImages(images, 'ray', 'N-Z').map((i) => i.id)).toEqual(['3']);
  });

  it('an A-M filter with a search that only matches an N-Z author returns nothing', () => {
    expect(filterImages(images, 'zara', 'A-M')).toEqual([]);
  });

  it('clearing the filter (back to ALL) preserves the search results', () => {
    const withFilter = filterImages(images, 'a', 'A-M');
    const withoutFilter = filterImages(images, 'a', 'ALL');
    expect(withoutFilter.length).toBeGreaterThanOrEqual(withFilter.length);
  });
});

describe('getNextGalleryPageParam', () => {
  // Gallery is deliberately capped at page 1 (50 images) — an explicit
  // product decision, not infinite scroll. These lock in that the
  // function never advances past page 1, regardless of input shape.
  it('returns undefined even when the last page is completely full', () => {
    const fullPage = [makeImage('1', 'A'), makeImage('2', 'B')];
    expect(getNextGalleryPageParam(fullPage, [fullPage], 2)).toBeUndefined();
  });

  it('returns undefined when the last page is short', () => {
    const shortPage = [makeImage('1', 'A')];
    expect(getNextGalleryPageParam(shortPage, [shortPage], 2)).toBeUndefined();
  });

  it('returns undefined for an empty last page', () => {
    expect(getNextGalleryPageParam([], [[]], 50)).toBeUndefined();
  });

  it('returns undefined at real gallery scale (a full 50-image page)', () => {
    const fullPage = Array.from({ length: 50 }, (_, i) => makeImage(String(i), 'Author'));
    expect(getNextGalleryPageParam(fullPage, [fullPage], 50)).toBeUndefined();
  });
});
