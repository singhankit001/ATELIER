import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageItem } from '../services/galleryService';
import { artworkRepository, ArtworkError } from '../services/artworkRepository';
import { useFavoritesStore } from '../../favorites/store/useFavoritesStore';

const SUCCESS_DISPLAY_MS = 1400;

export const useArtworkController = (image: ImageItem | null) => {
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (successTimer.current) clearTimeout(successTimer.current);
  }, []);

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
      // Download → spinner → checkmark, briefly, before returning to idle.
      setDownloadSuccess(true);
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setDownloadSuccess(false), SUCCESS_DISPLAY_MS);
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

  return {
    controlsVisible,
    toggleControls,
    isFavorite,
    handleToggleFavorite,
    isDownloading,
    downloadProgress,
    downloadSuccess,
    downloadImage,
  };
};
