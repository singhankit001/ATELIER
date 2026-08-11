import React from 'react';
import { Modal, StyleSheet, View, Pressable } from 'react-native';
import { useAppTheme } from '../../core/theme/ThemeProvider';
import { Typography } from './Typography';
import { Button } from './Button';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({ 
  visible, 
  title, 
  description, 
  confirmLabel, 
  cancelLabel = 'Cancel', 
  isDestructive = false,
  onConfirm, 
  onCancel 
}: ConfirmDialogProps) => {
  const { theme } = useAppTheme();

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <Animated.View 
          entering={SlideInDown.duration(300).springify()}
          style={[styles.dialog, { backgroundColor: theme.colors.surface, shadowColor: theme.elevation.modal.shadowColor }]}
        >
          <Typography variant="headingM" weight="bold" style={{ marginBottom: theme.spacing.sm }}>
            {title}
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} style={{ marginBottom: theme.spacing.xl }}>
            {description}
          </Typography>

          <View style={styles.actions}>
            <View style={{ flex: 1, marginRight: theme.spacing.md }}>
              <Button label={cancelLabel} variant="secondary" onPress={onCancel} />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                label={confirmLabel}
                variant={isDestructive ? 'danger' : 'primary'}
                onPress={onConfirm}
              />
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 16,
  },
  actions: {
    flexDirection: 'row',
  }
});
