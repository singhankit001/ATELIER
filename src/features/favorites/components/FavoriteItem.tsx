import React from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, Layout } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { HeartOff } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { ImageItem } from '../../gallery/services/galleryService';
import { theme } from '../../../core/theme/theme';
import { Typography } from '../../../design/components/Typography';
import { usePressEffect } from '../../../experience/interactions/usePressEffect';

interface FavoriteItemProps {
  item: ImageItem;
  index: number;
  width: number;
  onPress: (item: ImageItem) => void;
  onRemove: (item: ImageItem) => void;
}

export const FavoriteItem = React.memo(({ item, index, width, onPress, onRemove }: FavoriteItemProps) => {
  const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressEffect(0.96);

  return (
    <Animated.View 
      layout={Layout.springify().damping(16).stiffness(150)}
      entering={FadeInDown.delay(index * 50).duration(400)}
      exiting={FadeOutDown.duration(300)}
      style={[styles.container, { width, height: width * 1.5 }]}
    >
      <Animated.View style={[styles.innerContainer, pressStyle]}>
        <Pressable 
          onPress={() => onPress(item)}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={styles.pressableArea}
          accessibilityRole="imagebutton"
          accessibilityLabel={`Favorite artwork by ${item.author}`}
        >
          <Image
            source={item.thumbnailUrl} // using thumbnail for the grid is optimal
            style={styles.image}
            contentFit="cover"
            transition={300}
            cachePolicy="memory-disk"
          />

          <View style={styles.overlayBottom}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.infoContainer}>
              <Typography 
                variant="caption" 
                weight="bold" 
                color={theme.colors.primary} 
                numberOfLines={1}
                style={{ flex: 1, marginRight: theme.spacing.sm }}
              >
                {item.author}
              </Typography>

              <Pressable 
                onPress={(e) => {
                  e.stopPropagation();
                  onRemove(item);
                }}
                style={styles.removeButton}
                accessibilityRole="button"
                accessibilityLabel="Remove from favorites"
                hitSlop={12}
              >
                <HeartOff size={16} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}, (prev, next) => prev.item.id === next.item.id && prev.width === next.width);

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  innerContainer: {
    ...StyleSheet.absoluteFill,
    borderRadius: theme.borderRadii.lg,
    overflow: 'hidden',
    ...theme.elevation.card,
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
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.sm,
    overflow: 'hidden',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeButton: {
    padding: theme.spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadii.full,
  }
});
