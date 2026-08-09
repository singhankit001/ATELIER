import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { AnimatedStyle } from 'react-native-reanimated';
import { useSeenOnce } from '../../core/hooks/useSeenOnce';
import { useCaveIntro } from './useCaveIntro';
import { useCaveDrift } from './useCaveDrift';
import { CaveBackground } from './CaveBackground';

const CAVE_INTRO_SEEN_KEY = 'ATELIER_CAVE_INTRO_SEEN';

export interface CaveReveal {
  logoStyle: AnimatedStyle<ViewStyle>;
  uiStyle: AnimatedStyle<ViewStyle>;
}

interface CaveSceneProviderProps {
  children: (reveal: CaveReveal) => React.ReactNode;
}

/**
 * CaveSceneProvider
 * Wraps the auth flow (Login + Register) in the cinematic cave environment
 * and choreographs the one-time reveal. Whether this is a first-ever visit
 * is a single persisted flag shared across both screens — hop from Login to
 * Register mid-intro and the environment won't awkwardly replay from black.
 */
export const CaveSceneProvider = ({ children }: CaveSceneProviderProps) => {
  const { hasSeen, markSeen } = useSeenOnce(CAVE_INTRO_SEEN_KEY);
  const play = hasSeen === null ? null : !hasSeen;
  const { wallStyle, logoStyle, uiStyle } = useCaveIntro(play, markSeen);
  const drift = useCaveDrift();

  return (
    <View style={styles.container}>
      <CaveBackground drift={drift} revealStyle={wallStyle} />
      <View style={styles.content}>{children({ logoStyle, uiStyle })}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#08070A',
  },
  content: {
    flex: 1,
    zIndex: 10,
  },
});
