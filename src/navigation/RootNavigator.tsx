import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useFavoritesStore } from '../features/favorites/store/useFavoritesStore';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { View, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../core/theme/ThemeProvider';
import { CinematicTransitionOverlay } from '../experience/scene/CinematicTransitionOverlay';
import { ErrorBoundary } from '../core/error/ErrorBoundary';

export const RootNavigator = () => {
  const { theme } = useAppTheme();
  const { isAuthenticated, isInitializing, hydrate: hydrateAuth } = useAuthStore();
  const hydrateFavorites = useFavoritesStore(state => state.hydrate);

  useEffect(() => {
    hydrateAuth();
    hydrateFavorites();
  }, [hydrateAuth, hydrateFavorites]);

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
      <ErrorBoundary name="CinematicTransitionOverlay">
        <CinematicTransitionOverlay />
      </ErrorBoundary>
    </View>
  );
};
