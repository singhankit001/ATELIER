import React, { useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  SharedValue
} from 'react-native-reanimated';
import { ArrowUp } from 'lucide-react-native';
import { theme } from '../../../core/theme/theme';
import { BlurView } from 'expo-blur';
import { useReducedMotion } from 'react-native-reanimated';

import { usePressEffect } from '../../../experience/interactions/usePressEffect';

interface FloatingActionButtonProps {
  scrollY: SharedValue<number>;
  onPress: () => void;
  showThreshold?: number;
}

export const FloatingActionButton = ({ scrollY, onPress, showThreshold = 800 }: FloatingActionButtonProps) => {
  const shouldReduceMotion = useReducedMotion();
  const { animatedStyle: pressStyle, onPressIn, onPressOut } = usePressEffect(0.88);

  const animatedStyle = useAnimatedStyle(() => {
    const visible = scrollY.value > showThreshold ? 1 : 0;
    const targetScale = shouldReduceMotion ? 1 : visible;
    const targetOpacity = visible;

    return {
      opacity: withSpring(targetOpacity, theme.springs.bouncy),
      transform: [
        { scale: withSpring(targetScale, theme.springs.bouncy) },
        { translateY: withSpring(visible ? 0 : 40, theme.springs.bouncy) }
      ],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle, pressStyle]}>
      <Pressable 
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Scroll to top"
      >
        <BlurView intensity={50} tint="light" style={[StyleSheet.absoluteFill, { borderRadius: theme.borderRadii.full }]} />
        <ArrowUp size={24} color={theme.colors.accent} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...theme.elevation.modal,
    zIndex: 100,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
});
