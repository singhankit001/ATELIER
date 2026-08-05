import { useAnimatedStyle, interpolate, Extrapolation, SharedValue, useReducedMotion } from 'react-native-reanimated';
import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * useScrollParallax
 * Calculates 3D spatial depth, perspective rotation tilt, scale, and opacity for artwork cards based on viewport offset.
 */
export const useScrollParallax = (scrollY: SharedValue<number>, index: number, itemHeight: number) => {
  const reducedMotion = useReducedMotion();
  
  const animatedStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { opacity: 1, transform: [{ scale: 1 }, { translateY: 0 }] };
    }
    
    const itemTop = index * itemHeight;
    const itemCenter = itemTop + itemHeight / 2;
    const scrollCenter = scrollY.value + SCREEN_HEIGHT / 2;

    const distanceFromCenter = Math.abs(scrollCenter - itemCenter);
    const signedDistance = scrollCenter - itemCenter;

    // As distance increases (moves to edges), scale down and fade to simulate spatial 3D depth
    const scale = interpolate(
      distanceFromCenter,
      [0, SCREEN_HEIGHT * 0.4, SCREEN_HEIGHT],
      [1.04, 0.95, 0.82],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      distanceFromCenter,
      [0, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT],
      [1, 0.85, 0.35],
      Extrapolation.CLAMP
    );

    // 3D Perspective Rotation Tilt (subtle 3D rotation as card enters/exits viewport)
    const rotateX = `${interpolate(
      signedDistance,
      [-SCREEN_HEIGHT, 0, SCREEN_HEIGHT],
      [-5, 0, 5],
      Extrapolation.CLAMP
    )}deg`;

    const translateY = interpolate(
      distanceFromCenter,
      [0, SCREEN_HEIGHT],
      [0, 24],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [
        { perspective: 1000 },
        { scale },
        { rotateX },
        { translateY },
      ],
    };
  });

  return { animatedStyle };
};
