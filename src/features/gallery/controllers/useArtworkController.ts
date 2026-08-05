import { useState, useCallback } from 'react';
import { ImageItem } from '../services/galleryService';
import { artworkRepository, ArtworkError } from '../services/artworkRepository';
import { useFavoritesStore } from '../../favorites/store/useFavoritesStore';

export const useArtworkController = (image: ImageItem | null) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  
  const toggleFavorite = useFavoritesStore(state => state.toggleFavorite);
  const isFavorite = useFavoritesStore(state => state.isFavorite(image?.id || ''));

  const handleToggleFavorite = useCallback(() => {
    if (image) toggleFavorite(image);
  }, [image, toggleFavorite]);

  const toggleControls = useCallback(() => {
    setControlsVisible(prev => !prev);
  }, []);

  const downloadImage = useCallback(async (onSuccess: () => void, onError: (message: string) => void) => {
    if (!image || isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      await artworkRepository.downloadAndSaveImage(
        image.download_url,
        image.id,
        (progress) => setDownloadProgress(progress)
      );
      onSuccess();
    } catch (error) {
      if (error instanceof ArtworkError) {
        onError(error.message);
      } else {
        onError('An unexpected error occurred.');
      }
    } finally {
      setIsDownloading(false);
    }
  }, [image, isDownloading]);

  const shareImage = useCallback(async (onError: (message: string) => void) => {
    if (!image || isSharing) return;

    setIsSharing(true);
    try {
      await artworkRepository.shareImage(image.download_url, image.id);
    } catch (error) {
      if (error instanceof ArtworkError) {
        onError(error.message);
      } else {
        onError('An unexpected error occurred.');
      }
    } finally {
      setIsSharing(false);
    }
  }, [image, isSharing]);

  return {
    controlsVisible,
    toggleControls,
    isFavorite,
    handleToggleFavorite,
    isDownloading,
    downloadProgress,
    downloadImage,
    isSharing,
    shareImage,
  };
};
