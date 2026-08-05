import React, { forwardRef, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../../core/theme/theme';
import { Typography } from './Typography';
import { TextField, TextFieldProps } from './TextField';
import { Eye, EyeOff } from 'lucide-react-native';

export interface PasswordFieldProps extends TextFieldProps {
  showStrength?: boolean;
}

export const PasswordField = forwardRef<TextInput, PasswordFieldProps>(({ showStrength = false, value = '', ...props }, ref) => {
  const [isSecure, setIsSecure] = useState(true);

  // Evaluate password strength
  const getStrength = (val: string) => {
    if (!val || val.length === 0) return 0;
    if (val.length < 6) return 1; // Weak
    if (val.length >= 6 && /[A-Z]/.test(val) && /[0-9]/.test(val)) return 3; // Strong
    return 2; // Medium
  };

  const strengthLevel = getStrength(value);
  const strengthAnim = useSharedValue(strengthLevel);

  React.useEffect(() => {
    strengthAnim.value = withSpring(strengthLevel, theme.springs.gentle);
  }, [strengthLevel, strengthAnim]);

  const strengthBarStyle = useAnimatedStyle(() => {
    return {
      width: `${(strengthAnim.value / 3) * 100}%`,
      backgroundColor: interpolateColor(
        strengthAnim.value,
        [0, 1, 2, 3],
        ['transparent', theme.colors.error, theme.colors.accent, theme.colors.success]
      ),
    };
  });

  const getStrengthText = () => {
    if (strengthLevel === 0) return '';
    if (strengthLevel === 1) return 'Weak';
    if (strengthLevel === 2) return 'Medium';
    if (strengthLevel === 3) return 'Strong';
    return '';
  };

  const getStrengthColor = () => {
    if (strengthLevel === 1) return theme.colors.error;
    if (strengthLevel === 2) return theme.colors.accent;
    if (strengthLevel === 3) return theme.colors.success;
    return theme.colors.textTertiary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextField
          {...props}
          ref={ref}
          value={value}
          secureTextEntry={isSecure}
          style={[{ paddingRight: 40 }, props.style]}
        />
        <Pressable 
          onPress={() => setIsSecure(!isSecure)} 
          style={styles.iconContainer}
          accessibilityRole="button"
          accessibilityLabel={isSecure ? "Show password" : "Hide password"}
        >
          {isSecure ? (
            <Eye size={20} color={theme.colors.textSecondary} />
          ) : (
            <EyeOff size={20} color={theme.colors.textSecondary} />
          )}
        </Pressable>
      </View>

      {showStrength && value.length > 0 && (
        <View style={styles.strengthContainer}>
          <View style={styles.strengthBarBackground}>
            <Animated.View style={[styles.strengthBarFill, strengthBarStyle]} />
          </View>
          <Typography variant="label" color={getStrengthColor()} style={styles.strengthText}>
            {getStrengthText()}
          </Typography>
        </View>
      )}
    </View>
  );
});
PasswordField.displayName = 'PasswordField';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
  },
  iconContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    top: theme.spacing.lg + 2, // align visually with input text
    zIndex: 2,
    padding: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -theme.spacing.sm, // pull up closer to the input
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  strengthBarBackground: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: theme.spacing.sm,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    width: 50,
    textAlign: 'right',
  },
});
