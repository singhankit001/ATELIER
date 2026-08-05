import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '../../core/theme/theme';
import { Typography } from './Typography';
import { Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';

// Global Toast State
interface ToastState {
  message: string | null;
  type: 'info' | 'error' | 'success';
  showToast: (message: string, type?: 'info' | 'error' | 'success') => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  showToast: (message, type = 'info') => set({ message, type }),
  hideToast: () => set({ message: null }),
}));

export const Toast = () => {
  const { message, type, hideToast } = useToastStore();
  const insets = useSafeAreaInsets();
  
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (message) {
      translateY.value = withSpring(insets.top + theme.spacing.md, theme.springs.bouncy);
      opacity.value = withTiming(1, { duration: theme.motion.durations.fast });
      
      // Progress bar animation
      progress.value = 0;
      progress.value = withTiming(1, { duration: 3000 });

      // Auto dismiss
      opacity.value = withDelay(
        3000,
        withTiming(0, { duration: theme.motion.durations.base }, () => {
          runOnJS(hideToast)();
          translateY.value = -100;
        })
      );
    }
  }, [message, insets.top]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!message) return null;

  const getColors = () => {
    if (type === 'error') return { bg: theme.colors.error, text: theme.colors.surface };
    if (type === 'success') return { bg: theme.colors.success, text: theme.colors.surface };
    return { bg: theme.colors.primary, text: theme.colors.surface };
  };

  const colors = getColors();

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <Animated.View style={[styles.container, containerStyle]}>
        <View style={styles.content}>
          <Info color={theme.colors.textPrimary} size={20} />
          <Typography variant="body" color={theme.colors.textPrimary} style={styles.message}>
            {message}
          </Typography>
        </View>
        <Animated.View style={[styles.progressBar, progressStyle, { backgroundColor: colors.bg }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    alignItems: 'center',
  },
  container: {
    position: 'absolute',
    top: 0,
    width: '90%',
    backgroundColor: theme.colors.surfaceGlass,
    borderRadius: theme.borderRadii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderGlass,
    overflow: 'hidden',
    ...theme.elevation.modal,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  message: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  progressBar: {
    height: 3,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
