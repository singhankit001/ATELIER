/**
 * Layer 2 - Design System: Tokens
 * Emphasizes Museum Materials, Architectural Geometry, and Paper Textures.
 * Semantic design tokens only. No hardcoded colors in UI.
 */

// Quiet Luxury Palette — Apple Vision Pro / Arc / Aesop / Museum Grade
export const palette = {
  warmIvory: '#FDFBF7',
  boneWhite: '#F4F0EA',
  linen: '#EBE5DF',
  stoneGray: '#B0A8A0',
  slate: '#78736E',
  deepCharcoal: '#1E1E20',
  graphite: '#161618',
  obsidian: '#0F0E0E',
  bronze: '#B8860B',
  mutedGold: '#D4AF37',
  champagneGold: '#F5E6CC',
  mutedTerracotta: '#C97A6E',
  slateBlue: '#6E859E',
  deepOlive: '#556B2F',
};

export const lightColors = {
  background: palette.warmIvory,
  surface: palette.boneWhite,
  surfaceGlass: 'rgba(244, 240, 234, 0.75)',
  textPrimary: palette.obsidian,
  textSecondary: palette.slate,
  textTertiary: palette.stoneGray,
  primary: palette.deepCharcoal,
  accent: palette.bronze,
  border: palette.linen,
  borderGlass: 'rgba(235, 229, 223, 0.4)',
  error: palette.mutedTerracotta,
  success: palette.deepOlive,
  surfaceHighlight: 'rgba(0, 0, 0, 0.04)',
};

export const darkColors = {
  background: palette.obsidian,
  surface: palette.graphite,
  surfaceGlass: 'rgba(22, 22, 24, 0.78)',
  textPrimary: palette.warmIvory,
  textSecondary: palette.stoneGray,
  textTertiary: palette.slate,
  primary: palette.boneWhite,
  accent: palette.champagneGold,
  border: palette.deepCharcoal,
  borderGlass: 'rgba(45, 43, 42, 0.55)',
  error: '#E0988E',
  success: '#819E53',
  surfaceHighlight: 'rgba(255, 255, 255, 0.08)',
};

// Default static colors (fallback for non-context usage)
export const colors = lightColors;

// 8-point spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,
  massive: 80,
};

// Typography: Museum Signage, Large headings, Strong hierarchy
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    serif: 'Georgia',
  },
  size: {
    label: 12,
    caption: 14,
    body: 16,
    title: 20,
    headingM: 24,
    headingL: 32,
    headingXL: 40,
    display: 56,
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
  }
};

// Reusable elevation tokens (Soft, diffused shadows)
export const elevation = {
  surface: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  floatingCard: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 28,
    elevation: 10,
  },
  modal: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 20,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 5,
  },
};

export const borderRadii = {
  sm: 6,
  md: 12,
  lg: 20,
  xl: 28,
  full: 9999,
};

// Spring configurations for Motion Layer
export const springs = {
  gentle: { damping: 22, stiffness: 120, mass: 1 },
  bouncy: { damping: 14, stiffness: 160, mass: 0.9 },
  slow: { damping: 32, stiffness: 60, mass: 1.4 },
  cinematic: { damping: 38, stiffness: 70, mass: 1.8 },
  dock: { damping: 24, stiffness: 180, mass: 0.8 },
};

// Semantic Motion presets
export const motion = {
  durations: {
    fast: 150,
    medium: 250,
    base: 350,
    slow: 550,
    cinematic: 1200,
  },
  presets: {
    screenEnter: { spring: springs.cinematic, delay: 0 },
    cardPress: { spring: springs.gentle, scale: 0.96 },
    portalTransition: { duration: 1200 },
  }
};
