import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ShareableArtwork, SharingError } from '../types/sharing.types';

const CACHE_DIR = (FileSystem as any).cacheDirectory || '';

const cacheUriFor = (artwork: ShareableArtwork) => `${CACHE_DIR}atelier-share-${artwork.id}.jpg`;

/**
 * sharingService
 * The only place in the app that knows how to turn an artwork into a
 * native share-sheet invocation. Downloads to the ephemeral cache
 * directory (not documentDirectory — this file is disposable), shares,
 * then always cleans up regardless of outcome.
 */
export const sharingService = {
  async shareArtwork(artwork: ShareableArtwork): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new SharingError('Sharing isn’t available on this device.', 'UNAVAILABLE');
    }

    const localUri = cacheUriFor(artwork);

    try {
      await FileSystem.downloadAsync(artwork.imageUrl, localUri);
    } catch {
      throw new SharingError(
        'Unable to prepare this artwork for sharing. Please try again.',
        'PREPARE_FAILED'
      );
    }

    try {
      // Resolves once the native sheet is dismissed, whether the user
      // completed a share or cancelled — the two are indistinguishable
      // here by design, and both are treated as "not an error".
      await Sharing.shareAsync(localUri, {
        mimeType: 'image/jpeg',
        dialogTitle: artwork.author ? `Artwork by ${artwork.author} — ATELIER` : 'Share Artwork — ATELIER',
        UTI: 'public.jpeg',
      });
    } catch {
      throw new SharingError('Unable to open the share sheet. Please try again.', 'SHARE_FAILED');
    } finally {
      FileSystem.deleteAsync(localUri, { idempotent: true }).catch(() => {});
    }
  },
};
