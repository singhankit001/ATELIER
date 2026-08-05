import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { theme as staticTheme } from '../../core/theme/theme';

export interface TypographyProps extends TextProps {
  variant?: keyof typeof staticTheme.typography.size;
  color?: string;
  weight?: 'regular' | 'medium' | 'bold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

/**
 * Shared Typography Component
 * Reads text color from reactive theme context so dark mode works correctly.
 */
export const Typography = ({
  variant = 'body',
  color,
  weight = 'regular',
  align = 'left',
  style,
  children,
  ...props
}: TypographyProps) => {
  const { theme } = useAppTheme();

  // Use caller-provided color, else fall back to the reactive theme textPrimary
  const resolvedColor = color ?? theme.colors.textPrimary;

  return (
    <Text
      style={[
        {
          fontSize: theme.typography.size[variant],
          color: resolvedColor,
          fontFamily: theme.typography.fontFamily[weight],
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};
