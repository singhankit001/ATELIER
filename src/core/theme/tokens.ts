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
  // Three-tier glass system — subtle (barely-there sheen) → medium (default
  // card material) → elevated (modals, high-chrome surfaces like the cave UI).
  surfaceGlass01: 'rgba(244, 240, 234, 0.45)',
  surfaceGlass02: 'rgba(244, 240, 234, 0.75)',
  surfaceGlass03: 'rgba(244, 240, 234, 0.92)',
  surfaceGlass: 'rgba(244, 240, 234, 0.75)', // alias of surfaceGlass02, kept for existing call sites
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
  surfaceGlass01: 'rgba(22, 22, 24, 0.45)',
  surfaceGlass02: 'rgba(22, 22, 24, 0.78)',
  surfaceGlass03: 'rgba(22, 22, 24, 0.92)',
  surfaceGlass: 'rgba(22, 22, 24, 0.78)', // alias of surfaceGlass02, kept for existing call sites
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

// Blur intensities paired with the glass tiers above (BlurView `intensity`,
// 0–100, theme-agnostic — tint already varies by isDark at the call site).
export const glassLevels = {
  subtle: 18,
  medium: 32,
  elevated: 50,
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
    micro: 10,
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

// Spring configurations for Motion Layer — the animated glassmorphism
// system's physical "feel". Named by what they're for, not by vibe words,
// so a card press and a favorite pop don't accidentally drift apart just
// because someone tuned one and not the other.
export const springs = {
  press: { damping: 18, stiffness: 260, mass: 0.7 },     // buttons, cards — fast, physical
  card: { damping: 22, stiffness: 180, mass: 0.9 },       // card settle/entry
  favorite: { damping: 12, stiffness: 260, mass: 0.6 },   // heart pop — bouncier, more delight
  navigation: { damping: 26, stiffness: 200, mass: 1 },   // screen transitions — settled, no overshoot
  gentle: { damping: 22, stiffness: 120, mass: 1 },
  bouncy: { damping: 14, stiffness: 160, mass: 0.9 },
  dock: { damping: 24, stiffness: 180, mass: 0.8 },       // tab bar active-pill slide
};

// Semantic Motion presets — durations for feedback, not spectacle.
// Basic interaction (press, focus, toggle) stays in the 120-300ms band;
// nothing in the animated-glassmorphism system should run longer than
// ~500ms outside of the ambient glow breathe (which is deliberately slow).
export const motion = {
  durations: {
    fast: 120,
    normal: 200,
    medium: 300,
    slow: 500,
    glowBreathe: 3200, // one direction of the ambient glow's breathing cycle
  },
  presets: {
    screenEnter: { spring: { damping: 26, stiffness: 200, mass: 1 } }, // == springs.navigation
    cardPress: { spring: { damping: 18, stiffness: 260, mass: 0.7 }, scale: 0.97 }, // == springs.press
  }
};

// Glow tokens — animated ambient/interaction glow reads its color from
// here, never from an arbitrary inline rgba(). `low/medium/high` are
// opacity levels the same glow animates between (e.g. breathing idle vs.
// pressed), not different colors. `rgb` is precomputed so worklets can
// build an animated `rgba(r,g,b,alpha)` string without parsing hex at
// runtime on the UI thread.
export const glow = {
  primary: { color: palette.bronze, rgb: [184, 134, 11] as const, low: 0.12, medium: 0.24, high: 0.4 },
  secondary: { color: palette.champagneGold, rgb: [245, 230, 204] as const, low: 0.1, medium: 0.2, high: 0.35 },
  success: { color: palette.deepOlive, rgb: [85, 107, 47] as const, low: 0.12, medium: 0.24, high: 0.4 },
  error: { color: palette.mutedTerracotta, rgb: [201, 122, 110] as const, low: 0.12, medium: 0.24, high: 0.4 },
};
