import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Svg, { Rect, Path, Defs, RadialGradient, LinearGradient, Stop } from 'react-native-svg';
import { generateRidgePath } from './caveGeometry';
import { palette } from '../../core/theme/tokens';

const { width, height } = Dimensions.get('window');

/**
 * MountainBackground
 * The destination of the cave→mountain journey — a vast landscape lit by a
 * low warm sun. Same procedural-silhouette technique as CaveBackground
 * (deterministic SVG ridges, no image assets, no 3D engine), just a
 * different palette and orientation: ridges rise from the bottom instead
 * of hanging from the top, and the light source sits low near the horizon
 * instead of glowing from above.
 */
export const MountainBackground = () => {
  const distantRidge = useMemo(
    () => generateRidgePath({ width, height, edge: 'bottom', amplitude: 26, segments: 8, baseline: 0.58, seed: 71 }),
    []
  );
  const midRidge = useMemo(
    () => generateRidgePath({ width, height, edge: 'bottom', amplitude: 40, segments: 7, baseline: 0.42, seed: 43 }),
    []
  );
  const foreRidge = useMemo(
    () => generateRidgePath({ width, height, edge: 'bottom', amplitude: 60, segments: 6, baseline: 0.22, seed: 17 }),
    []
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Sky — low warm dawn light */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#241A2E" stopOpacity={1} />
            <Stop offset="45%" stopColor="#6B3B45" stopOpacity={1} />
            <Stop offset="72%" stopColor="#C97A52" stopOpacity={1} />
            <Stop offset="100%" stopColor={palette.champagneGold} stopOpacity={1} />
          </LinearGradient>
          <RadialGradient id="sun" cx="50%" cy="62%" r="30%">
            <Stop offset="0%" stopColor="#FFE8C2" stopOpacity={0.9} />
            <Stop offset="55%" stopColor="#F5C089" stopOpacity={0.35} />
            <Stop offset="100%" stopColor="#F5C089" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#sky)" />
        <Rect x={0} y={0} width={width} height={height} fill="url(#sun)" />
      </Svg>

      {/* Distant hazy peaks */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={distantRidge} fill="#8A7A8C" opacity={0.55} />
      </Svg>

      {/* Midground ridges */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={midRidge} fill="#4E3B49" opacity={0.85} />
      </Svg>

      {/* Foreground terrain — darkest, closest */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Path d={foreRidge} fill="#221A24" opacity={0.98} />
      </Svg>

      {/* Low ground mist */}
      <Svg width={width} height={height * 0.3} style={[StyleSheet.absoluteFill, { top: height * 0.55 }]}>
        <Defs>
          <LinearGradient id="mist" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FDFBF7" stopOpacity={0} />
            <Stop offset="60%" stopColor="#FDFBF7" stopOpacity={0.12} />
            <Stop offset="100%" stopColor="#FDFBF7" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height * 0.3} fill="url(#mist)" />
      </Svg>
    </View>
  );
};
