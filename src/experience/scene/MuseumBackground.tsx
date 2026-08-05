import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useAppTheme } from '../../core/theme/ThemeProvider';

const { width, height } = Dimensions.get('window');

interface MuseumBackgroundProps {
  children?: React.ReactNode;
  showArch?: boolean;
  diveAnim?: any;
}

import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';

export const MuseumBackground = ({ children, showArch = false }: MuseumBackgroundProps) => {
  const { theme, isDark } = useAppTheme();
  const lightProgress = useSharedValue(0);

  React.useEffect(() => {
    lightProgress.value = withRepeat(
      withTiming(1, { duration: 8000 }),
      -1,
      true
    );
  }, []);

  const blob1Style = useAnimatedStyle(() => {
    const translateX = interpolate(lightProgress.value, [0, 1], [-30, 40]);
    const translateY = interpolate(lightProgress.value, [0, 1], [-20, 30]);
    const scale = interpolate(lightProgress.value, [0, 0.5, 1], [1, 1.15, 0.95]);
    return { transform: [{ translateX }, { translateY }, { scale }] };
  });

  const blob2Style = useAnimatedStyle(() => {
    const translateX = interpolate(lightProgress.value, [0, 1], [40, -30]);
    const translateY = interpolate(lightProgress.value, [0, 1], [30, -20]);
    const scale = interpolate(lightProgress.value, [0, 0.5, 1], [0.9, 1.1, 1]);
    return { transform: [{ translateX }, { translateY }, { scale }] };
  });

  // Dark mode blob tints are subtle warm white instead of ivory
  const blob2Color = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(244, 240, 234, 0.5)';

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Texture / Linen Layer */}
      <View style={[styles.textureLayer, { backgroundColor: theme.colors.background }]} />

      {/* Moving Ambient Light Blobs */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Animated.View style={[styles.lightBlob1, blob1Style]} />
        <Animated.View style={[styles.lightBlob2, { backgroundColor: blob2Color }, blob2Style]} />
      </View>
      
      {/* Architectural Arch Layer */}
      {showArch && (
        <View style={styles.archWrapper} pointerEvents="none">
          <View style={styles.archGlow} />
          <View style={[
            styles.arch,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.borderGlass,
            }
          ]} />
        </View>
      )}

      {/* Ambient Vignette Layer */}
      <View style={styles.lightingLayer} pointerEvents="none" />

      {/* Foreground Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textureLayer: {
    ...StyleSheet.absoluteFill,
    opacity: 0.95,
  },
  lightBlob1: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.1,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(184, 134, 11, 0.07)',
  },
  lightBlob2: {
    position: 'absolute',
    bottom: height * 0.2,
    right: width * 0.05,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
  },
  lightingLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  archWrapper: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  archGlow: {
    position: 'absolute',
    width: width * 0.94,
    height: height * 0.90,
    borderTopLeftRadius: width * 0.47,
    borderTopRightRadius: width * 0.47,
    backgroundColor: 'rgba(184, 134, 11, 0.06)',
    bottom: 0,
  },
  arch: {
    width: width * 0.90,
    height: height * 0.88,
    borderTopLeftRadius: width * 0.45,
    borderTopRightRadius: width * 0.45,
    borderWidth: 1,
    bottom: 0,
  },
  content: {
    flex: 1,
    zIndex: 10,
  }
});
