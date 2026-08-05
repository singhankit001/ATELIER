import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export class ArtworkError extends Error {
  constructor(message: string, public readonly code: 'PERMISSION_DENIED' | 'DOWNLOAD_FAILED' | 'SAVE_FAILED' | 'SHARE_FAILED') {
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

  /**
   * Downloads the image to a temporary file and triggers native sharing.
   */
  async shareImage(url: string, id: string): Promise<void> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new ArtworkError('Sharing is not available on this device.', 'SHARE_FAILED');
      }

      const fileUri = ((FileSystem as any).documentDirectory || '') + `share_${id}.jpg`;
      
      const result = await FileSystem.downloadAsync(url, fileUri);
      
      await Sharing.shareAsync(result.uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Share Artwork',
      });
    } catch (error) {
      if (error instanceof ArtworkError) throw error;
      throw new ArtworkError('An error occurred while sharing the image.', 'SHARE_FAILED');
    }
  }
};
