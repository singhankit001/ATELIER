import { toggleFavoriteInList, isFavoriteInList } from './favoritesLogic';
import type { ImageItem } from '../../gallery/services/galleryService';

const makeImage = (id: string, author = 'Author'): ImageItem => ({
  id,
  author,
  width: 400,
  height: 400,
  url: `https://picsum.photos/id/${id}/400/400`,
  download_url: `https://picsum.photos/id/${id}/400/400`,
  thumbnailUrl: `https://picsum.photos/id/${id}/600/900`,
});

describe('toggleFavoriteInList', () => {
  it('adds an image that is not yet a favorite', () => {
    const result = toggleFavoriteInList([], makeImage('1'));
    expect(result.map((i) => i.id)).toEqual(['1']);
  });

  it('removes an image that is already a favorite', () => {
    const favorites = [makeImage('1'), makeImage('2')];
    const result = toggleFavoriteInList(favorites, makeImage('1'));
    expect(result.map((i) => i.id)).toEqual(['2']);
  });

  it('does not mutate the original array', () => {
    const favorites = [makeImage('1')];
    const result = toggleFavoriteInList(favorites, makeImage('2'));
    expect(favorites.map((i) => i.id)).toEqual(['1']);
    expect(result.map((i) => i.id)).toEqual(['1', '2']);
  });
});

describe('isFavoriteInList', () => {
  it('is true for an id present in the list', () => {
    expect(isFavoriteInList([makeImage('1')], '1')).toBe(true);
  });

  it('is false for an id not present in the list', () => {
    expect(isFavoriteInList([makeImage('1')], '2')).toBe(false);
  });

  it('is false for an empty list', () => {
    expect(isFavoriteInList([], '1')).toBe(false);
  });
});
