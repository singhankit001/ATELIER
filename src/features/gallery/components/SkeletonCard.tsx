import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSpring,
  interpolateColor 
} from 'react-native-reanimated';
import { theme } from '../../../core/theme/theme';
import { GALLERY_ITEM_HEIGHT } from './GalleryItem';

const { width } = Dimensions.get('window');
const PADDING = theme.spacing.xl;

export const SkeletonCard = () => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSpring(1, theme.springs.gentle),
      -1,
      true
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        shimmer.value,
        [0, 1],
        [theme.colors.surface, theme.colors.surfaceHighlight]
      ),
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {/* Simulate the glass footer for author info */}
      <View style={styles.footer}>
        <Animated.View style={[styles.textLine, styles.titleWidth, animatedStyle]} />
        <Animated.View style={[styles.textLine, styles.subtitleWidth, animatedStyle]} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - PADDING * 2,
    height: GALLERY_ITEM_HEIGHT,
    alignSelf: 'center',
    marginBottom: PADDING,
    borderRadius: theme.borderRadii.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    ...theme.elevation.card,
  },
  footer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  textLine: {
    height: 14,
    borderRadius: 7,
    marginBottom: theme.spacing.xs,
  },
  titleWidth: {
    width: '60%',
  },
  subtitleWidth: {
    width: '40%',
  }
});
