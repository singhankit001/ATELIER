import React from 'react';
import { StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { useGlassGlow, GlowToken } from '../../experience/interactions/useGlassGlow';

interface AnimatedGlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  glowToken?: GlowToken;
  /** Idle "breathing" glow. Off by default for small/dense grids where a
   * dozen simultaneously-pulsing cards would read as noisy rather than alive. */
  ambient?: boolean;
  intensity?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'imagebutton';
}

/**
 * AnimatedGlassCard
 * The base unit of the animated-glassmorphism system: a translucent,
 * blurred surface that presses with a physical spring and carries a
 * subtle animated glow border — used for gallery/favorite artwork cards.
 * Image content stays untinted; the glow lives on the border/shadow, not
 * an overlay wash.
 */
export const AnimatedGlassCard = ({
  children,
  onPress,
  glowToken,
  ambient = false,
  intensity,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityRole = 'button',
}: AnimatedGlassCardProps) => {
  const { theme, isDark } = useAppTheme();
  const resolvedGlow = glowToken ?? theme.glow.primary;
  const { cardStyle, glowStyle, onPressIn, onPressOut } = useGlassGlow(resolvedGlow, {
    ambient: ambient && !disabled,
  });

  const surface = (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceGlass02,
          shadowOffset: { width: 0, height: 6 },
        },
        cardStyle,
        glowStyle,
        style,
      ]}
    >
      <BlurView
        intensity={intensity ?? theme.glassLevels.medium}
        tint={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </Animated.View>
  );

  if (!onPress) return surface;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      {surface}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOpacity: 0,
  },
});
