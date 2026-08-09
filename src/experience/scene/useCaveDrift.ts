import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, useReducedMotion } from 'react-native-reanimated';

/**
 * useCaveDrift
 * A single slow, endless 0↔1 ping-pong value that haze and particle layers
 * derive their gentle motion from — one shared clock instead of every layer
 * running its own repeat loop. Frozen at rest (0.5) under reduced motion.
 */
export const useCaveDrift = (durationMs = 9000) => {
  const reducedMotion = useReducedMotion();
  const drift = useSharedValue(reducedMotion ? 0.5 : 0);

  useEffect(() => {
    if (reducedMotion) {
      drift.value = 0.5;
      return;
    }
    drift.value = withRepeat(withTiming(1, { duration: durationMs }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, durationMs]);

  return drift;
};
