import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from './useThemeStore';
import { lightColors, darkColors, spacing, typography, elevation, borderRadii, springs, motion, glassLevels, glow } from './tokens';
import { Theme } from './theme';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const mode = useThemeStore((state) => state.mode);
  const systemColorScheme = useColorScheme();

  const isDark = useMemo(() => {
    if (mode === 'system') return systemColorScheme === 'dark';
    return mode === 'dark';
  }, [mode, systemColorScheme]);

  const activeTheme = useMemo<Theme>(() => ({
    colors: isDark ? darkColors : lightColors,
    spacing,
    typography,
    elevation,
    borderRadii,
    springs,
    motion,
    glassLevels,
    glow,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};
