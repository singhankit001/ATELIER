import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  interpolateColor,
  useReducedMotion,
} from 'react-native-reanimated';
import { theme } from '../../../core/theme/theme';
import { GRID_CARD_WIDTH } from './GalleryItem';

const GRID_CARD_HEIGHT = GRID_CARD_WIDTH * 1.3;

/** A single grid-cell-sized skeleton with a subtle shimmer — mirrors GalleryItem's footprint exactly. */
export const SkeletonCard = () => {
  const reducedMotion = useReducedMotion();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;
    shimmer.value = withRepeat(withSpring(1, theme.springs.gentle), -1, true);
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      shimmer.value,
      [0, 1],
      [theme.colors.surface, theme.colors.surfaceHighlight]
    ),
  }));

  return <Animated.View style={[styles.container, animatedStyle]} />;
};

/** A full 2-column grid of skeleton cells, filling the gallery's loading state. */
export const SkeletonGrid = ({ rows = 3 }: { rows?: number }) => (
  <View style={styles.grid}>
    {Array.from({ length: rows * 2 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  container: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_HEIGHT,
    marginBottom: 16,
    borderRadius: theme.borderRadii.lg,
    overflow: 'hidden',
    ...theme.elevation.card,
  },
});
