import { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolate } from 'react-native-reanimated';
import { theme } from '../../core/theme/theme';

/**
 * useIlluminatedPress
 * Extends usePressEffect with a soft "illumination" glow that rises on
 * press and eases back out on release — used for premium floating glass
 * controls (e.g. the artwork Share button) where a plain scale-down feels
 * too utilitarian.
 *
 *   idle → finger down → scale 0.94 + glow up → finger release → spring back
 */
export const useIlluminatedPress = (scaleDownTo = 0.94) => {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: interpolate(glow.value, [0, 1], [0.08, 0.3]),
    shadowRadius: interpolate(glow.value, [0, 1], [6, 16]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const onPressIn = () => {
    'worklet';
    scale.value = withSpring(scaleDownTo, theme.springs.gentle);
    glow.value = withTiming(1, { duration: theme.motion.durations.fast });
  };

  const onPressOut = () => {
    'worklet';
    scale.value = withSpring(1, theme.springs.gentle);
    glow.value = withTiming(0, { duration: theme.motion.durations.medium });
  };

  return { animatedStyle, glowStyle, onPressIn, onPressOut };
};
