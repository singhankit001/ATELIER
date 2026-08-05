import React from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Compass, Heart, User } from 'lucide-react-native';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

/**
 * FloatingGlassNav
 * Floating glass capsule navigation dock inspired by Apple Vision Pro & Arc Browser.
 */
export const FloatingGlassNav: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const activeIndex = state.index;

  const tabWidth = (width - theme.spacing.xl * 2 - theme.spacing.md * 2) / state.routes.length;

  const pillAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: withSpring(activeIndex * tabWidth, theme.springs.dock) }
      ],
    };
  });

  const pillBg = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.7)';
  const pillBorder = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.9)';

  return (
    <View style={[styles.dockWrapper, { bottom: Math.max(insets.bottom, 20) }]} pointerEvents="box-none">
      <View style={[
        styles.dockContainer,
        {
          width: width - theme.spacing.xl * 2,
          backgroundColor: theme.colors.surfaceGlass,
          borderColor: theme.colors.borderGlass,
        }
      ]}>
        <BlurView intensity={isDark ? 40 : 50} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />

        {/* Active Pill Indicator */}
        <Animated.View style={[
          styles.activePill,
          { width: tabWidth, backgroundColor: pillBg, borderColor: pillBorder },
          pillAnimatedStyle
        ]} />

        {/* Tab Buttons */}
        <View style={styles.tabRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const getIcon = () => {
              const color = isFocused ? theme.colors.primary : theme.colors.textSecondary;
              const size = 22;
              switch (route.name) {
                case 'Gallery': return <Compass color={color} size={size} />;
                case 'Favorites': return <Heart color={color} fill={isFocused ? theme.colors.accent : 'transparent'} size={size} />;
                case 'Profile': return <User color={color} size={size} />;
                default: return <Compass color={color} size={size} />;
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabButton}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={route.name}
              >
                {getIcon()}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 90,
  },
  dockContainer: {
    height: 64,
    borderRadius: 9999,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 20,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    zIndex: 2,
  },
  tabButton: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePill: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 16,
    borderRadius: 9999,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 1,
  },
});
