import React, { useEffect, useCallback } from 'react';
import { Modal, StyleSheet, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { X, Heart, Download, Share, CheckCircle2 } from 'lucide-react-native';
import { Typography } from '../../../design/components/Typography';
import { theme } from '../../../core/theme/theme';
import { ImageItem } from '../services/galleryService';
import { useArtworkController } from '../controllers/useArtworkController';
import { useToastStore } from '../../../design/components/Toast';
import { usePressEffect } from '../../../experience/interactions/usePressEffect';

interface ArtworkViewerProps {
  visible: boolean;
  image: ImageItem | null;
  onClose: () => void;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const IconButton = ({ icon: Icon, onPress, color, fill = 'none' }: any) => {
  const { animatedStyle, onPressIn, onPressOut } = usePressEffect(0.85);
  return (
    <Animated.View style={animatedStyle}>
      <GestureDetector gesture={Gesture.Tap().onEnd(() => runOnJS(onPress)())}>
        <View style={styles.iconButton}>
          <Icon color={color} fill={fill} size={28} />
        </View>
      </GestureDetector>
    </Animated.View>
  );
};

export const ArtworkViewer = ({ visible, image, onClose }: ArtworkViewerProps) => {
  const showToast = useToastStore(state => state.showToast);
  
  const {
    controlsVisible,
    toggleControls,
    isFavorite,
    handleToggleFavorite,
    isDownloading,
    downloadImage,
    shareImage
  } = useArtworkController(image);

  // Gesture values
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Swipe to dismiss
  const swipeTranslateY = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  // Reset values when opened
  useEffect(() => {
    if (visible) {
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTranslateX.value = 0;
      savedTranslateY.value = 0;
      swipeTranslateY.value = 0;
      isSwiping.value = false;
    }
  }, [visible]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Gestures
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, savedScale.value * e.scale);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1.1) {
        // Snap back
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = savedTranslateX.value + e.translationX;
        translateY.value = savedTranslateY.value + e.translationY;
      } else {
        // Swipe to dismiss logic
        isSwiping.value = true;
        swipeTranslateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
      
      if (isSwiping.value) {
        if (swipeTranslateY.value > 150) {
          runOnJS(handleClose)();
        } else {
          swipeTranslateY.value = withSpring(0);
        }
        isSwiping.value = false;
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const singleTap = Gesture.Tap()
    .onEnd(() => {
      runOnJS(toggleControls)();
    });

  // Combine gestures
  const composed = Gesture.Simultaneous(pinch, pan);
  const taps = Gesture.Exclusive(doubleTap, singleTap);
  const allGestures = Gesture.Simultaneous(taps, composed);

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const swipeScale = interpolate(
      Math.abs(swipeTranslateY.value),
      [0, 300],
      [1, 0.85],
      Extrapolation.CLAMP
    );
    const totalScale = scale.value * swipeScale;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + swipeTranslateY.value },
        { scale: totalScale }
      ]
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.abs(swipeTranslateY.value),
      [0, 300],
      [1, 0.4],
      Extrapolation.CLAMP
    );
    return {
      backgroundColor: `rgba(0,0,0,${opacity})`
    };
  });

  if (!image) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={[styles.container, backgroundAnimatedStyle]}>
          
          <GestureDetector gesture={allGestures}>
            <Animated.View style={[styles.imageWrapper, imageAnimatedStyle]}>
              <AnimatedImage
                source={image.download_url}
                placeholder={image.thumbnailUrl} // Progressive loading
                style={styles.image}
                contentFit="contain"
                transition={300}
              />
            </Animated.View>
          </GestureDetector>

          {/* Chrome Overlay */}
          {controlsVisible && (
            <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)} style={StyleSheet.absoluteFill} pointerEvents="box-none">
              
              {/* Header */}
              <AnimatedBlurView intensity={40} tint="dark" style={styles.header}>
                <IconButton icon={X} onPress={handleClose} color={theme.colors.surface} />
                <View style={styles.actions}>
                  {isDownloading ? (
                    <View style={styles.iconButton}>
                      <ActivityIndicator color={theme.colors.surface} />
                    </View>
                  ) : (
                    <IconButton 
                      icon={Download} 
                      onPress={() => downloadImage(
                        () => showToast('Saved to Gallery', 'success'),
                        (msg) => showToast(msg, 'error')
                      )} 
                      color={theme.colors.surface} 
                    />
                  )}
                  <IconButton 
                    icon={Share} 
                    onPress={() => shareImage((msg) => showToast(msg, 'error'))} 
                    color={theme.colors.surface} 
                  />
                  <IconButton 
                    icon={Heart} 
                    onPress={handleToggleFavorite} 
                    color={isFavorite ? theme.colors.error : theme.colors.surface} 
                    fill={isFavorite ? theme.colors.error : 'transparent'} 
                  />
                </View>
              </AnimatedBlurView>

              {/* Footer */}
              <AnimatedBlurView intensity={40} tint="dark" style={styles.footer}>
                <Typography variant="headingM" weight="bold" color={theme.colors.surface}>
                  {image.author}
                </Typography>
                <View style={styles.metadata}>
                  <Typography variant="caption" color={theme.colors.surfaceGlass}>
                    ID: {image.id}
                  </Typography>
                  <Typography variant="caption" color={theme.colors.surfaceGlass}>
                    •
                  </Typography>
                  <Typography variant="caption" color={theme.colors.surfaceGlass}>
                    {image.width} × {image.height}
                  </Typography>
                </View>
              </AnimatedBlurView>
              
            </Animated.View>
          )}

        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconButton: {
    padding: theme.spacing.xs,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingTop: 20,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  }
});
