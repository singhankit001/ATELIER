import React, { useEffect } from 'react';
import { StyleSheet, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { Heart } from 'lucide-react-native';
import { useAppTheme } from '../../core/theme/ThemeProvider';

interface AnimatedFavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * AnimatedFavoriteButton
 * ♡ → scale up → ♥ + glow → spring back to rest. One shared component so
 * every heart in the app (gallery card, favorites card, artwork viewer)
 * animates identically — no per-screen bespoke toggle animation.
 */
export const AnimatedFavoriteButton = ({ isFavorite, onToggle, size = 20, style }: AnimatedFavoriteButtonProps) => {
  const { theme } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const glow = useSharedValue(isFavorite ? 1 : 0);

  useEffect(() => {
    glow.value = withTiming(isFavorite ? 1 : 0, { duration: theme.motion.durations.normal });
  }, [isFavorite]);

  const handlePress = () => {
    if (reducedMotion) {
      scale.value = 1;
    } else {
      scale.value = withSequence(
        withSpring(1.25, theme.springs.favorite),
        withSpring(1, theme.springs.favorite)
      );
    }
    onToggle();
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * theme.glow.error.high,
    backgroundColor: theme.glow.error.color,
  }));

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      accessibilityState={{ selected: isFavorite }}
      style={[styles.button, style]}
    >
      <Animated.View pointerEvents="none" style={[styles.glow, glowStyle]} />
      <Animated.View style={iconStyle}>
        <Heart
          size={size}
          color={isFavorite ? theme.colors.error : theme.colors.surface}
          fill={isFavorite ? theme.colors.error : 'transparent'}
        />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    ...StyleSheet.absoluteFill,
    borderRadius: 22,
    opacity: 0,
  },
});
