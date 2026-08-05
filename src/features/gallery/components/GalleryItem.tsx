import React from 'react';
import { StyleSheet, Pressable, Dimensions, View } from 'react-native';
import Animated, { SharedValue } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Heart } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { ImageItem } from '../services/galleryService';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { Typography } from '../../../design/components/Typography';
import { useScrollParallax } from '../../../experience/parallax/useScrollParallax';
import { useFavoritesStore } from '../../favorites/store/useFavoritesStore';
import { usePressEffect } from '../../../experience/interactions/usePressEffect';

const { width } = Dimensions.get('window');
const PADDING = 32;
export const GALLERY_ITEM_HEIGHT = width * 1.2;

interface GalleryItemProps {
  item: ImageItem;
  index: number;
  scrollY: SharedValue<number>;
  onPress: (item: ImageItem) => void;
}

export const GalleryItem = React.memo(({ item, index, scrollY, onPress }: GalleryItemProps) => {
  const { theme } = useAppTheme();
  const { animatedStyle: parallaxStyle } = useScrollParallax(scrollY, index, GALLERY_ITEM_HEIGHT + PADDING);
  const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressEffect(0.97);

  const isFavorite = useFavoritesStore((state) => state.isFavorite(item.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <Animated.View style={[styles.container, parallaxStyle]}>
      <Animated.View style={[styles.innerContainer, { backgroundColor: theme.colors.surface }, pressStyle]}>
        <Pressable 
          onPress={() => onPress(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.pressableArea}
          accessibilityRole="imagebutton"
          accessibilityLabel={`Artwork by ${item.author}`}
        >
          <Image
            source={item.download_url}
            placeholder={item.thumbnailUrl}
            style={styles.image}
            contentFit="cover"
            transition={500}
            cachePolicy="memory-disk"
          />

          <View style={styles.overlayBottom}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.infoContainer}>
              <View style={styles.textContainer}>
                <Typography variant="body" weight="bold" color="#FFFFFF" numberOfLines={1}>
                  {item.author}
                </Typography>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                  ID: {item.id}
                </Typography>
              </View>

              <Pressable 
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(item);
                }}
                style={styles.favoriteButton}
                accessibilityRole="button"
                accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
                hitSlop={16}
              >
                <Heart 
                  size={24} 
                  color={isFavorite ? theme.colors.accent : '#FFFFFF'}
                  fill={isFavorite ? theme.colors.accent : 'transparent'}
                />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}, (prev, next) => prev.item.id === next.item.id && prev.index === next.index);

const styles = StyleSheet.create({
  container: {
    width: width - PADDING * 2,
    height: GALLERY_ITEM_HEIGHT,
    alignSelf: 'center',
    marginBottom: PADDING,
  },
  innerContainer: {
    flex: 1,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 28,
    elevation: 10,
  },
  pressableArea: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayBottom: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  favoriteButton: {
    padding: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  }
});
