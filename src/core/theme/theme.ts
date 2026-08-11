import { colors, spacing, typography, elevation, borderRadii, springs, motion, glassLevels, glow } from './tokens';

/**
 * The unified Theme object.
 * Can be extended for Dark Mode later if needed.
 */
export const theme = {
  colors,
  spacing,
  typography,
  elevation,
  borderRadii,
  springs,
  motion,
  glassLevels,
  glow,
};

export type Theme = typeof theme;
