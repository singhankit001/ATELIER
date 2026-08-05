import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolate 
} from 'react-native-reanimated';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { theme } from '../../core/theme/theme';

const { width, height } = Dimensions.get('window');

export const PortalOverlay = () => {
  const isPortalActive = useAuthStore((state) => state.isPortalActive);
  const portalProgress = useSharedValue(0);

  useEffect(() => {
    if (isPortalActive) {
      portalProgress.value = withTiming(1, { duration: 600 });
    } else {
      portalProgress.value = withTiming(0, { duration: 400 });
    }
  }, [isPortalActive]);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(portalProgress.value, [0, 1], [0.8, 4]);
    const opacity = interpolate(portalProgress.value, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View 
      pointerEvents="none" 
      style={[styles.overlay, animatedStyle]}
    >
      <Animated.View style={styles.portalArch} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portalArch: {
    width: width * 0.8,
    height: height * 0.6,
    borderTopLeftRadius: width * 0.4,
    borderTopRightRadius: width * 0.4,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    ...theme.elevation.modal,
  },
});
