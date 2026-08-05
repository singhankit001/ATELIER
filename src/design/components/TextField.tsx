import React, { useState } from 'react';
import { TextInput, View, StyleSheet, TextInputProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { Typography } from './Typography';

export interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Shared TextField Component
 * Features a floating label animation and smooth border transitions on focus.
 * Uses useAppTheme() so all colors react to dark/light mode.
 */
export const TextField = React.forwardRef<TextInput, TextFieldProps>(({ label, error, leftIcon, rightIcon, style, value, ...props }, ref) => {
  const { theme } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const isOccupied = isFocused || (value && value.length > 0);

  const focusAnim = useSharedValue(isOccupied ? 1 : 0);

  React.useEffect(() => {
    focusAnim.value = withSpring(isOccupied ? 1 : 0, theme.springs.gentle);
  }, [isOccupied, focusAnim]);

  const labelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: focusAnim.value * -12 },
        { scale: 1 - focusAnim.value * 0.2 },
      ],
      color: interpolateColor(
        focusAnim.value,
        [0, 1],
        [theme.colors.textTertiary, theme.colors.textSecondary]
      ),
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    if (error) {
      return { borderColor: theme.colors.error };
    }
    return {
      borderColor: interpolateColor(
        focusAnim.value,
        [0, 1],
        [theme.colors.border, theme.colors.accent]
      ),
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[
        styles.inputContainer,
        { backgroundColor: theme.colors.surface },
        borderStyle,
        style as any,
      ]}>
        <Animated.View style={[styles.labelContainer, labelStyle]}>
          <Typography variant="caption">{label}</Typography>
        </Animated.View>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            { color: theme.colors.textPrimary },
            leftIcon ? { paddingLeft: 32 } : undefined,
          ]}
          value={value}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          placeholderTextColor="transparent"
          {...props}
        />
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </Animated.View>
      {error && (
        <Typography variant="label" color={theme.colors.error} style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
});

TextField.displayName = 'TextField';

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    position: 'relative',
    height: 64,
  },
  labelContainer: {
    position: 'absolute',
    left: 16,
    top: 24,
    transformOrigin: 'top left',
  },
  input: {
    fontFamily: 'System',
    fontSize: 16,
    padding: 0,
    margin: 0,
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
  },
  leftIconContainer: {
    position: 'absolute',
    left: 8,
    top: 16,
    zIndex: 1,
    height: '100%',
    justifyContent: 'center',
  },
  rightIconContainer: {
    position: 'absolute',
    right: 8,
    top: 16,
    zIndex: 1,
    height: '100%',
    justifyContent: 'center',
  },
});
