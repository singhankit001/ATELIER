import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavoritesStore } from './useFavoritesStore';
import type { ImageItem } from '../../gallery/services/galleryService';

const imageA: ImageItem = { id: 'a', author: 'Alice', width: 400, height: 500, url: '', download_url: '', thumbnailUrl: '' };
const imageB: ImageItem = { id: 'b', author: 'Bob', width: 400, height: 500, url: '', download_url: '', thumbnailUrl: '' };

/** See useAuthStore.test.ts for why this is a real persistence-round-trip proxy, not just a code read. */
const resetToColdBootState = () => {
  useFavoritesStore.setState({ favorites: [], isHydrating: true });
};

describe('useFavoritesStore persistence', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetToColdBootState();
  });

  it('favoriting two images and simulating a restart keeps both', async () => {
    useFavoritesStore.getState().toggleFavorite(imageA);
    useFavoritesStore.getState().toggleFavorite(imageB);
    // toggleFavorite persists in the background (fire-and-forget) — flush microtasks.
    await Promise.resolve();

    resetToColdBootState();
    await useFavoritesStore.getState().hydrate();

    const favorites = useFavoritesStore.getState().favorites;
    expect(favorites.map((f) => f.id).sort()).toEqual(['a', 'b']);
  });

  it('removing a favorite then simulating a restart does not bring it back', async () => {
    useFavoritesStore.getState().toggleFavorite(imageA);
    useFavoritesStore.getState().toggleFavorite(imageB);
    await Promise.resolve();

    useFavoritesStore.getState().toggleFavorite(imageA); // remove A
    await Promise.resolve();

    resetToColdBootState();
    await useFavoritesStore.getState().hydrate();

    const favorites = useFavoritesStore.getState().favorites;
    expect(favorites.map((f) => f.id)).toEqual(['b']);
    expect(useFavoritesStore.getState().isFavorite('a')).toBe(false);
  });

  it('a cold boot with nothing ever favorited hydrates to an empty list, not stuck loading', async () => {
    await useFavoritesStore.getState().hydrate();

    expect(useFavoritesStore.getState().favorites).toEqual([]);
    expect(useFavoritesStore.getState().isHydrating).toBe(false);
  });
});
