import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { usePressEffect } from '../../experience/interactions/usePressEffect';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  pressable?: boolean;
  onPress?: () => void;
}

/**
 * GlassCard Primitive
 * Architectural frosted glass container consuming design tokens.
 * Uses useAppTheme() so it reacts to dark/light mode changes at runtime.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity,
  tint,
  pressable = false,
  onPress,
}) => {
  const { theme, isDark } = useAppTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressEffect(pressable ? 0.98 : 1);

  // Resolve tint and intensity from theme when not explicitly provided
  const resolvedTint = tint ?? (isDark ? 'dark' : 'light');
  const resolvedIntensity = intensity ?? (isDark ? 25 : 35);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceGlass,
          borderColor: theme.colors.borderGlass,
        },
        animatedStyle,
        style,
      ]}
      onTouchStart={pressable ? onPressIn : undefined}
      onTouchEnd={pressable ? (e) => { onPressOut(); onPress?.(); } : undefined}
    >
      <BlurView intensity={resolvedIntensity} tint={resolvedTint} style={StyleSheet.absoluteFill} />
      <Animated.View style={styles.content}>
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 5,
  },
  content: {
    padding: 24,
  },
});
