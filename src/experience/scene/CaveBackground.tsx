import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Rect, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { useAnimatedStyle, interpolate, SharedValue, AnimatedStyle } from 'react-native-reanimated';
import { ViewStyle } from 'react-native';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { generateRidgePath, generateSpikes, spikePath } from './caveGeometry';
import { CaveParticles } from './CaveParticles';

const { width, height } = Dimensions.get('window');

interface CaveBackgroundProps {
  drift: SharedValue<number>;
  revealStyle: AnimatedStyle<ViewStyle>;
}

/**
 * CaveBackground
 * "The Cave" — a monumental dark cavern seen from deep inside, rendered as
 * layered SVG rock silhouettes (procedural, deterministic — no image
 * assets or 3D engine needed) with a soft light source glowing from above.
 *
 *   distant wall  →  atmospheric haze  →  midground rock  →  foreground rock  →  dust motes
 *
 * Depth is communicated by composition and scale, not by moving the rocks
 * around — only the ambient light/haze breathes, kept deliberately subtle.
 */
export const CaveBackground = ({ drift, revealStyle }: CaveBackgroundProps) => {
  const { theme } = useAppTheme();

  // Deep, cool cave tones regardless of light/dark app theme — this is a
  // fixed cinematic environment, not something that should flip to a pale
  // "light mode cave". Atmospheric perspective: distant surfaces catch a
  // little ambient light, foreground rock sits in near-black silhouette.
  // The warm accent glow still derives from the theme.
  const wallColor = '#17131A';
  const midColor = '#120F13';
  const foreColor = '#060508';
  const glowColor = theme.colors.accent;

  const distantWall = useMemo(
    () => generateRidgePath({ width, height, edge: 'top', amplitude: 14, segments: 10, baseline: 0.1, seed: 11 }),
    []
  );

  const midSpikesTop = useMemo(() => generateSpikes(width, 6, 30, 70, 21), []);
  const midPath = useMemo(
    () => midSpikesTop.map((s) => spikePath(s, 'top', height * 0.06)).join(' '),
    [midSpikesTop]
  );

  const foreSpikesBottomLeft = useMemo(() => generateSpikes(width * 0.5, 3, 90, 160, 37), []);
  const foreSpikesBottomRight = useMemo(() => generateSpikes(width * 0.5, 3, 90, 160, 53), []);
  const forePathLeft = useMemo(
    () => foreSpikesBottomLeft.map((s) => spikePath(s, 'bottom', height)).join(' '),
    [foreSpikesBottomLeft]
  );
  const forePathRight = useMemo(
    () =>
      foreSpikesBottomRight
        .map((s) => spikePath({ ...s, x: s.x + width * 0.5 }, 'bottom', height))
        .join(' '),
    [foreSpikesBottomRight]
  );

  const hazeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(drift.value, [0, 0.5, 1], [0.14, 0.26, 0.14]),
    transform: [{ scale: interpolate(drift.value, [0, 1], [1, 1.06]) }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, revealStyle]} pointerEvents="none">
      {/* Base cavern fill */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#08070A' }]} />

      {/* Soft light source, entering from above/behind */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="caveLight" cx="50%" cy="6%" r="65%">
            <Stop offset="0%" stopColor={glowColor} stopOpacity={0.28} />
            <Stop offset="40%" stopColor={glowColor} stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#08070A" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#caveLight)" />
      </Svg>

      {/* Atmospheric haze — the only continuously-breathing layer */}
      <Animated.View style={[styles.hazeWrap, hazeStyle]}>
        <Svg width={width} height={height * 0.6} style={StyleSheet.absoluteFill}>
          <Defs>
            <RadialGradient id="haze" cx="50%" cy="0%" r="80%">
              <Stop offset="0%" stopColor="#FDFBF7" stopOpacity={0.16} />
              <Stop offset="100%" stopColor="#FDFBF7" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect x={0} y={0} width={width} height={height * 0.6} fill="url(#haze)" />
        </Svg>
      </Animated.View>

      {/* Distant cave wall */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={distantWall} fill={wallColor} opacity={0.9} />
      </Svg>

      {/* Midground rock formations — rim-lit along the top edge */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={midPath} fill={midColor} stroke={glowColor} strokeOpacity={0.18} strokeWidth={1} opacity={0.92} />
      </Svg>

      {/* Foreground rock silhouettes — frame the cave mouth */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={forePathLeft} fill={foreColor} />
        <Path d={forePathRight} fill={foreColor} />
      </Svg>

      <CaveParticles drift={drift} color={glowColor} />

      {/* Vignette — darkens the edges so the emerging UI stays the focal point */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="vignette" cx="50%" cy="45%" r="75%">
            <Stop offset="55%" stopColor="#000000" stopOpacity={0} />
            <Stop offset="100%" stopColor="#000000" stopOpacity={0.55} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  hazeWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
  },
});
