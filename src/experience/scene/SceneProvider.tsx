import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MuseumBackground } from './MuseumBackground';

interface SceneProviderProps {
  children: React.ReactNode;
  showArch?: boolean;
}

/**
 * SceneProvider
 * Wraps feature screens to ensure they are rendered within the architectural scene.
 * This completely decouples the background/lighting layer from the feature logic.
 */
export const SceneProvider = ({ children, showArch = false }: SceneProviderProps) => {
  return <MuseumBackground showArch={showArch}>{children}</MuseumBackground>;
};

const styles = StyleSheet.create({
  baseScene: {
    flex: 1,
  }
});
