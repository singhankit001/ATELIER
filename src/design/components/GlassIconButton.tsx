import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import { BlurView } from 'expo-blur';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, ZoomIn } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import { useIlluminatedPress } from '../../experience/interactions/useIlluminatedPress';
import { useAppTheme } from '../../core/theme/ThemeProvider';

export interface GlassIconButtonProps {
  icon: React.ComponentType<{ color?: string; size?: number; fill?: string }>;
  onPress: () => void;
  accessibilityLabel: string;
  color?: string;
  fill?: string;
  loading?: boolean;
  /** Briefly shows a checkmark in place of the icon — e.g. "Download → Saving… → Saved". */
  success?: boolean;
  disabled?: boolean;
  tint?: 'light' | 'dark';
}

/**
 * GlassIconButton
 * The premium floating glass control used for artwork actions (share,
 * download, favorite, close). Translucent material, thin border, soft
 * shadow that warms into a gold illumination on press — all driven by
 * useIlluminatedPress on the UI thread, no JS-thread animation loop.
 */
export const GlassIconButton = ({
  icon: Icon,
  onPress,
  accessibilityLabel,
  color,
  fill = 'none',
  loading = false,
  success = false,
  disabled = false,
  tint = 'dark',
}: GlassIconButtonProps) => {
  const { theme } = useAppTheme();
  const { animatedStyle, glowStyle, onPressIn, onPressOut } = useIlluminatedPress(0.88);
  const resolvedColor = color ?? theme.colors.surface;
  const isInteractive = !disabled && !loading;

  const tap = Gesture.Tap()
    .enabled(isInteractive)
    .onBegin(() => {
      onPressIn();
    })
    .onFinalize(() => {
      onPressOut();
    })
    .onEnd(() => {
      runOnJS(onPress)();
    });

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.button,
          { shadowColor: theme.colors.accent, borderColor: 'rgba(255,255,255,0.22)' },
          animatedStyle,
          disabled && styles.disabled,
        ]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled: disabled || loading, busy: loading }}
      >
        <BlurView intensity={tint === 'dark' ? 35 : 55} tint={tint} style={StyleSheet.absoluteFill} />
        <Animated.View pointerEvents="none" style={[styles.glow, { backgroundColor: theme.colors.accent }, glowStyle]} />
        {loading ? (
          <ActivityIndicator color={resolvedColor} size="small" />
        ) : success ? (
          <Animated.View entering={ZoomIn.duration(theme.motion.durations.fast)}>
            <CheckCircle2 color={theme.colors.success} size={22} />
          </Animated.View>
        ) : (
          <Icon color={resolvedColor} fill={fill} size={22} />
        )}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  glow: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
  disabled: {
    opacity: 0.5,
  },
});
