import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
  useReducedMotion,
  Easing,
} from 'react-native-reanimated';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { useAppTheme } from '../../core/theme/ThemeProvider';

/**
 * AuthTransitionOverlay
 * A brief themed veil that masks the instant Auth→App navigator swap on
 * login/signup, so it doesn't feel like a hard cut — without becoming a
 * production. Deliberately simple: no scene content, no camera language,
 * just a fast fade (~260ms), per the design system's directive to avoid
 * the old cave→mountain cinematic transition.
 *
 * Auth state itself is never gated on this — see useAuthStore.login, which
 * sets isAuthenticated immediately. This overlay is purely visual and
 * self-clears on a failsafe even if its own animation callback never fires.
 */
export const AuthTransitionOverlay = () => {
  const isPortalActive = useAuthStore((state) => state.isPortalActive);
  const setPortalActive = useAuthStore((state) => state.setPortalActive);
  const { theme } = useAppTheme();
  const reducedMotion = useReducedMotion();

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!isPortalActive) {
      progress.value = 0;
      return;
    }

    const duration = reducedMotion ? 160 : 260;

    progress.value = withSequence(
      withTiming(1, { duration: duration * 0.4, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: duration * 0.6, easing: Easing.in(Easing.cubic) }, (finished) => {
        'worklet';
        if (finished) {
          runOnJS(setPortalActive)(false);
        }
      })
    );

    const failsafe = setTimeout(() => setPortalActive(false), duration + 800);
    return () => clearTimeout(failsafe);
  }, [isPortalActive, reducedMotion]);

  const style = useAnimatedStyle(() => ({ opacity: progress.value }));

  if (!isPortalActive) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[StyleSheet.absoluteFill, styles.root, { backgroundColor: theme.colors.background }, style]}
    />
  );
};

const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
  },
});
