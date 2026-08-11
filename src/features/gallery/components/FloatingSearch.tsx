import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Keyboard,
  Pressable,
  TextInput,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  useSharedValue,
  interpolateColor,
  interpolate,
} from 'react-native-reanimated';
import { Search, X, Sparkles, SlidersHorizontal, Check } from 'lucide-react-native';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { BlurView } from 'expo-blur';
import { Typography } from '../../../design/components/Typography';
import { usePressEffect } from '../../../experience/interactions/usePressEffect';

// ─── Filter options ────────────────────────────────────────────────────────

export type FilterValue = 'ALL' | 'A-M' | 'N-Z';

const FILTER_OPTIONS: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'A – M', value: 'A-M' },
  { label: 'N – Z', value: 'N-Z' },
];

// ─── Props ─────────────────────────────────────────────────────────────────

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  filter?: FilterValue;
  onFilterChange?: (val: FilterValue) => void;
  placeholder?: string;
}

// ─── Sub-components ────────────────────────────────────────────────────────

const ClearButton = ({ onPress }: { onPress: () => void }) => {
  const { theme } = useAppTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressEffect(0.8);
  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={() => { onPress(); Keyboard.dismiss(); }}
        hitSlop={8}
        style={[styles.clearBtn, { backgroundColor: theme.colors.borderGlass }]}
      >
        <X size={13} color={theme.colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
};

// ─── Inline filter chips (shown below search row) ──────────────────────────

interface FilterChipsProps {
  visible: boolean;
  filter: FilterValue;
  onSelect: (val: FilterValue) => void;
}

const FilterChips = ({ visible, filter, onSelect }: FilterChipsProps) => {
  const { theme } = useAppTheme();
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withSpring(visible ? 1 : 0, { damping: 18, stiffness: 200 });
  }, [visible]);

  const wrapperStyle = useAnimatedStyle(() => ({
    opacity: anim.value,
    maxHeight: interpolate(anim.value, [0, 1], [0, 48]),
    transform: [{ translateY: interpolate(anim.value, [0, 1], [-6, 0]) }],
    overflow: 'hidden',
    marginTop: interpolate(anim.value, [0, 1], [0, 6]),
  }));

  return (
    <Animated.View style={[styles.chipsRow, wrapperStyle]}>
      {FILTER_OPTIONS.map((opt) => {
        const isActive = filter === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? theme.colors.accent
                  : theme.colors.surfaceGlass,
                borderColor: isActive
                  ? theme.colors.accent
                  : theme.colors.border,
              },
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            {isActive && <Check size={11} color="#fff" style={{ marginRight: 4 }} />}
            <Typography
              variant="label"
              weight={isActive ? 'bold' : 'medium'}
              color={isActive ? '#fff' : theme.colors.textSecondary}
            >
              {opt.label}
            </Typography>
          </Pressable>
        );
      })}
    </Animated.View>
  );
};

// ─── Main component ────────────────────────────────────────────────────────

export const FloatingSearch = ({
  value,
  onChangeText,
  filter = 'ALL',
  onFilterChange,
  placeholder = 'Search by artist...',
}: SearchBarProps) => {
  const { theme, isDark } = useAppTheme();
  const isFocused = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const [filterOpen, setFilterOpen] = React.useState(false);
  const inputRef = React.useRef<TextInput>(null);

  // Centralized glow token, not a scattered inline rgba() literal. Built as
  // plain strings here (not a function) so useAnimatedStyle's worklets can
  // safely close over them — calling a non-worklet helper function from
  // inside a worklet is the exact pattern that once caused a native crash
  // in this app (see the cave-intro post-mortem).
  const [glowR, glowG, glowB] = theme.glow.primary.rgb;
  const glowBorderIdle = `rgba(${glowR}, ${glowG}, ${glowB}, ${theme.glow.primary.medium})`;
  const glowPillBg = `rgba(${glowR}, ${glowG}, ${glowB}, ${theme.glow.primary.low})`;
  const glowPillBorder = `rgba(${glowR}, ${glowG}, ${glowB}, ${theme.glow.primary.medium})`;

  useEffect(() => {
    glowPulse.value = withRepeat(withTiming(1, { duration: theme.motion.durations.glowBreathe }), -1, true);
  }, []);

  const rowStyle = useAnimatedStyle(() => {
    const activeGlow = isFocused.value ? 1 : glowPulse.value * 0.35;
    return {
      backgroundColor: theme.colors.surfaceGlass,
      borderColor: interpolateColor(
        isFocused.value,
        [0, 1],
        [glowBorderIdle, theme.colors.accent]
      ),
      shadowColor: theme.colors.accent,
      shadowOpacity: interpolate(activeGlow, [0, 1], [0.08, 0.32]),
      shadowRadius: interpolate(activeGlow, [0, 1], [4, 18]),
      transform: [{ scale: withSpring(isFocused.value ? 1.015 : 1, theme.springs.bouncy) }],
    };
  });

  const searchIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(
          isFocused.value ? 1.18 : interpolate(glowPulse.value, [0, 1], [1, 1.08]),
          theme.springs.bouncy
        ),
      },
    ],
  }));

  const filterActive = filter !== 'ALL';

  return (
    <View style={styles.wrapper}>
      {/* ── Search + Filter row ── */}
      <Animated.View style={[styles.row, rowStyle]}>
        <BlurView
          intensity={isDark ? 30 : 55}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />

        {/* Search icon */}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          hitSlop={6}
          style={styles.searchIconWrap}
        >
          <Animated.View style={[styles.searchPill, { backgroundColor: glowPillBg, borderColor: glowPillBorder }, searchIconStyle]}>
            <Search size={15} color={theme.colors.accent} />
          </Animated.View>
        </Pressable>

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: theme.colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={() => { isFocused.value = 1; }}
          onBlur={() => { isFocused.value = 0; }}
          returnKeyType="search"
          autoCorrect={false}
        />

        {/* Clear button */}
        {value.length > 0 && (
          <ClearButton onPress={() => onChangeText('')} />
        )}

        {/* Divider + Filter pill — only when onFilterChange is provided */}
        {onFilterChange && (
          <>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <Pressable
              onPress={() => setFilterOpen((o) => !o)}
              style={[
                styles.filterBtn,
                filterActive && { backgroundColor: theme.colors.accent + '22' },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Filter: ${filter}`}
              hitSlop={4}
            >
              <SlidersHorizontal
                size={15}
                color={filterActive ? theme.colors.accent : theme.colors.textSecondary}
              />
              {filterActive && (
                <View style={[styles.filterDot, { backgroundColor: theme.colors.accent }]} />
              )}
            </Pressable>
          </>
        )}
      </Animated.View>

      {/* ── Filter chips ── */}
      {onFilterChange && (
        <FilterChips
          visible={filterOpen}
          filter={filter}
          onSelect={(v) => {
            onFilterChange(v);
            setFilterOpen(false);
          }}
        />
      )}
    </View>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1.5,
    height: 42,           // slim pill height
    paddingLeft: 4,
    paddingRight: 6,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  searchIconWrap: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchPill: {
    padding: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: 'System',
    paddingVertical: 0,
    paddingHorizontal: 8,
    height: '100%',
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 20,
    marginHorizontal: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    position: 'relative',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    top: 3,
    right: 3,
  },

  // Filter chips row
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    borderWidth: 1,
  },
});
