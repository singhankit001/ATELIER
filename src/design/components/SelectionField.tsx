import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '../../core/theme/theme';
import { Typography } from './Typography';
import { usePressEffect } from '../../experience/interactions/usePressEffect';
import { Check, ChevronDown } from 'lucide-react-native';

export interface Option {
  label: string;
  value: string;
}

export interface SelectionFieldProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  variant: 'dropdown' | 'radio';
  error?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const DropdownOption = React.memo(({ 
  option, 
  isSelected, 
  onSelect 
}: { 
  option: Option; 
  isSelected: boolean; 
  onSelect: () => void 
}) => {
  const { animatedStyle, onPressIn, onPressOut } = usePressEffect(0.98);
  
  return (
    <AnimatedPressable
      onPress={onSelect}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={option.label}
      style={[
        styles.dropdownOption,
        isSelected && styles.dropdownOptionSelected,
        animatedStyle,
      ]}
    >
      <Typography 
        variant="body" 
        color={isSelected ? theme.colors.accent : theme.colors.textSecondary}
        weight={isSelected ? 'bold' : 'regular'}
      >
        {option.label}
      </Typography>
      {isSelected && <Check size={18} color={theme.colors.accent} />}
    </AnimatedPressable>
  );
});

const RadioOption = React.memo(({ 
  option, 
  isSelected, 
  onSelect 
}: { 
  option: Option; 
  isSelected: boolean; 
  onSelect: () => void 
}) => {
  const { animatedStyle, onPressIn, onPressOut } = usePressEffect(theme.motion.presets.cardPress.scale);
  const selectAnim = useSharedValue(isSelected ? 1 : 0);
  
  React.useEffect(() => {
    selectAnim.value = withSpring(isSelected ? 1 : 0, theme.springs.bouncy);
  }, [isSelected, selectAnim]);

  const stylez = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        selectAnim.value,
        [0, 1],
        [theme.colors.surface, theme.colors.surfaceGlass]
      ),
      borderColor: interpolateColor(
        selectAnim.value,
        [0, 1],
        [theme.colors.border, theme.colors.accent]
      ),
      shadowOpacity: interpolate(selectAnim.value, [0, 1], [0.05, 0.2]),
      shadowColor: theme.colors.accent,
      shadowRadius: interpolate(selectAnim.value, [0, 1], [4, 12]),
    };
  });

  return (
    <AnimatedPressable
      onPress={onSelect}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={option.label}
      style={[styles.radioCard, animatedStyle, stylez]}
    >
      <Typography 
        variant="body" 
        weight={isSelected ? 'bold' : 'medium'}
        color={isSelected ? theme.colors.accent : theme.colors.textSecondary}
      >
        {option.label}
      </Typography>
    </AnimatedPressable>
  );
});

export const SelectionField = ({
  label,
  options,
  value,
  onChange,
  variant,
  error,
}: SelectionFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const openAnim = useSharedValue(0);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    openAnim.value = withSpring(isOpen ? 0 : 1, theme.springs.gentle);
  };

  const handleSelect = (val: string) => {
    onChange(val);
    if (variant === 'dropdown') {
      setIsOpen(false);
      openAnim.value = withSpring(0, theme.springs.gentle);
    }
  };

  const dropdownContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: openAnim.value,
      maxHeight: interpolate(openAnim.value, [0, 1], [0, 300]),
      transform: [
        { translateY: interpolate(openAnim.value, [0, 1], [-10, 0]) }
      ],
      marginBottom: interpolate(openAnim.value, [0, 1], [0, theme.spacing.md])
    };
  });

  const chevronStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(openAnim.value, [0, 1], [0, 180])}deg` }
      ]
    };
  });

  if (variant === 'radio') {
    return (
      <View style={styles.container}>
        <Typography variant="caption" color={theme.colors.textSecondary} style={styles.label}>
          {label}
        </Typography>
        <View style={styles.radioGroup}>
          {options.map((opt) => (
            <RadioOption
              key={opt.value}
              option={opt}
              isSelected={value === opt.value}
              onSelect={() => handleSelect(opt.value)}
            />
          ))}
        </View>
        {error && (
          <Typography variant="label" color={theme.colors.error} style={styles.errorText}>
            {error}
          </Typography>
        )}
      </View>
    );
  }

  const selectedOption = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      <Pressable 
        onPress={toggleOpen} 
        style={[styles.dropdownHeader, isOpen && styles.dropdownHeaderOpen]}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={`${label}. ${selectedOption ? `Selected ${selectedOption.label}` : 'Select an option'}`}
      >
        <View style={styles.dropdownLabelContainer}>
          <Typography variant="caption" color={theme.colors.textSecondary}>
            {label}
          </Typography>
          {value ? (
            <Typography variant="body" weight="bold" color={theme.colors.accent} style={{ marginTop: 2 }}>
              {selectedOption?.label}
            </Typography>
          ) : null}
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={18} color={theme.colors.accent} />
        </Animated.View>
      </Pressable>
      
      <Animated.View style={[styles.dropdownList, dropdownContainerStyle]} pointerEvents={isOpen ? 'auto' : 'none'}>
        {options.map((opt) => (
          <DropdownOption
            key={opt.value}
            option={opt}
            isSelected={value === opt.value}
            onSelect={() => handleSelect(opt.value)}
          />
        ))}
      </Animated.View>

      {error && (
        <Typography variant="label" color={theme.colors.error} style={styles.errorText}>
          {error}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
    zIndex: 1,
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  radioCard: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadii.full,
    borderWidth: 1,
    ...theme.elevation.surface,
  },
  dropdownHeader: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadii.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    height: theme.spacing.huge,
    justifyContent: 'center',
  },
  dropdownHeaderOpen: {
    borderColor: theme.colors.primary,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  dropdownLabelContainer: {
    justifyContent: 'center',
  },
  dropdownList: {
    backgroundColor: theme.colors.surfaceGlass,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: theme.colors.borderGlass,
    borderBottomLeftRadius: theme.borderRadii.md,
    borderBottomRightRadius: theme.borderRadii.md,
    overflow: 'hidden',
    ...theme.elevation.floatingCard,
  },
  dropdownOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownOptionSelected: {
    backgroundColor: theme.colors.surface,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
