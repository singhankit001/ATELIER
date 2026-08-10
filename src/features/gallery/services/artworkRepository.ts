import { File, Paths } from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

export class ArtworkError extends Error {
  constructor(message: string, public readonly code: 'PERMISSION_DENIED' | 'DOWNLOAD_FAILED' | 'SAVE_FAILED') {
    super(message);
    this.name = 'ArtworkError';
  }
}

export const artworkRepository = {
  /**
   * Downloads an image to the device gallery.
   *
   * Uses Expo SDK 57's rewritten `File`/`Paths` filesystem API — the older
   * `FileSystem.createDownloadResumable`/`documentDirectory` functions
   * still exist as named exports but are stubs that throw at runtime in
   * this SDK version.
   */
  async downloadAndSaveImage(url: string, id: string, onProgress?: (progress: number) => void): Promise<void> {
    // Write-only — this feature only ever saves a new asset, it never
    // reads the user's existing library, so it never needs full access.
    const { status } = await MediaLibrary.requestPermissionsAsync(true);

    if (status !== 'granted') {
      throw new ArtworkError('Gallery permissions are required to save images.', 'PERMISSION_DENIED');
    }

    const destination = new File(Paths.cache, `atelier-download-${id}.jpg`);
    let downloaded: File;

    try {
      downloaded = await File.downloadFileAsync(url, destination, {
        idempotent: true,
        onProgress: (progress) => {
          if (progress.totalBytes > 0) {
            onProgress?.(progress.bytesWritten / progress.totalBytes);
          }
        },
      });
    } catch (error) {
      console.warn('[Download] failed:', error);
      throw new ArtworkError('Failed to download image.', 'DOWNLOAD_FAILED');
    }

    try {
      const asset = await MediaLibrary.createAssetAsync(downloaded.uri);

      // On Android, we might want to create an album. iOS handles it nicely in Recents.
      if (Platform.OS === 'android') {
        await MediaLibrary.createAlbumAsync('Gallery App', asset, false);
      }
    } catch (error) {
      console.warn('[Download] saving to library failed:', error);
      throw new ArtworkError('An error occurred while saving the image.', 'SAVE_FAILED');
    } finally {
      try {
        if (downloaded.exists) downloaded.delete();
      } catch (error) {
        console.warn('[Download] temp file cleanup failed (non-fatal):', error);
      }
    }
  },
};

// Sharing has moved to `features/sharing` (see useArtworkShare / sharingService) —
// it now owns its own error type, cache-only temp files, and guaranteed cleanup.
