import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { ImageItem } from '../services/galleryService';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { Typography } from '../../../design/components/Typography';
import { AnimatedGlassCard } from '../../../design/components/AnimatedGlassCard';
import { AnimatedFavoriteButton } from '../../../design/components/AnimatedFavoriteButton';
import { useStaggerEntrance } from '../../../experience/interactions/useStaggerEntrance';
import { useFavoritesStore } from '../../favorites/store/useFavoritesStore';

const { width } = Dimensions.get('window');
const GRID_PADDING = 16;
const GRID_GAP = 16;
export const GRID_CARD_WIDTH = (width - GRID_PADDING * 2 - GRID_GAP) / 2;
// One deliberate ratio for every artwork card in the app (gallery and
// favorites both import this rather than each picking their own) — 4:5,
// the classic editorial portrait crop.
export const GRID_CARD_HEIGHT = GRID_CARD_WIDTH * 1.25;

interface GalleryItemProps {
  item: ImageItem;
  index: number;
  onPress: (item: ImageItem) => void;
}

export const GalleryItem = React.memo(({ item, index, onPress }: GalleryItemProps) => {
  const { theme } = useAppTheme();
  const isFavorite = useFavoritesStore((state) => state.isFavorite(item.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const entering = useStaggerEntrance(index);

  return (
    <Animated.View
      entering={entering}
      style={styles.wrapper}
    >
      <AnimatedGlassCard
        onPress={() => onPress(item)}
        style={styles.card}
        accessibilityLabel={`Artwork by ${item.author}`}
        accessibilityRole="imagebutton"
      >
        <Image
          source={item.thumbnailUrl}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={400}
          cachePolicy="memory-disk"
        />
        <View style={styles.favoriteWrap}>
          <AnimatedFavoriteButton isFavorite={isFavorite} onToggle={() => toggleFavorite(item)} />
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
}, (prev, next) => prev.item.id === next.item.id && prev.index === next.index);

const styles = StyleSheet.create({
  wrapper: {
    width: GRID_CARD_WIDTH,
    marginBottom: GRID_GAP,
  },
  card: {
    width: GRID_CARD_WIDTH,
    height: GRID_CARD_HEIGHT,
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
