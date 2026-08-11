import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOutDown, Layout, useReducedMotion } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { ImageItem } from '../../gallery/services/galleryService';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { Typography } from '../../../design/components/Typography';
import { AnimatedGlassCard } from '../../../design/components/AnimatedGlassCard';
import { AnimatedFavoriteButton } from '../../../design/components/AnimatedFavoriteButton';
import { useStaggerEntrance } from '../../../experience/interactions/useStaggerEntrance';
import { GRID_CARD_WIDTH } from '../../gallery/components/GalleryItem';

const CARD_HEIGHT = GRID_CARD_WIDTH * 1.3;

interface FavoriteItemProps {
  item: ImageItem;
  index: number;
  onPress: (item: ImageItem) => void;
  onRemove: (item: ImageItem) => void;
}

/**
 * FavoriteItem — the same AnimatedGlassCard/AnimatedFavoriteButton
 * primitives as GalleryItem, at the exact same card footprint, so the two
 * grids feel like one coherent system rather than two bespoke ones.
 */
export const FavoriteItem = React.memo(({ item, index, onPress, onRemove }: FavoriteItemProps) => {
  const { theme } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const entering = useStaggerEntrance(index);

  return (
    <Animated.View
      layout={reducedMotion ? undefined : Layout.springify().damping(20).stiffness(200)}
      entering={entering}
      exiting={FadeOutDown.duration(theme.motion.durations.normal)}
      style={styles.wrapper}
    >
      <AnimatedGlassCard
        onPress={() => onPress(item)}
        style={styles.card}
        accessibilityLabel={`Favorite artwork by ${item.author}`}
        accessibilityRole="imagebutton"
      >
        <Image
          source={item.thumbnailUrl}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
        />
        <View style={styles.favoriteWrap}>
          <AnimatedFavoriteButton isFavorite onToggle={() => onRemove(item)} />
        </View>
      </AnimatedGlassCard>

      <View style={styles.caption}>
        <Typography variant="caption" weight="bold" numberOfLines={1}>
          {item.author}
        </Typography>
        <Typography variant="micro" color={theme.colors.textTertiary}>
          ID: {item.id}
        </Typography>
      </View>
    </Animated.View>
  );
}, (prev, next) => prev.item.id === next.item.id);

const styles = StyleSheet.create({
  wrapper: {
    width: GRID_CARD_WIDTH,
    marginBottom: 16,
  },
  card: {
    width: GRID_CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  favoriteWrap: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  caption: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
});
