import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import * as Location from 'expo-location';
import { MapPin, X, Search, ChevronRight, LocateFixed } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { useIlluminatedPress } from '../../experience/interactions/useIlluminatedPress';
import { Typography } from './Typography';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocationSuggestion {
  place_id: number;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    district?: string;
    suburb?: string;
    road?: string;
    postcode?: string;
    neighbourhood?: string;
  };
  lat: string;
  lon: string;
}

export interface LocationValue {
  displayName: string;
  city: string;
  state: string;
  pincode?: string;
}

interface LocationAutocompleteProps {
  label: string;
  value: string; // current saved display value (used only for initial display)
  onSelect: (location: LocationValue) => void;
  onClear?: () => void;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildShortLabel(item: LocationSuggestion): string {
  const a = item.address;
  const city =
    a.city || a.town || a.village || a.suburb || a.neighbourhood || a.district || '';
  const state = a.state || '';
  if (city && state) return `${city}, ${state}`;
  if (city) return city;
  if (state) return state;
  const parts = item.display_name.split(',').map((s) => s.trim());
  return parts.slice(0, 2).join(', ');
}

function extractCity(item: LocationSuggestion): string {
  const a = item.address;
  return (
    a.city || a.town || a.village || a.suburb || a.neighbourhood || a.district || ''
  );
}

// ---------------------------------------------------------------------------
// Nominatim API — India only
// ---------------------------------------------------------------------------

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

async function searchIndia(query: string): Promise<LocationSuggestion[]> {
  if (query.trim().length < 2) return [];

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?format=json` +
    `&addressdetails=1` +
    `&countrycodes=in` +
    `&limit=10` +
    `&featuretype=city,town,village,suburb,district,state` +
    `&q=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PremiumGalleryApp/1.0',
      'Accept-Language': 'en-IN,en;q=0.9',
    },
  });

  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data: LocationSuggestion[] = await res.json();
  return data;
}

/**
 * Reverse-geocodes device coordinates into a LocationSuggestion, and
 * enforces the same India-only constraint as the text search above.
 */
async function reverseGeocodeIndia(latitude: number, longitude: number): Promise<LocationSuggestion> {
  const url =
    `https://nominatim.openstreetmap.org/reverse` +
    `?format=json&addressdetails=1&zoom=16` +
    `&lat=${latitude}&lon=${longitude}`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PremiumGalleryApp/1.0',
      'Accept-Language': 'en-IN,en;q=0.9',
    },
  });

  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = await res.json();

  if (!data || data.error) {
    throw new Error('Could not determine your address from this location.');
  }
  if (data.address?.country_code !== 'in') {
    throw new Error('ATELIER currently supports Indian addresses. Please search manually instead.');
  }

  return {
    place_id: data.place_id,
    display_name: data.display_name,
    address: data.address,
    lat: String(latitude),
    lon: String(longitude),
  };
}

const GPS_TIMEOUT_MS = 15000;

/**
 * Requests permission, reads the device's current position, and reverse
 * geocodes it. Throws human-readable errors — permission denial is never
 * a crash, and the caller can always fall back to manual search.
 *
 * `getCurrentPositionAsync` has no built-in timeout — indoors, or on a
 * simulator with no location fixture configured, it can hang indefinitely.
 * Racing it against a timeout means "Locating…" can never spin forever.
 */
async function getCurrentLocationSuggestion(): Promise<LocationSuggestion> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission is required to automatically detect your address.');
  }

  const position = await Promise.race([
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Could not get your location in time. Please try again or search manually.')), GPS_TIMEOUT_MS)
    ),
  ]);

  return reverseGeocodeIndia(position.coords.latitude, position.coords.longitude);
}

// ---------------------------------------------------------------------------
// "Use my current location" — premium glass control with press+glow
// ---------------------------------------------------------------------------

const CurrentLocationButton = ({ onPress, locating }: { onPress: () => void; locating: boolean }) => {
  const { theme } = useAppTheme();
  const { animatedStyle, glowStyle, onPressIn, onPressOut } = useIlluminatedPress(0.97);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={locating}
      accessibilityRole="button"
      accessibilityLabel="Use my current location"
      accessibilityState={{ disabled: locating, busy: locating }}
      style={styles.currentLocationWrap}
    >
      <Animated.View
        style={[
          styles.currentLocationRow,
          {
            backgroundColor: theme.colors.surfaceGlass02 ?? theme.colors.surfaceGlass,
            borderColor: theme.colors.accent,
            shadowColor: theme.colors.accent,
          },
          animatedStyle,
        ]}
      >
        <Animated.View pointerEvents="none" style={[styles.currentLocationGlow, { backgroundColor: theme.colors.accent }, glowStyle]} />
        {locating ? (
          <ActivityIndicator size="small" color={theme.colors.accent} />
        ) : (
          <LocateFixed size={17} color={theme.colors.accent} />
        )}
        <Typography variant="body" weight="medium" color={theme.colors.accent} style={{ marginLeft: 10 }}>
          {locating ? 'Locating…' : 'Use my current location'}
        </Typography>
      </Animated.View>
    </Pressable>
  );
};

// ---------------------------------------------------------------------------
// Search Modal — rendered in a full-screen Modal so dropdown is never clipped
// ---------------------------------------------------------------------------

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: LocationSuggestion) => void;
}

const POPULAR_INDIAN_CITIES: LocationSuggestion[] = [
  { place_id: 101, display_name: 'Mumbai, Maharashtra, India', address: { city: 'Mumbai', state: 'Maharashtra' }, lat: '19.0760', lon: '72.8777' },
  { place_id: 102, display_name: 'New Delhi, Delhi, India', address: { city: 'New Delhi', state: 'Delhi' }, lat: '28.6139', lon: '77.2090' },
  { place_id: 103, display_name: 'Bengaluru, Karnataka, India', address: { city: 'Bengaluru', state: 'Karnataka' }, lat: '12.9716', lon: '77.5946' },
  { place_id: 104, display_name: 'Hyderabad, Telangana, India', address: { city: 'Hyderabad', state: 'Telangana' }, lat: '17.3850', lon: '78.4867' },
  { place_id: 105, display_name: 'Chennai, Tamil Nadu, India', address: { city: 'Chennai', state: 'Tamil Nadu' }, lat: '13.0827', lon: '80.2707' },
  { place_id: 106, display_name: 'Kolkata, West Bengal, India', address: { city: 'Kolkata', state: 'West Bengal' }, lat: '22.5726', lon: '88.3639' },
  { place_id: 107, display_name: 'Pune, Maharashtra, India', address: { city: 'Pune', state: 'Maharashtra' }, lat: '18.5204', lon: '73.8567' },
  { place_id: 108, display_name: 'Jaipur, Rajasthan, India', address: { city: 'Jaipur', state: 'Rajasthan' }, lat: '26.9124', lon: '75.7873' },
];

const SearchModal: React.FC<SearchModalProps> = ({ visible, onClose, onSelect }) => {
  const { theme } = useAppTheme();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>(POPULAR_INDIAN_CITIES);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const fetch_ = useCallback((text: string) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (text.trim().length < 2) {
      setSuggestions(POPULAR_INDIAN_CITIES);
      setSearched(false);
      return;
    }
    debounceTimer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchIndia(text);
        setSuggestions(results);
        setSearched(true);
      } catch {
        setSuggestions([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const handleClose = () => {
    setQuery('');
    setSuggestions(POPULAR_INDIAN_CITIES);
    setSearched(false);
    setLocateError(null);
    onClose();
  };

  const handleUseCurrentLocation = useCallback(async () => {
    if (locating) return;
    setLocateError(null);
    setLocating(true);
    try {
      const suggestion = await getCurrentLocationSuggestion();
      onSelect(suggestion);
      handleClose();
    } catch (error) {
      setLocateError(error instanceof Error ? error.message : 'Unable to fetch your current location.');
    } finally {
      setLocating(false);
    }
  }, [locating, onSelect]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView
        style={[styles.modalRoot, { backgroundColor: theme.colors.background }]}
      >
        {/* Modal header */}
        <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
          <Typography variant="title" weight="bold">
            Select City in India
          </Typography>
          <Pressable onPress={handleClose} hitSlop={16} style={styles.modalClose}>
            <X size={22} color={theme.colors.textPrimary} />
          </Pressable>
        </View>

        {/* Search bar */}
        <View
          style={[
            styles.modalSearchBar,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.accent,
            },
          ]}
        >
          <Search size={18} color={theme.colors.accent} />
          <TextInput
            ref={inputRef}
            autoFocus
            style={[styles.modalInput, { color: theme.colors.textPrimary }]}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              fetch_(t);
            }}
            placeholder="Search city, area or district in India..."
            placeholderTextColor={theme.colors.textTertiary}
            autoCorrect={false}
            autoCapitalize="words"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {loading && (
            <ActivityIndicator size="small" color={theme.colors.accent} style={{ marginLeft: 6 }} />
          )}
        </View>

        {/* Use my current location */}
        <CurrentLocationButton onPress={handleUseCurrentLocation} locating={locating} />
        {locateError ? (
          <Typography
            variant="label"
            color={theme.colors.error}
            style={styles.locateError}
          >
            {locateError}
          </Typography>
        ) : null}

        {!query.trim() && (
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 }}>
            <Typography variant="caption" weight="bold" color={theme.colors.accent} style={{ letterSpacing: 1.1 }}>
              RECOMMENDED INDIAN CITIES
            </Typography>
          </View>
        )}

        {/* Results list */}
        <FlatList
          data={suggestions}
          keyExtractor={(item) => String(item.place_id)}
          keyboardShouldPersistTaps="always"
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: theme.colors.border }]} />
          )}
          renderItem={({ item }) => {
            const a = item.address;
            const city =
              a.city || a.town || a.village || a.suburb || a.neighbourhood || a.district || '';
            const state = a.state || '';
            const district =
              a.district && a.district !== city ? a.district : '';
            const subLabel = [district, state].filter(Boolean).join(', ');

            return (
              <Pressable
                onPress={() => {
                  onSelect(item);
                  handleClose();
                }}
                style={({ pressed }) => [
                  styles.resultRow,
                  pressed && { backgroundColor: theme.colors.surfaceHighlight },
                ]}
                accessibilityRole="button"
              >
                <MapPin
                  size={16}
                  color={theme.colors.accent}
                  style={{ marginTop: 3, flexShrink: 0 }}
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Typography variant="body" weight="medium" numberOfLines={1}>
                    {city || buildShortLabel(item)}
                  </Typography>
                  {subLabel ? (
                    <Typography
                      variant="caption"
                      color={theme.colors.textSecondary}
                      numberOfLines={1}
                    >
                      {subLabel}
                    </Typography>
                  ) : null}
                </View>
                <ChevronRight size={14} color={theme.colors.textTertiary} />
              </Pressable>
            );
          }}
          ListEmptyComponent={
            searched && suggestions.length === 0 ? (
              <View style={styles.emptyState}>
                <Search size={32} color={theme.colors.textTertiary} />
                <Typography
                  variant="body"
                  color={theme.colors.textSecondary}
                  style={{ marginTop: 12, textAlign: 'center' }}
                >
                  No locations found in India
                </Typography>
                <Typography
                  variant="caption"
                  color={theme.colors.textTertiary}
                  style={{ marginTop: 4, textAlign: 'center' }}
                >
                  Try a city name like "Mumbai" or "Bengaluru"
                </Typography>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Main LocationAutocomplete widget (triggers the search modal)
// ---------------------------------------------------------------------------

export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  label,
  value,
  onSelect,
  onClear,
  error,
}) => {
  const { theme } = useAppTheme();
  const [modalOpen, setModalOpen] = useState(false);
  // Display value: only show saved value if it looks like a real location
  // (not just a country name like "India" with no city info)
  const [displayValue, setDisplayValue] = useState(value || '');

  const handleSelect = (item: LocationSuggestion) => {
    const shortLabel = buildShortLabel(item);
    setDisplayValue(shortLabel);
    onSelect({
      displayName: shortLabel,
      city: extractCity(item),
      state: item.address.state || '',
      pincode: item.address.postcode,
    });
  };

  const handleClear = () => {
    setDisplayValue('');
    onClear?.();
    onSelect({ displayName: '', city: '', state: '' });
  };

  const hasValue = displayValue.length > 0;

  return (
    <View style={styles.widget}>
      <Typography
        variant="caption"
        color={theme.colors.textSecondary}
        style={styles.widgetLabel}
      >
        {label}
      </Typography>

      {/* Tappable field — opens search modal */}
      <Pressable
        onPress={() => setModalOpen(true)}
        style={[
          styles.widgetRow,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${hasValue ? `Selected: ${displayValue}` : 'Tap to search'}`}
      >
        <MapPin
          size={18}
          color={hasValue ? theme.colors.accent : theme.colors.textTertiary}
          style={{ marginRight: 10, flexShrink: 0 }}
        />

        <Typography
          variant="body"
          color={hasValue ? theme.colors.textPrimary : theme.colors.textTertiary}
          style={{ flex: 1 }}
          numberOfLines={1}
        >
          {hasValue ? displayValue : 'Search city or area in India...'}
        </Typography>

        {hasValue ? (
          <Pressable onPress={handleClear} hitSlop={12} style={{ marginLeft: 8 }}>
            <X size={16} color={theme.colors.textSecondary} />
          </Pressable>
        ) : (
          <Search size={16} color={theme.colors.textTertiary} style={{ marginLeft: 8 }} />
        )}
      </Pressable>

      {error ? (
        <Typography variant="label" color={theme.colors.error} style={styles.widgetError}>
          {error}
        </Typography>
      ) : null}

      <SearchModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleSelect}
      />
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Widget styles
  widget: {
    marginBottom: 8,
  },
  widgetLabel: {
    marginBottom: 6,
    marginLeft: 2,
  },
  widgetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 14,
  },
  widgetError: {
    marginTop: 4,
    marginLeft: 4,
  },

  // "Use my current location" button
  currentLocationWrap: {
    marginHorizontal: 16,
    marginBottom: 4,
  },
  currentLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    height: 48,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  currentLocationGlow: {
    ...StyleSheet.absoluteFill,
    opacity: 0,
  },
  locateError: {
    marginHorizontal: 20,
    marginTop: 8,
  },

  // Modal styles
  modalRoot: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalClose: {
    padding: 4,
  },
  modalSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'System',
    padding: 0,
  },
  listContent: {
    paddingHorizontal: 4,
    paddingBottom: 40,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
});
