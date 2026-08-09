import { useCallback, useRef, useState } from 'react';
import { sharingService } from '../services/sharingService';
import { ShareableArtwork, ShareStatus, SharingError } from '../types/sharing.types';

const ERROR_DISPLAY_MS = 3200;

/**
 * useArtworkShare
 * Owns the sharing state machine so the UI never has to.
 *
 * ArtworkViewer
 *      ↓
 * useArtworkShare()   ← this hook
 *      ↓
 * sharingService
 *      ↓
 * Expo native APIs
 *
 * The viewer only ever calls `share(artwork)` and reads `status` / `errorMessage`.
 */
export const useArtworkShare = () => {
  const [status, setStatus] = useState<ShareStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const share = useCallback(async (artwork: ShareableArtwork) => {
    if (status === 'preparing') return; // already in flight — ignore double taps

    if (errorTimer.current) clearTimeout(errorTimer.current);
    setErrorMessage(null);
    setStatus('preparing');

    try {
      await sharingService.shareArtwork(artwork);
      setStatus('idle'); // covers both a completed share and a user cancellation
    } catch (error) {
      const message = error instanceof SharingError
        ? error.message
        : 'Unable to prepare this artwork for sharing. Please try again.';
      setErrorMessage(message);
      setStatus('error');
      errorTimer.current = setTimeout(() => {
        setStatus('idle');
        setErrorMessage(null);
      }, ERROR_DISPLAY_MS);
    }
  }, [status]);

  return {
    status,
    isPreparing: status === 'preparing',
    hasError: status === 'error',
    errorMessage,
    share,
  };
};
