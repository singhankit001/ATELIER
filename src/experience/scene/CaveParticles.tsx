import React, { useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const PARTICLE_COUNT = 10;

const seeded = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

interface Particle {
  x: number;
  y: number;
  size: number;
  amplitude: number;
  baseOpacity: number;
}

const useParticleField = (): Particle[] =>
  useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        x: seeded(i * 3.1 + 1) * width,
        y: height * 0.14 + seeded(i * 5.7 + 2) * height * 0.5,
        size: 1.5 + seeded(i * 7.3 + 3) * 2,
        amplitude: 6 + seeded(i * 9.9 + 4) * 12,
        baseOpacity: 0.12 + seeded(i * 11.1 + 5) * 0.28,
      })),
    []
  );

/** A single drifting dust mote — like light-shaft particles inside a cave. */
const Mote = ({ particle, drift, color }: { particle: Particle; drift: SharedValue<number>; color: string }) => {
  const style = useAnimatedStyle(() => {
    const t = drift.value; // slow 0↔1↔0 ping-pong shared across every mote
    const translateY = interpolate(t, [0, 1], [-particle.amplitude, particle.amplitude]);
    const opacity = interpolate(t, [0, 0.5, 1], [particle.baseOpacity * 0.5, particle.baseOpacity, particle.baseOpacity * 0.5]);
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.mote,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

export const CaveParticles = ({ drift, color }: { drift: SharedValue<number>; color: string }) => {
  const particles = useParticleField();
  return (
    <>
      {particles.map((particle, i) => (
        <Mote key={i} particle={particle} drift={drift} color={color} />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  mote: {
    position: 'absolute',
  },
});
