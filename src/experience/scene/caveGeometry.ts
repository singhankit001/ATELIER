/**
 * caveGeometry
 * Pure, deterministic generators for the cave's rock-silhouette SVG paths.
 * No randomness across renders — same inputs always produce the same
 * shape, so layers don't "pop" between re-renders or reloads.
 */

// Deterministic pseudo-random in [0, 1) from a numeric seed (sine-hash trick —
// avoids pulling in a PRNG dependency for what is purely decorative geometry).
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

interface RidgeOptions {
  width: number;
  height: number;
  edge: 'top' | 'bottom';
  amplitude: number;
  segments: number;
  baseline: number; // 0..1 fraction of height where the flat baseline sits
  seed: number;
}

/** A jagged horizontal ridge silhouette, hanging from (or rising to) one edge. */
export const generateRidgePath = ({ width, height, edge, amplitude, segments, baseline, seed }: RidgeOptions): string => {
  const baseY = edge === 'top' ? height * baseline : height * (1 - baseline);
  const step = width / segments;
  const points: string[] = [];

  for (let i = 0; i <= segments; i++) {
    const x = i * step;
    const jitter = (seededRandom(seed + i * 1.37) - 0.5) * 2 * amplitude;
    const y = baseY + jitter;
    points.push(`L${x.toFixed(1)},${y.toFixed(1)}`);
  }

  const start = edge === 'top' ? `M0,0 L0,${baseY.toFixed(1)}` : `M0,${height} L0,${baseY.toFixed(1)}`;
  const end = edge === 'top' ? `L${width},0 Z` : `L${width},${height} Z`;
  return [start, ...points, end].join(' ');
};

export interface RockSpike {
  x: number;
  baseWidth: number;
  length: number;
}

/** Deterministic set of stalactite/stalagmite spikes across a width. */
export const generateSpikes = (
  width: number,
  count: number,
  minLength: number,
  maxLength: number,
  seed: number
): RockSpike[] => {
  const step = width / count;
  const spikes: RockSpike[] = [];

  for (let i = 0; i < count; i++) {
    const jitterX = (seededRandom(seed + i * 3.11) - 0.5) * step * 0.5;
    const x = i * step + step / 2 + jitterX;
    const length = minLength + seededRandom(seed + i * 7.73) * (maxLength - minLength);
    const baseWidth = step * (0.4 + seededRandom(seed + i * 5.29) * 0.35);
    spikes.push({ x, baseWidth, length });
  }

  return spikes;
};

/** SVG path for a single spike, hanging from (edge='top') or rising from (edge='bottom') originY. */
export const spikePath = (spike: RockSpike, edge: 'top' | 'bottom', originY: number): string => {
  const { x, baseWidth, length } = spike;
  const tipY = edge === 'top' ? originY + length : originY - length;
  return `M${(x - baseWidth / 2).toFixed(1)},${originY} L${x.toFixed(1)},${tipY.toFixed(1)} L${(x + baseWidth / 2).toFixed(1)},${originY} Z`;
};
