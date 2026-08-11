import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useFavoritesStore } from '../features/favorites/store/useFavoritesStore';
import { useThemeStore } from '../core/theme/useThemeStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../core/theme/ThemeProvider';
import { AuthTransitionOverlay } from '../experience/scene/AuthTransitionOverlay';
import { ErrorBoundary } from '../core/error/ErrorBoundary';

export const RootNavigator = () => {
  const { theme } = useAppTheme();
  const { isAuthenticated, isInitializing, hydrate: hydrateAuth } = useAuthStore();
  const hydrateFavorites = useFavoritesStore(state => state.hydrate);
  // Was previously never called anywhere — setMode() faithfully wrote
  // THEME_MODE to AsyncStorage on every change, but nothing ever read it
  // back on launch, so a user's Dark/Light choice silently reverted to
  // System after every restart despite genuinely being persisted.
  const hydrateTheme = useThemeStore(state => state.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateFavorites();
    hydrateTheme();
  }, [hydrateAuth, hydrateFavorites, hydrateTheme]);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ErrorBoundary name="NavigationContainer">
        <NavigationContainer>
          {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
      </ErrorBoundary>
      <ErrorBoundary name="AuthTransitionOverlay">
        <AuthTransitionOverlay />
      </ErrorBoundary>
    </View>
  );
};
