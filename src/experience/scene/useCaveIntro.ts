import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, withDelay, runOnJS, Easing, useReducedMotion } from 'react-native-reanimated';

/**
 * useCaveIntro
 * Choreographs the cinematic reveal:
 *   BLACK → cave walls fade in → logo emerges → UI emerges → stabilized
 *
 * `play=true` runs the full ~1.8s first-launch sequence; `play=false` runs a
 * condensed ~0.6s version for returning visits; `play=null` (still resolving
 * whether this is a first visit) holds everything at the black starting
 * frame — which is exactly where the sequence is meant to begin anyway.
 * Reduced-motion users get the final state immediately once resolved.
 */
export const useCaveIntro = (play: boolean | null, onDone?: () => void) => {
  const reducedMotion = useReducedMotion();

  const wallOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoTranslateY = useSharedValue(12);
  const uiOpacity = useSharedValue(0);
  const uiTranslateY = useSharedValue(16);

  useEffect(() => {
    if (play === null) return; // hold at the black starting frame until resolved

    if (reducedMotion) {
      wallOpacity.value = 1;
      logoOpacity.value = 1;
      logoTranslateY.value = 0;
      uiOpacity.value = 1;
      uiTranslateY.value = 0;
      onDone?.();
      return;
    }

    const easing = Easing.out(Easing.cubic);
    const timings = play
      ? { wall: [0, 700], logo: [500, 700], ui: [1100, 650] }
      : { wall: [0, 250], logo: [150, 300], ui: [300, 300] };

    wallOpacity.value = withDelay(timings.wall[0], withTiming(1, { duration: timings.wall[1], easing }));
    logoOpacity.value = withDelay(timings.logo[0], withTiming(1, { duration: timings.logo[1], easing }));
    logoTranslateY.value = withDelay(timings.logo[0], withTiming(0, { duration: timings.logo[1], easing }));

    uiOpacity.value = withDelay(
      timings.ui[0],
      withTiming(1, { duration: timings.ui[1], easing }, (finished) => {
        'worklet';
        if (finished && onDone) {
          runOnJS(onDone)();
        }
      })
    );
    uiTranslateY.value = withDelay(timings.ui[0], withTiming(0, { duration: timings.ui[1], easing }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, reducedMotion]);

  const wallStyle = useAnimatedStyle(() => ({ opacity: wallOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ translateY: logoTranslateY.value }],
  }));
  const uiStyle = useAnimatedStyle(() => ({
    opacity: uiOpacity.value,
    transform: [{ translateY: uiTranslateY.value }],
  }));

  return { wallStyle, logoStyle, uiStyle };
};
