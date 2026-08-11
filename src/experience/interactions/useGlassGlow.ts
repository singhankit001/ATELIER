import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  interpolate,
  Extrapolation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import { theme } from '../../core/theme/theme';

export interface GlowToken {
  color: string;
  rgb: readonly [number, number, number];
  low: number;
  medium: number;
  high: number;
}

/**
 * useGlassGlow
 * The animated-glassmorphism system's core interaction engine: a card (or
 * any glass surface) presses with a fast physical spring, and carries a
 * slow, barely-noticeable ambient "breathing" glow — an animated border +
 * soft shadow, not an inner color wash, so it doesn't tint whatever image
 * the card is holding — that brightens sharply on press.
 *
 * `ambient` disables the idle breathing loop (e.g. for a small icon
 * button, where a constantly-pulsing glow would just be visual noise —
 * press-only feedback is enough there).
 */
export const useGlassGlow = (glowToken: GlowToken, options?: { ambient?: boolean; pressScale?: number }) => {
  const ambient = options?.ambient ?? true;
  const pressScale = options?.pressScale ?? 0.97;
  const reducedMotion = useReducedMotion();

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const pressed = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    if (!ambient || reducedMotion) {
      breathe.value = 0;
      return;
    }
    breathe.value = withRepeat(
      withTiming(1, { duration: theme.motion.durations.glowBreathe, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
  }, [ambient, reducedMotion]);

  const onPressIn = () => {
    'worklet';
    scale.value = withSpring(pressScale, theme.springs.press);
    opacity.value = withTiming(0.92, { duration: theme.motion.durations.fast });
    pressed.value = withTiming(1, { duration: theme.motion.durations.fast });
  };

  const onPressOut = () => {
    'worklet';
    scale.value = withSpring(1, theme.springs.press);
    opacity.value = withTiming(1, { duration: theme.motion.durations.normal });
    pressed.value = withTiming(0, { duration: theme.motion.durations.normal });
  };

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => {
    const idleLevel = interpolate(breathe.value, [0, 1], [glowToken.low, glowToken.medium]);
    const level = interpolate(pressed.value, [0, 1], [idleLevel, glowToken.high]);
    const [r, g, b] = glowToken.rgb;
    return {
      borderColor: `rgba(${r}, ${g}, ${b}, ${level})`,
      shadowColor: glowToken.color,
      shadowOpacity: level,
      shadowRadius: interpolate(level, [glowToken.low, glowToken.high], [4, 16], Extrapolation.CLAMP),
    };
  });

  return { cardStyle, glowStyle, onPressIn, onPressOut };
};
