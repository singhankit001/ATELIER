import { colors, spacing, typography, elevation, borderRadii, springs, motion } from './tokens';

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
};

export type Theme = typeof theme;
