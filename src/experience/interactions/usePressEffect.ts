import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { theme } from '../../core/theme/theme';

/**
 * Reusable press interaction hook.
 * Abstracts Reanimated logic out of the component layer.
 */
export const usePressEffect = (scaleDownTo = 0.95) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    'worklet';
    scale.value = withSpring(scaleDownTo, theme.springs.gentle);
  };

  const onPressOut = () => {
    'worklet';
    scale.value = withSpring(1, theme.springs.gentle);
  };

  return { animatedStyle, onPressIn, onPressOut };
};
