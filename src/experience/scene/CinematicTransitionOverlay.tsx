import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { CaveBackground } from './CaveBackground';
import { MountainBackground } from './MountainBackground';
import { useCinematicTransition } from './useCinematicTransition';

/**
 * CinematicTransitionOverlay
 * The "movie transition" that plays once, right after a successful login
 * or signup — cave (the same one the user was just looking at) dissolves
 * forward into the mountain landscape, then the whole overlay fades away
 * to reveal the gallery that was already mounted underneath it.
 *
 * Rendered once at the app root (see RootNavigator), fully unmounted
 * whenever idle — it costs nothing outside the ~2s it's actually playing.
 */
export const CinematicTransitionOverlay = () => {
  const { active, caveStyle, mountainStyle, glowStyle, overlayStyle } = useCinematicTransition();

  // A settled, non-breathing cave — this isn't the login screen, it's the
  // opening beat of the transition, so no ambient drift or particles.
  const staticDrift = useSharedValue(0.5);
  const fullyRevealed = useAnimatedStyle(() => ({ opacity: 1 }));

  if (!active) return null;

  return (
    <Animated.View
      pointerEvents="auto"
      style={[StyleSheet.absoluteFill, styles.root, overlayStyle]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, caveStyle]}>
        <CaveBackground drift={staticDrift} revealStyle={fullyRevealed} />
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, mountainStyle]}>
        <MountainBackground />
      </Animated.View>

      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glow, glowStyle]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    zIndex: 9999,
  },
  glow: {
    backgroundColor: '#FFE8C2',
  },
});
