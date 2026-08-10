import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { useAuthStore } from '../../features/auth/store/useAuthStore';

const FULL_DURATION = 2200;
const REDUCED_DURATION = 700;
const FAILSAFE_BUFFER = 1500; // extra grace period before force-clearing, in case the completion callback never fires

/**
 * useCinematicTransition
 * The single source of cinematic truth for the post-auth journey:
 *
 *   0.00  deep cave (where the login screen left off)
 *   0.35  camera begins pushing forward, cave starts dissolving
 *   0.55  warm light wash at the crossover
 *   0.75  mountain landscape fully resolved, camera settling
 *   1.00  overlay itself has faded away — the gallery underneath was
 *         already mounted the instant auth succeeded, so it's simply
 *         revealed rather than "navigated to"
 *
 * Every visual property below is derived from one shared `progress` value
 * so the layers can never drift out of sync with each other. Reduced
 * motion collapses this to a plain crossfade — same emotional beats
 * (cave → light → mountain), none of the camera-push motion.
 */
export const useCinematicTransition = () => {
  const isPortalActive = useAuthStore((state) => state.isPortalActive);
  const setPortalActive = useAuthStore((state) => state.setPortalActive);
  const reducedMotion = useReducedMotion();

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!isPortalActive) {
      progress.value = 0;
      return;
    }

    const duration = reducedMotion ? REDUCED_DURATION : FULL_DURATION;

    progress.value = withTiming(
      1,
      { duration, easing: Easing.inOut(Easing.cubic) },
      (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setPortalActive)(false);
        }
      }
    );

    // Failsafe: if the animation is ever interrupted (backgrounded app,
    // dropped frames, a future refactor bug) the user must never be stuck
    // staring at a frozen transition screen.
    const failsafe = setTimeout(() => setPortalActive(false), duration + FAILSAFE_BUFFER);
    return () => clearTimeout(failsafe);
  }, [isPortalActive, reducedMotion]);

  const caveStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0, 0.4], [1, 0], Extrapolation.CLAMP);
    const scale = reducedMotion
      ? 1
      : interpolate(progress.value, [0, 1], [1, 1.18], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const mountainStyle = useAnimatedStyle(() => {
    const opacity = interpolate(progress.value, [0.3, 0.7], [0, 1], Extrapolation.CLAMP);
    const scale = reducedMotion
      ? 1
      : interpolate(progress.value, [0.3, 1], [1.1, 1], Extrapolation.CLAMP);
    return { opacity, transform: [{ scale }] };
  });

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.28, 0.5, 0.78], [0, 0.6, 0], Extrapolation.CLAMP),
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.85, 1], [1, 0], Extrapolation.CLAMP),
  }));

  return { active: isPortalActive, caveStyle, mountainStyle, glowStyle, overlayStyle };
};
