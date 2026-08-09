import * as FileSystem from 'expo-file-system';
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
   */
  async downloadAndSaveImage(url: string, id: string, onProgress?: (progress: number) => void): Promise<void> {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    
    if (status !== 'granted') {
      throw new ArtworkError('Gallery permissions are required to save images.', 'PERMISSION_DENIED');
    }

    const fileUri = ((FileSystem as any).documentDirectory || '') + `artwork_${id}.jpg`;

    try {
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          onProgress?.(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (!result) {
        throw new ArtworkError('Failed to download image.', 'DOWNLOAD_FAILED');
      }

      const asset = await MediaLibrary.createAssetAsync(result.uri);
      
      // On Android, we might want to create an album. iOS handles it nicely in Recents.
      if (Platform.OS === 'android') {
        await MediaLibrary.createAlbumAsync('Gallery App', asset, false);
      }
    } catch (error) {
      if (error instanceof ArtworkError) throw error;
      throw new ArtworkError('An error occurred while saving the image.', 'SAVE_FAILED');
    }
  },
};

// Sharing has moved to `features/sharing` (see useArtworkShare / sharingService) —
// it now owns its own error type, cache-only temp files, and guaranteed cleanup.
