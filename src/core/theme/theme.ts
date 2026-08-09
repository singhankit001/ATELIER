import { colors, spacing, typography, elevation, borderRadii, springs, motion, glassLevels } from './tokens';

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
};

export type Theme = typeof theme;
