import React from 'react';
import { Pressable, StyleSheet, ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Typography } from './Typography';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { usePressEffect } from '../../experience/interactions/usePressEffect';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'glass';
  style?: ViewStyle;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  style,
  disabled = false,
  icon,
}: ButtonProps) => {
  const { theme } = useAppTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressEffect(theme.motion.presets.cardPress.scale);

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.textTertiary;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return 'transparent';
      case 'glass': return theme.colors.surfaceGlass;
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.surface;
    switch (variant) {
      case 'primary': return theme.colors.surface;
      case 'secondary': return theme.colors.textPrimary;
      case 'glass': return theme.colors.textPrimary;
      default: return theme.colors.surface;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'secondary' && { borderWidth: 1, borderColor: theme.colors.border },
        variant === 'glass' && { borderWidth: 1, borderColor: theme.colors.borderGlass },
        style,
        animatedStyle,
      ]}
    >
      {icon && <View style={{ marginRight: theme.spacing.sm }}>{icon}</View>}
      <Typography variant="body" weight="medium" color={getTextColor()}>
        {label}
      </Typography>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 28,
    elevation: 10,
  },
});
