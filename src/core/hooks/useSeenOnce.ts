import { useCallback, useEffect, useState } from 'react';
import { storage } from '../storage/storage';

/**
 * useSeenOnce
 * Generic "has the user already seen this?" flag, persisted to storage.
 * Used to shorten one-time intro/onboarding moments on repeat visits.
 *
 * `hasSeen` is `null` while the persisted value is still being read —
 * callers should treat `null` as "unknown, assume first-time" rather than
 * blocking render, since the read typically resolves in well under a
 * frame and defaulting to "already seen" risks skipping a true first-run.
 */
export const useSeenOnce = (storageKey: string) => {
  const [hasSeen, setHasSeen] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    storage.getItem<boolean>(storageKey).then((value) => {
      if (!cancelled) setHasSeen(!!value);
    });
    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  const markSeen = useCallback(() => {
    setHasSeen(true);
    storage.setItem(storageKey, true).catch(() => {});
  }, [storageKey]);

  return { hasSeen, markSeen };
};
