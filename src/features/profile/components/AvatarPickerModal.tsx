import React from 'react';
import { Modal, StyleSheet, View, Pressable, FlatList } from 'react-native';
import { Image } from 'expo-image';
import { X, CheckCircle2 } from 'lucide-react-native';
import { useAppTheme } from '../../../core/theme/ThemeProvider';
import { Typography } from '../../../design/components/Typography';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { usePressEffect } from '../../../experience/interactions/usePressEffect';
import Animated from 'react-native-reanimated';

// 6 fixed "museum-quality" portraits from Picsum API
const BUNDLED_AVATARS = [
  'https://picsum.photos/id/64/400/400',
  'https://picsum.photos/id/65/400/400',
  'https://picsum.photos/id/91/400/400',
  'https://picsum.photos/id/177/400/400',
  'https://picsum.photos/id/338/400/400',
  'https://picsum.photos/id/349/400/400',
];

interface AvatarPickerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AvatarPickerModal = ({ visible, onClose }: AvatarPickerModalProps) => {
  const { theme } = useAppTheme();
  const { user, updateProfile } = useAuthStore();

  const handleSelect = async (url: string) => {
    await updateProfile({ avatarUrl: url });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={onClose} hitSlop={16} accessibilityLabel="Close avatar picker">
            <X color={theme.colors.textPrimary} size={24} />
          </Pressable>
          <Typography variant="title" weight="bold">Select Avatar</Typography>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={BUNDLED_AVATARS}
          keyExtractor={(item) => item}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => {
            const isSelected = user?.avatarUrl === item;
            return (
              <AvatarOption 
                url={item} 
                isSelected={isSelected} 
                onSelect={() => handleSelect(item)} 
              />
            );
          }}
        />
      </View>
    </Modal>
  );
};

const AvatarOption = ({ url, isSelected, onSelect }: { url: string, isSelected: boolean, onSelect: () => void }) => {
  const { theme } = useAppTheme();
  const { animatedStyle, onPressIn, onPressOut } = usePressEffect(0.95);

  return (
    <Animated.View style={[styles.avatarWrapper, animatedStyle]}>
      <Pressable 
        onPress={onSelect}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={[
          styles.avatarContainer,
          { borderColor: isSelected ? theme.colors.primary : 'transparent' }
        ]}
        accessibilityRole="imagebutton"
        accessibilityLabel={isSelected ? "Selected avatar" : "Select this avatar"}
      >
        <Image source={{ uri: url }} style={styles.image} contentFit="cover" transition={200} />
        {isSelected && (
          <View style={[styles.selectedOverlay, { backgroundColor: theme.colors.primary }]}>
            <CheckCircle2 color={theme.colors.surface} size={24} />
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  grid: {
    padding: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  avatarWrapper: {
    width: '46%',
    aspectRatio: 1,
  },
  avatarContainer: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  }
});
