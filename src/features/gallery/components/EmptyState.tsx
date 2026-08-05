import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ImageOff, RotateCcw } from 'lucide-react-native';
import { Typography } from '../../../design/components/Typography';
import { Button } from '../../../design/components/Button';
import { theme } from '../../../core/theme/theme';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface EmptyStateProps {
  title: string;
  message: string;
  onReset?: () => void;
  resetLabel?: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({ 
  title, 
  message, 
  onReset, 
  resetLabel = 'Reset',
  icon = <ImageOff size={48} color={theme.colors.textSecondary} />
}: EmptyStateProps) => {
  return (
    <Animated.View 
      entering={FadeInDown.duration(theme.motion.durations.medium)}
      style={styles.container}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Typography variant="headingL" weight="bold" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="body" color={theme.colors.textSecondary} align="center" style={styles.message}>
        {message}
      </Typography>
      
      {onReset && (
        <Button 
          label={resetLabel}
          onPress={onReset}
          variant="secondary"
          icon={<RotateCcw size={20} color={theme.colors.textSecondary} />}
          style={styles.button}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.huge * 2,
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    opacity: 0.8,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  message: {
    marginBottom: theme.spacing.xl,
    maxWidth: 280,
  },
  button: {
    minWidth: 160,
  }
});
