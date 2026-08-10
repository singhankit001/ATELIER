import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ShareableArtwork, SharingError } from '../types/sharing.types';

/**
 * sharingService
 * The only place in the app that knows how to turn an artwork into a
 * native share-sheet invocation. Downloads to the ephemeral cache
 * directory (`Paths.cache`, not the document directory — this file is
 * disposable), shares, then always cleans up regardless of outcome.
 *
 * Uses Expo SDK 57's rewritten `File`/`Paths` filesystem API — the older
 * `FileSystem.downloadAsync`/`documentDirectory` functions still exist as
 * named exports but are stubs that throw at runtime in this SDK version.
 */
export const sharingService = {
  async shareArtwork(artwork: ShareableArtwork): Promise<void> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new SharingError('Sharing isn’t available on this device.', 'UNAVAILABLE');
    }

    const destination = new File(Paths.cache, `atelier-share-${artwork.id}.jpg`);
    let downloaded: File;

    try {
      downloaded = await File.downloadFileAsync(artwork.imageUrl, destination, { idempotent: true });
    } catch (error) {
      console.warn('[Share] download failed:', error);
      throw new SharingError(
        'Unable to prepare this artwork for sharing. Please try again.',
        'PREPARE_FAILED'
      );
    }

    try {
      // Resolves once the native sheet is dismissed, whether the user
      // completed a share or cancelled — the two are indistinguishable
      // here by design, and both are treated as "not an error".
      await Sharing.shareAsync(downloaded.uri, {
        mimeType: 'image/jpeg',
        dialogTitle: artwork.author ? `Artwork by ${artwork.author} — ATELIER` : 'Share Artwork — ATELIER',
        UTI: 'public.jpeg',
      });
    } catch (error) {
      console.warn('[Share] native share sheet failed:', error);
      throw new SharingError('Unable to open the share sheet. Please try again.', 'SHARE_FAILED');
    } finally {
      try {
        if (downloaded.exists) downloaded.delete();
      } catch (error) {
        console.warn('[Share] temp file cleanup failed (non-fatal):', error);
      }
    }
  },
};
