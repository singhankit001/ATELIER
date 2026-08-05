import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GalleryScreen } from '../features/gallery/screens/GalleryScreen';
import { FavoritesScreen } from '../features/favorites/screens/FavoritesScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { theme } from '../core/theme/theme';
import { Compass, Heart, User } from 'lucide-react-native';

import { FloatingGlassNav } from './components/FloatingGlassNav';

const Tab = createBottomTabNavigator();

export const AppNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingGlassNav {...props} />}
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen name="Gallery" component={GalleryScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
